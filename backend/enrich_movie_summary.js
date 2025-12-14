require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const { AzureChatOpenAI, AzureOpenAIEmbeddings } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Initialize Azure Chat OpenAI
const chatModel = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: "2025-01-01-preview", 
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  temperature: 0.7,
});

// Helper to extract instance name from endpoint
const getInstanceName = (endpoint) => {
  if (!endpoint) return undefined;
  try {
    const url = new URL(endpoint);
    return url.hostname.split('.')[0];
  } catch (e) {
    return undefined;
  }
};

const instanceName = getInstanceName(process.env.AZURE_OPENAI_ENDPOINT);

// Initialize Azure OpenAI Embeddings
const embeddingsModel = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: instanceName,
  azureOpenAIApiVersion: "2023-05-15", 
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
});

async function enrichMovie(title) {
  try {
    const movie = await Movie.findOne({ title: title });
    if (!movie) {
      console.log(`Movie "${title}" not found.`);
      return;
    }

    console.log(`Found movie: ${movie.title}`);

    // Construct prompt for summarization
    const prompt = `
      Please summarize the following movie details into a comprehensive and engaging plot summary.
      The summary should be detailed enough to capture the essence of the movie, including key plot points, character arcs, and the setting.
      It should seamlessly integrate information about the cast and cultural context (country/language) where relevant.
      
      Title: ${movie.title}
      Current Plot: ${movie.plot || "N/A"}
      Full Plot: ${movie.fullplot || "N/A"}
      Cast: ${movie.cast ? movie.cast.join(', ') : "N/A"}
      Countries: ${movie.countries ? movie.countries.join(', ') : "N/A"}
      Languages: ${movie.languages ? movie.languages.join(', ') : "N/A"}
      
      Output only the summary text.
    `;

    console.log("Generating summary with LLM...");
    const response = await chatModel.invoke([
      new SystemMessage("You are a helpful movie critic and database assistant. Your goal is to create a rich, descriptive summary for a movie recommendation system."),
      new HumanMessage(prompt)
    ]);
    
    const newSummary = response.content;
    // console.log("New Summary Generated.");
    console.log("New Summary:", newSummary);

    console.log("Generating embedding for new summary...");
    const embedding = await embeddingsModel.embedQuery(newSummary);
    
    // console.log("Embedding type:", typeof embedding);
    // console.log("Is array?", Array.isArray(embedding));
    // if (Array.isArray(embedding)) {
    //     console.log("Embedding length:", embedding.length);
    //     console.log("First element type:", typeof embedding[0]);
    // } else {
    //     console.log("Embedding value (first 100 chars):", String(embedding).substring(0, 100));
    // }

    // Update movie
    movie.plot = newSummary;
    movie.fullplot = newSummary;
    movie.plot_embedding = embedding;

    await movie.save({ validateBeforeSave: false });
    console.log(`Successfully updated "${title}" with enriched summary and embedding.`);

  } catch (error) {
    console.error("Error enriching movie:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Get title from command line argument
const title = process.argv[2];

if (title) {
  enrichMovie(title);
} else {
  console.log("Please provide a movie title as an argument.");
  console.log("Usage: node enrich_movie_summary.js \"Movie Title\"");
  mongoose.disconnect();
}
