import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate that the API key is provided
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required. Please add it to your .env file.');
}

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export the configured client
export default openai; 