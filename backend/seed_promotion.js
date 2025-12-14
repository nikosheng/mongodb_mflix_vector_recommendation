const mongoose = require('mongoose');
const Movie = require('./models/Movie');
require('dotenv').config();

async function seedPromotion() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Reset all first
    await Movie.updateMany({}, { $set: { promotion: false } });
    console.log('Reset promotion flags.');

    // Set promotion=true for 50 random movies
    // We can use $sample but updateMany doesn't work with it directly easily without fetching ids.
    const randomMovies = await Movie.aggregate([{ $sample: { size: 50 } }]);
    const ids = randomMovies.map(m => m._id);

    await Movie.updateMany({ _id: { $in: ids } }, { $set: { promotion: true } });
    console.log(`Updated ${ids.length} movies to promotion: true`);

    // Also specifically try to find some Hong Kong movies to promote for the demo case
    const hkMovies = await Movie.find({ countries: "Hong Kong" });
    const hkIds = hkMovies.map(m => m._id);
    if (hkIds.length > 0) {
        await Movie.updateMany({ _id: { $in: hkIds } }, { $set: { promotion: true } });
        console.log(`Updated ${hkIds.length} Hong Kong movies to promotion: true`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding promotion:', error);
    process.exit(1);
  }
}

seedPromotion();
