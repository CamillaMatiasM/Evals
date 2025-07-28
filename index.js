import fs from "fs";
import path from "path";
import readline from "readline";
import prisma from "./utils/db.js";
import { create } from "./Evals/create.js";
import { uploadData } from "./Evals/uploadData.js";
import { run } from "./Evals/run.js";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    console.log("🎯 OpenAI Evaluation System");
    console.log("==========================\n");

    // Ask user what they want to do
    const action = await question(
      "Do you want to (r)un an eval or (s)ee an eval? "
    );

    if (action.toLowerCase() === "r" || action.toLowerCase() === "run") {
      await runEval();
    } else if (action.toLowerCase() === "s" || action.toLowerCase() === "see") {
      await seeEval();
    } else {
      console.log('❌ Invalid option. Please choose "run" or "see".');
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function runEval() {
  try {
    // Get all folders in analyses directory
    const analysesPath = "./analyses";
    if (!fs.existsSync(analysesPath)) {
      throw new Error(
        "analyses folder not found. Please create analyses configurations first."
      );
    }

    const folders = fs
      .readdirSync(analysesPath)
      .filter((item) =>
        fs.statSync(path.join(analysesPath, item)).isDirectory()
      );

    if (folders.length === 0) {
      throw new Error("No analyses folders found in ./analyses directory.");
    }

    // Display available folders
      console.log("📁 Available analyses folders:");
    folders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder}`);
    });

    // Ask user to choose a folder
    const choice = await question(
      "\nWhich analyses would you like to run? (enter number): "
    );
    const selectedIndex = parseInt(choice) - 1;

    if (selectedIndex < 0 || selectedIndex >= folders.length) {
      throw new Error("Invalid selection.");
    }

    const selectedFolder = folders[selectedIndex];
    console.log(`\n🎯 Selected: ${selectedFolder}`);

    // Check database for existing record
    let evalRecord = await prisma.eval.findUnique({
      where: { name: selectedFolder },
    });

    /**
     * FOR LLM:
     * Create a function at evals/db.js to create a new eval record in the database.
     * Here you should only call the function and pass the name of the eval.
     */
    if (!evalRecord) {
      // Create new record if it doesn't exist
      evalRecord = await prisma.eval.create({
        data: { name: selectedFolder },
      });
      console.log(`📝 Created new eval record for: ${selectedFolder}`);
    }

    const folderPath = path.join(analysesPath, selectedFolder);

    // Validate required files exist
    const requiredFiles = [
      "create.json",
      "data.jsonl",
      "prompt.txt",
      "run.json",
    ];
    for (const file of requiredFiles) {
      const filePath = path.join(folderPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file ${file} not found in ${folderPath}`);
      }
    }

    // Step 1: Check eval_ID, create if empty
    if (!evalRecord.eval_ID) {
      console.log("\n🔧 Creating OpenAI eval...");
      const createConfigPath = path.join(folderPath, "create.json");

      const createConfig = JSON.parse(
        fs.readFileSync(createConfigPath, "utf8")
      );
      const evalId = await create({
        ...createConfig,
        name: selectedFolder,
      });

      // Update database with eval_ID
      /**
       * FOR LLM:
       * Create a function at evals/db.js to update the eval record in the database.
       * Here you should only call the function and pass the eval_ID.
       */
      evalRecord = await prisma.eval.update({
        where: { id: evalRecord.id },
        data: { eval_ID: evalId },
      });

      console.log(`✅ Eval created and saved to database: ${evalId}`);
    } else {
      console.log(`✅ Using existing eval_ID: ${evalRecord.eval_ID}`);
    }

    // Step 2: Check data_ID, upload if empty
    if (!evalRecord.data_ID) {
      console.log("\n📤 Uploading data...");
      const dataFilePath = path.join(folderPath, "data.jsonl");

      const dataId = await uploadData(dataFilePath);

      // Update database with data_ID
      /**
       * FOR LLM:
       * Create a function at evals/db.js to update the eval record in the database.
       * Here you should only call the function and pass the data_ID.
       */
      evalRecord = await prisma.eval.update({
        where: { id: evalRecord.id },
        data: { data_ID: dataId },
      });

      console.log(`✅ Data uploaded and saved to database: ${dataId}`);
    } else {
      console.log(`✅ Using existing data_ID: ${evalRecord.data_ID}`);
    }

    // Step 3: Run the evaluation with run.json configuration
    console.log("\n🚀 Running evaluation...");
    const promptFilePath = path.join(folderPath, "prompt.txt");
    const runConfigPath = path.join(folderPath, "run.json");

    const result = await run(
      promptFilePath,
      evalRecord.eval_ID,
      evalRecord.data_ID,
      runConfigPath
    );

    console.log("\n🎉 Evaluation completed successfully!");
    console.log("📊 Final Results:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error running eval:", error.message);
  }
}

async function seeEval() {
  try {
    // Get all eval records from database
    const evals = await prisma.eval.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (evals.length === 0) {
      console.log("📭 No evaluations found in database.");
      return;
    }

    console.log("📊 Available evaluations:");
    evals.forEach((evaluation, index) => {
      const status =
        evaluation.eval_ID && evaluation.data_ID ? "✅ Ready" : "⏳ Incomplete";
      console.log(`${index + 1}. ${evaluation.name} - ${status}`);
      console.log(`   Created: ${evaluation.createdAt.toLocaleString()}`);
      if (evaluation.eval_ID) console.log(`   Eval ID: ${evaluation.eval_ID}`);
      if (evaluation.data_ID) console.log(`   Data ID: ${evaluation.data_ID}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error retrieving evaluations:", error.message);
  }
}

// Run the main function
main();
