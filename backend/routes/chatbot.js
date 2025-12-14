const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { analyzeMoviesChat } = require('../services/openaiService');

async function getAggregatedData() {
    try {
        // Aggregate genres from all user histories
        const genreStats = await User.aggregate([
            { $unwind: "$history" },
            { $unwind: "$history.genres" },
            { $group: { _id: "$history.genres", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Aggregate top watched movies
        const movieStats = await User.aggregate([
            { $unwind: "$history" },
            { $group: { _id: "$history.movieId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "embedded_movies", localField: "_id", foreignField: "_id", as: "movie" } },
            { $unwind: "$movie" },
            { $project: { title: "$movie.title", count: 1 } }
        ]);

        return {
            topGenres: genreStats,
            topMovies: movieStats
        };
    } catch (err) {
        console.error("Aggregation Error:", err);
        return null;
    }
}

router.post('/analyze', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "Query is required" });
    }

    try {
        const data = await getAggregatedData();
        if (!data) {
            return res.status(500).json({ message: "Failed to retrieve aggregated data" });
        }

        const context = `
        Current Data Stats:
        Top Genres: ${JSON.stringify(data.topGenres)}
        Top Movies: ${JSON.stringify(data.topMovies)}
        
        If the user asks for a diagram, generate a text-based bar chart (ASCII art) to visualize the data.
        `;

        const response = await analyzeMoviesChat(query, context);
        res.json({ response });

    } catch (err) {
        console.error("Chatbot Error:", err);
        res.status(500).json({ message: "Error processing your request" });
    }
});

module.exports = router;
