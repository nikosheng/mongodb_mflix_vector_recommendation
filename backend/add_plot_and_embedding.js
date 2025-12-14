const { AzureOpenAI } = require('openai');
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const embedding_apiVersion = "2023-05-15";
const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME; 

// Initialize OpenAI Client
// Note: If using standard OpenAI, the initialization would be different.
// Assuming Azure OpenAI as requested.
const embeddingClient = new AzureOpenAI({ endpoint, apiKey, deployment: embeddingDeployment, apiVersion: embedding_apiVersion });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI,)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

async function generateEmbedding(text) {
  try {
    const result = await embeddingClient.embeddings.create({
      input: text,
      model: embeddingDeployment
    });

    return result.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

async function addPlotAndEmbeddingToMovie(title, plot) {
  try {
    const movie = await Movie.findOne({ title: title });

    if (!movie) {
      console.log(`Movie with title "${title}" not found.`);
      return;
    }

    if (!plot) {
        console.log(`Plot not provided for movie "${title}". Skipping embedding.`);
        return;
    }

    console.log(`Updating movie "${title}" with new plot and embedding...`);
    const plotEmbedding = await generateEmbedding(plot);

    if (plotEmbedding) {
      movie.plot = plot;
      movie.plot_embedding = plotEmbedding;
      await movie.save();
      console.log(`Successfully updated "${title}" with plot and embedding.`);
    } else {
      console.log(`Failed to generate embedding for "${title}". Movie not updated.`);
    }
  } catch (error) {
    console.error(`Error updating movie "${title}":`, error);
  } finally {
    mongoose.disconnect();
  }
}

// Example Usage:
// Replace 'Your Movie Title' and 'Your Movie Plot' with actual values
addPlotAndEmbeddingToMovie("Overheard 2", "The second episode of Overheard, A trio of police officers conduct surveillance on a listed company.");

// Example for a specific movie:
// addPlotAndEmbeddingToMovie("The Matrix", "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.");
