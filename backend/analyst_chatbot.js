const mongoose = require('mongoose');
const readline = require('readline');
const { analyzeMoviesChat } = require('./services/openaiService');
const User = require('./models/User');
require('dotenv').config();

// Connect DB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('MongoDB Connected. Initializing Analyst Chatbot...');
    startChat();
})
.catch(err => console.error("MongoDB Connection Error:", err));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getAggregatedData() {
    console.log("Gathering data from user histories...");
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

function startChat() {
    console.log("\n--- Analyst Chatbot ---");
    console.log("Ask me about user viewing trends, popular genres, or request a diagram!");
    console.log("Type 'exit' to quit.\n");

    rl.on('line', async (input) => {
        if (input.trim().toLowerCase() === 'exit') {
            console.log("Goodbye!");
            process.exit(0);
        }

        const data = await getAggregatedData();
        if (!data) {
            console.log("Could not retrieve data.");
            return;
        }

        const context = `
        Current Data Stats:
        Top Genres: ${JSON.stringify(data.topGenres)}
        Top Movies: ${JSON.stringify(data.topMovies)}
        
        If the user asks for a diagram, generate a text-based bar chart (ASCII art) to visualize the data.
        `;

        try {
            process.stdout.write("Analyzing... ");
            const response = await analyzeMoviesChat(input, context);
            console.log("\n\n" + response + "\n");
        } catch (err) {
            console.log("\nError getting response from AI.");
        }
        
        process.stdout.write("> ");
    });

    process.stdout.write("> ");
}
