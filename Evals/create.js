import openai from '../openai-config.js';

/**
 * Creates an OpenAI eval using configuration from create.json
 * @param {Object} config - Configuration object from create.json
 * @returns {Promise<string>} - The eval ID from OpenAI
 */
export async function create(config) {
  try {
    // Create the eval using OpenAI Evals API
    const evaluation = await openai.evals.create(config);

    console.log(`✅ Eval created successfully: ${JSON.stringify(evaluation, null, 2)}`);
    return evaluation.id;

  } catch (error) {
    console.error('❌ Error creating eval:', error.message);
    throw error;
  }
}







