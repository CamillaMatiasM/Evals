import openai from '../openai-config.js';
import fs from 'fs';

/**
 * Runs an evaluation using prompt, eval_ID and data_ID
 * @param {string} promptFilePath - Path to the prompt.txt file
 * @param {string} evalId - The OpenAI eval ID
 * @param {string} dataId - The OpenAI dataset ID
 * @returns {Promise<Object>} - The evaluation run result
 */
export async function run(promptFilePath, evalId, dataId, runConfig) {
  try {
    console.log('🚀 Starting eval run...');
    console.log(`📝 Prompt file: ${promptFilePath}`);
    console.log(`🔍 Eval ID: ${evalId}`);
    console.log(`📊 Data ID: ${dataId}`);

    // Read the prompt file
    if (!fs.existsSync(promptFilePath)) {
      throw new Error(`Prompt file not found: ${promptFilePath}`);
    }

    const prompt = fs.readFileSync(promptFilePath, 'utf8').trim();
    console.log(`📄 Loaded prompt: ${prompt.substring(0, 100)}...`);

    // Create evaluation run using the platform API
    const evalRun = await openai.evals.runs.create(evalId, {
      name: runConfig.name,
      data_source: {
        type: runConfig.type,
        model: runConfig.model,
        input_messages: {
            type: runConfig.input_messages.type,
            template: [
                { role: "developer", content: prompt },
                { role: "user", content: "{{ item.input }}" },
            ],
        },
        source: { type: "file_id", id: dataId },
    }
    });

    console.log(`✅ Eval run started with ID: ${evalRun.id}`);
    
    // Poll for completion
    let runStatus = evalRun;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max wait time
    
    while ((runStatus.status === 'running' || runStatus.status === 'queued') && attempts < maxAttempts) {
      console.log(`⏳ Status: ${runStatus.status}... waiting 10 seconds (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      runStatus = await openai.evals.runs.retrieve(evalRun.id);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Evaluation timed out after 10 minutes');
    }

    console.log(`🏁 Eval completed with status: ${runStatus.status}`);
    
    // Return the results
    const result = {
      runId: evalRun.id,
      evalId: evalId,
      datasetId: dataId,
      status: runStatus.status,
      results: runStatus.results || {},
      metrics: runStatus.metrics || {},
      completedAt: runStatus.completed_at || new Date().toISOString(),
      samples_processed: runStatus.samples_processed || 0,
      total_samples: runStatus.total_samples || 0
    };

    console.log('📊 Results Summary:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Samples: ${result.samples_processed}/${result.total_samples}`);
    console.log(`   Metrics: ${JSON.stringify(result.metrics, null, 2)}`);

    return result;

  } catch (error) {
    console.error('❌ Error running eval:', error.message);
    throw error;
  }
}