const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { parseMarketingPrompt } = require('../services/marketingAgentService');
const { generateEmbedding } = require('../services/openaiService');

// Get all movies (with pagination and genre filter)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const genre = req.query.genre;

  const query = {};
  if (genre) {
    query.genres = genre;
  }
  
  // Only return movies with posters for better UI
  query.poster = { $exists: true, $ne: null };

  try {
    const movies = await Movie.find(query)
      .sort({ released: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title poster genres year imdb plot cast directors');
    
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vector Search Recommendation Endpoint
router.get('/recommend/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    if (!movie.plot_embedding || movie.plot_embedding.length === 0) {
      return res.status(400).json({ message: 'Movie does not have embedding data' });
    }

    const pipeline = [
      {
        $vectorSearch: {
          index: "mflix_vectorindex",
          path: "plot_embedding",
          queryVector: movie.plot_embedding,
          numCandidates: 100,
          limit: 12
        }
      },
      {
        $match: {
          _id: { $ne: movie._id } // Exclude the movie itself
        }
      },
      {
        $addFields: {
            score: { "$meta": "vectorSearchScore" } // Capture the similarity score
        }
      },
      {
        $sort: {
            score: -1, // Sort by vector search score (highest first)
            released: -1 // Sort by release date (newest first)
        }
      },
      {
        "$project": {
          "title": 1,
          "poster": 1,
          "plot": 1,
          "genres": 1,
          "year": 1,
          "imdb": 1,
          "released": 1,
          "score": 1
        }
      }
    ];

    const recommendations = await Movie.aggregate(pipeline);
    res.json(recommendations);
  } catch (err) {
    console.error("Error in vector search recommendation:", err);
    res.status(500).json({ 
      message: err.message,
      hint: "Ensure the 'mflix_vectorindex' is created in MongoDB Atlas on the 'embedded_movies' collection."
    });
  }
});

// Cold Start / Marketing Promotion Endpoint
router.post('/cold-start', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    // 1. Parse prompt using LangGraph/LLM Agent
    const config = await parseMarketingPrompt(prompt);
    // Expected config: { percentage: number, criteria: string }
    console.log("Marketing Config:", config);
    
    const totalLimit = 20;
    const promotedCount = Math.round(totalLimit * (config.percentage / 100));
    const organicCount = totalLimit - promotedCount;

    let promotedMovies = [];
    let organicMovies = [];

    // 2. Search for Promoted Movies (Vector Search + Filter)
    if (promotedCount > 0) {
       const criteriaEmbedding = await generateEmbedding(config.criteria);
       
       const promotedPipeline = [
          {
              $vectorSearch: {
                  index: "mflix_vectorindex",
                  path: "plot_embedding",
                  queryVector: criteriaEmbedding,
                  numCandidates: 200, // Over-fetch to ensure we find promoted items
                  limit: 100,
                  filter: {
                      $and: [
                          config.filters?.cast && config.filters.cast.length > 0 ? { cast: { $in: config.filters.cast } } : {},
                          config.filters?.country ? { countries: config.filters.country } : {},
                          config.filters?.genre ? { genres: config.filters.genre } : {}
                      ].filter(f => Object.keys(f).length > 0)
                  }
              }
          },
          {
              $match: { promotion: true }
          },
          {
              $limit: promotedCount
          },
          {
              $project: {
                  title: 1, poster: 1, plot: 1, genres: 1, year: 1, imdb: 1, released: 1, promotion: 1, cast: 1, directors: 1,
                  score: { $meta: "vectorSearchScore" }
              }
          }
       ];
       promotedMovies = await Movie.aggregate(promotedPipeline);
    }

    // 3. Search for Organic/Filler Movies (Popularity Fallback)
    if (organicMovies.length < organicCount) {
        // If we didn't find enough promoted movies, we might want to fill the gap or just stick to the plan.
        // Here we stick to the plan for organic count, but maybe fill up if promoted is short?
        // Let's stick to the requested organic count first.
        const currentCount = promotedMovies.length;
        // If we wanted 14 promoted but got 5, should we fetch 6 organic or 15 organic?
        // "Display 70% of prioritized..." implies a ratio.
        // But usually filling the page is more important.
        // Let's just fill the rest of the 20 slots with organic if promoted falls short.
        const neededOrganic = totalLimit - currentCount;
        
        const excludedIds = promotedMovies.map(m => m._id);
        
        organicMovies = await Movie.find({
            _id: { $nin: excludedIds },
            poster: { $exists: true, $ne: null }
        })
        // .sort({ "imdb.votes": -1, "imdb.rating": -1 }) // Popularity
        .limit(neededOrganic)
        .select('title poster plot genres year imdb released promotion cast directors');
    }

    // 4. Combine Results
    const results = [...promotedMovies, ...organicMovies];
    console.log("Movie names:", results.map(m => m.title));
    
    res.json({
        meta: {
            config,
            counts: { promoted: promotedMovies.length, organic: organicMovies.length }
        },
        movies: results
    });

  } catch (err) {
      console.error("Cold start error:", err);
      res.status(500).json({ message: err.message });
  }
});

// Get a single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
