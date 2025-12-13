const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const { generateUserProfile, generateEmbedding } = require('../services/openaiService');

// Login Endpoint (Mock - no password check)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    // Case insensitive search
    const user = await User.findOne({ name: { $regex: new RegExp(`^${username}$`, 'i') } });
    
    if (!user) {
        return res.status(404).json({ message: 'User not found. Try "Cersei Lannister"' });
    }

    // Return user info (excluding password)
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Recommendations based on history
router.get('/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('history.movieId');

    if (!user || !user.history || user.history.length === 0) {
        return res.json([]); // No history, no specific recommendations
    }

    // 1. Find the movie with the max browsing time
    // Filter out history items where movieId is null (deleted movies)
    const validHistory = user.history.filter(h => h.movieId);
    
    if (validHistory.length === 0) return res.json([]);

    // Sort by browsingTime descending
    validHistory.sort((a, b) => b.browsingTime - a.browsingTime);

    // Pick top 1 for now (simplest "more browsing time" logic)
    const topMovie = validHistory[0].movieId;

    if (!topMovie.plot_embedding || topMovie.plot_embedding.length === 0) {
        return res.status(400).json({ message: `Top viewed movie (${topMovie.title}) has no embeddings.` });
    }

    console.log(`Generating recommendations based on top viewed: ${topMovie.title} (${validHistory[0].browsingTime}s)`);

    // 2. Perform Vector Search using this movie's embedding
    const pipeline = [
      {
        $vectorSearch: {
          index: "mflix_vectorindex",
          path: "plot_embedding",
          queryVector: topMovie.plot_embedding,
          numCandidates: 100,
          limit: 12
        }
      },
      {
        $match: {
           // Exclude movies already in history? Optional. Let's just exclude the one used for query
          "_id": { "$ne": topMovie._id }
        }
      },
      {
        $project: {
          title: 1,
          poster: 1,
          plot: 1,
          genres: 1,
          year: 1,
          imdb: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const recommendations = await Movie.aggregate(pipeline);
    
    // Append context so frontend knows WHY these are recommended
    const response = {
        basedOn: topMovie.title,
        recommendations: recommendations
    };

    res.json(response);

  } catch (err) {
    console.error("Error in user recommendations:", err);
    res.status(500).json({ message: err.message });
  }
});

// Record User Activity & Trigger Profiling
router.post('/history', async (req, res) => {
  try {
    const { userId, movieId, browsingTime } = req.body;
    
    if (!userId || !movieId) {
      return res.status(400).json({ message: "userId and movieId are required" });
    }

    const user = await User.findById(userId);
    const movie = await Movie.findById(movieId);

    if (!user || !movie) {
      return res.status(404).json({ message: "User or Movie not found" });
    }

    // Add to history with expanded attributes
    user.history.push({
      movieId: movie._id,
      browsingTime: browsingTime || 0,
      timestamp: new Date(),
      genres: movie.genres || [],
      actors: movie.cast || [],
      languages: movie.languages || []
    });

    // Check if we need to generate/update profile
    // Trigger every 5 activities
    if (user.history.length % 5 === 0) {
      console.log(`Triggering user profile update for ${user.name} (History length: ${user.history.length})`);
      
      // Generate Profile Summary using only the latest 10 history items
      const recentHistory = user.history.slice(-10);
      const profileSummary = await generateUserProfile(recentHistory);
      user.user_profile = profileSummary;

      // Generate Profile Embedding
      if (profileSummary) {
        const embedding = await generateEmbedding(profileSummary);
        user.user_profile_embedding = embedding;
      }
    }

    await user.save();

    res.json({ 
      message: "History recorded successfully", 
      historyLength: user.history.length,
      profileUpdated: user.history.length % 5 === 0 
    });

  } catch (err) {
    console.error("Error recording history:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;