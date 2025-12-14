const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  plot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  num_mflix_comments: Number,
  poster: String,
  title: String,
  fullplot: String,
  languages: [String],
  released: Date,
  directors: [String],
  writers: [String],
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  lastupdated: String,
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  countries: [String],
  type: String,
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    dvd: Date,
    critic: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    lastUpdated: Date,
    rotten: Number,
    production: String,
    fresh: Number
  },
  plot_embedding: [Number],
  plot_embedding_voyage_3_large: [Number],
  promotion: Boolean
}, { collection: 'embedded_movies' });

module.exports = mongoose.model('Movie', MovieSchema);
