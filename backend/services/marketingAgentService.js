const { AzureChatOpenAI } = require("@langchain/openai");
const { z } = require("zod");
require('dotenv').config();

// Initialize Azure Chat OpenAI
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: "2025-01-01-preview", 
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  temperature: 0,
});

// Define the structured output schema
const MarketingConfigSchema = z.object({
  percentage: z.number().describe("The percentage of prioritized (promoted) movies to show in the results (0-100)."),
  criteria: z.string().describe("The search criteria or keywords for the promoted movies (e.g., 'Hong Kong actors')."),
  filters: z.object({
    cast: z.array(z.string()).optional().describe("List of actors mentioned in the prompt, e.g., ['Jackie Chan']"),
    country: z.string().optional().describe("Country mentioned in the prompt, e.g., 'Hong Kong'"),
    genre: z.string().optional().describe("Genre mentioned in the prompt, e.g., 'Action'")
  }).optional().describe("Optional filters extracted from the prompt")
});

/**
 * Parses a marketing prompt to extract configuration.
 * @param {string} prompt - The natural language prompt from the marketing user.
 * @returns {Promise<{percentage: number, criteria: string}>}
 */
const parseMarketingPrompt = async (prompt) => {
  try {
    const structuredLlm = model.withStructuredOutput(MarketingConfigSchema);
    const result = await structuredLlm.invoke(prompt);
    return result;
  } catch (error) {
    console.error("Error parsing marketing prompt:", error);
    // Fallback or rethrow
    throw new Error("Failed to interpret marketing prompt.");
  }
};

module.exports = { parseMarketingPrompt };
