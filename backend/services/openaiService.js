const { AzureOpenAI } = require('openai');
require('dotenv').config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2025-01-01-preview";
const embedding_apiVersion = "2023-05-15";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME; // For GPT-4 or similar
const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME; 

// Initialize OpenAI Client
// Note: If using standard OpenAI, the initialization would be different.
// Assuming Azure OpenAI as requested.
const chatClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const embeddingClient = new AzureOpenAI({ endpoint, apiKey, deployment: embeddingDeployment, apiVersion: embedding_apiVersion });

console.log("OpenAI Service Initialized:");
console.log("  Chat Deployment:", deployment);
console.log("  Embedding Deployment:", embeddingDeployment);

async function generateUserProfile(history) {
  if (!history || history.length === 0) return "No history available.";

  // Format history for the prompt
  const historyText = history.map((h, i) => {
    return `Movie ${i+1}:
    - Genres: ${h.genres ? h.genres.join(', ') : 'N/A'}
    - Actors: ${h.actors ? h.actors.join(', ') : 'N/A'}
    - Languages: ${h.languages ? h.languages.join(', ') : 'N/A'}
    - Time Spent: ${h.browsingTime} seconds`;
  }).join('\n');

  const messages = [
    { role: "system", content: "You are an expert user profiler. specific on the movie domain." },
    { role: "user", content: `Analyze the following user movie viewing history and summarize the user's preferences (genres, actors, languages, engagement/duration). Create a concise user bio.\n\n${historyText}` }
  ];

  try {
    const result = await chatClient.chat.completions.create({
      messages,
      model: deployment,
      temperature: 0.7,
      max_tokens: 500
    });
    const summary = result.choices[0].message.content;
    console.log("Generated User Profile Summary:", summary);
    return summary;
  } catch (error) {
    console.error("Error generating user profile:", error);
    throw error;
  }
}

async function generateEmbedding(text) {
  try {
    const result = await embeddingClient.embeddings.create({
      input: text,
      model: embeddingDeployment
    });

    return result.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

async function analyzeMoviesChat(query, context) {
    const messages = [
        { role: "system", content: "You are a data analyst helper. You can describe patterns in movie data." },
        { role: "user", content: `Context: ${context}\n\nUser Query: ${query}` }
    ];

    try {
        const result = await chatClient.chat.completions.create({
            messages,
            model: deployment,
            max_tokens: 800
        });
        return result.choices[0].message.content;
    } catch (err) {
        console.error("Error in chat analysis:", err);
        throw err;
    }
}

module.exports = {
  generateUserProfile,
  generateEmbedding,
  analyzeMoviesChat
};
