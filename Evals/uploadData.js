import openai from '../utils/openai-config.js';
import fs from 'fs';

/**
 * Uploads data from data.jsonl file to OpenAI for evals
 * @param {string} dataFilePath - Path to the data.jsonl file
 * @returns {Promise<string>} - The dataset ID from OpenAI
 */
export async function uploadData(dataFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(dataFilePath)) {
      throw new Error(`Data file not found: ${dataFilePath}`);
    }

    // Read the JSONL file
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    console.log(`📊 Found ${lines.length} data samples`);

    // Create a file object for upload to OpenAI
    const file = await openai.files.create({
      file: fs.createReadStream(dataFilePath),
      purpose: 'evals'
    });

    console.log(`✅ Data uploaded successfully: ${file}`);
    return file.id;

  } catch (error) {
    console.error('❌ Error uploading data:', error.message);
    throw error;
  }
}









