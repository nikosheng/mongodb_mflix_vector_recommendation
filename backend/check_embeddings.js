const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');

async function checkEmbeddings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await Movie.countDocuments({ plot_embedding: { $exists: true, $not: {$size: 0} } });
    console.log(`Movies with embeddings: ${count}`);

    if (count > 0) {
      const movie = await Movie.findOne({ plot_embedding: { $exists: true, $not: {$size: 0} } }).select('_id title');
      console.log(`Sample movie with embedding: ${movie.title} (ID: ${movie._id})`);
    } else {
        const total = await Movie.countDocuments({});
        console.log(`Total movies: ${total}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkEmbeddings();