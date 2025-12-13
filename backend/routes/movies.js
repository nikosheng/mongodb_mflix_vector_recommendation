const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

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
      .select('title poster genres year imdb plot');
    
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
