import openai from "../openai-config.js";
import fs from "fs";

/**
 * Runs an evaluation using prompt, eval_ID and data_ID
 * @param {string} promptFilePath - Path to the prompt.txt file
 * @param {string} evalId - The OpenAI eval ID
 * @param {string} dataId - The OpenAI dataset ID
 * @returns {Promise<Object>} - The evaluation run result
 */
export async function run(promptFilePath, evalId, dataId, runConfigPath) {
  try {
    console.log("🚀 Starting eval run...");
    console.log(`📝 Prompt file: ${promptFilePath}`);
    console.log(`🔍 Eval ID: ${evalId}`);
    console.log(`📊 Data ID: ${dataId}`);

    // Read the prompt file
    if (!fs.existsSync(promptFilePath)) {
      throw new Error(`Prompt file not found: ${promptFilePath}`);
    }

    const prompt = fs.readFileSync(promptFilePath, "utf8").trim();
    console.log(`📄 Loaded prompt: ${prompt.substring(0, 100)}...`);

    const runConfig = JSON.parse(fs.readFileSync(runConfigPath, "utf8"));
    console.log(runConfig);

    // Create evaluation run using the platform API
    const evalRun = await openai.evals.runs.create(evalId, {
      ...runConfig,
      data_source: {
        type: runConfig.data_source.type,
        model: runConfig.data_source.model,
        input_messages: {
          type: runConfig.data_source.input_messages.type,
          template: [
            { role: "developer", content: prompt },
            { role: "user", content: "{{ item.input }}" },
          ],
        },
        source: { type: "file_id", id: dataId },
      },
    });

    console.log(`✅ Eval run started with ID: ${evalRun.id}`);
    
    return evalRun;
  } catch (error) {
    console.error("❌ Error running eval:", error);
    throw error;
  }
}
