import openai from '../openai-config.js';

/**
 * Creates an OpenAI eval using configuration from create.json
 * @param {Object} config - Configuration object from create.json
 * @returns {Promise<string>} - The eval ID from OpenAI
 */
export async function create(config) {
  try {
    console.log('Creating OpenAI eval with config:', JSON.stringify(config, null, 2));
    
    // Create the eval using OpenAI Evals API
    const evaluation = await openai.evals.create({
      name: config.name,
      data_source_config: config.data_source_config,
      testing_criteria: config.testing_criteria
    });

    console.log(`✅ Eval created successfully with ID: ${evaluation.id}`);
    return evaluation.id;

  } catch (error) {
    console.error('❌ Error creating eval:', error.message);
    throw error;
  }
}







