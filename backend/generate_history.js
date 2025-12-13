const mongoose = require('mongoose');
const User = require('./models/User');
const Movie = require('./models/Movie');
require('dotenv').config();

async function generateHistory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find our test user (Cersei Lannister)
    const user = await User.findOne({ name: 'Bran Stark' });
    if (!user) {
        console.log('User not found!');
        return;
    }

    console.log(`Generating history for: ${user.name}`);

    // Get some random movies with embeddings
    const movies = await Movie.aggregate([
        { $match: { plot_embedding: { $exists: true, $not: {$size: 0} } } },
        { $match: { genres: "Comedy" } },
        { $sample: { size: 5 } }
    ]);

    const history = movies.map(movie => ({
        movieId: movie._id,
        browsingTime: Math.floor(Math.random() * 300) + 30, // Random duration 30s - 330s
        timestamp: new Date()
    }));
    
    // Manually set one movie to have a very high duration to test the logic
    history[0].browsingTime = 9999; 
    console.log(`Set high priority movie: ${movies[0].title} (${movies[0]._id}) with duration 9999s`);

    user.history = history;
    await user.save();

    console.log('History updated successfully!');
    console.log(history);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

generateHistory();