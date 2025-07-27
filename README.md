# OpenAI Evaluation System

A structured Node.js system for managing and running OpenAI evaluations using the new OpenAI Evals API with organized analysis configurations and database persistence.

## 🏗️ Project Structure

```
├── Analysis/                    # Analysis configurations
│   └── [analysis-name]/        # Each folder = one eval
│       ├── create.json         # OpenAI eval configuration
│       ├── data.jsonl          # Test data for evaluation
│       ├── prompt.txt          # System prompt for the eval
│       └── run.json            # Runtime configuration for evaluation
├── Evals/                      # Evaluation functions
│   ├── create.js              # Creates OpenAI evals
│   ├── uploadData.js          # Uploads data to OpenAI
│   └── run.js                 # Runs evaluations
├── index.js                   # Main CLI interface
├── openai-config.js           # OpenAI client setup
├── db.js                      # Database connection
├── docker-compose.yml         # PostgreSQL setup
└── prisma/schema.prisma       # Database schema
```

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="postgresql://evaluser:evalpassword@localhost:5432/evaldb?schema=public"
```

### 2. Database Setup
```bash
npm install
npm run db:up      # Start PostgreSQL
npm run setup      # Setup database schema
```

### 3. Run the System
```bash
npm start
```

## 📁 Analysis Folder Structure

Each analysis is a folder in `./Analysis/` containing:

### `create.json` - Eval Configuration
```json
{
  "name": "analysis-name",
  "data_source_config": {
    "type": "custom",
    "item_schema": {
      "type": "object",
      "properties": {
        "input": { "type": "string" },
        "expected": { "type": "string" }
      },
      "required": ["input", "expected"]
    },
    "include_sample_schema": true
  },
  "testing_criteria": [
    {
      "type": "string_check",
      "name": "Match output to expected answer",
      "input": "{{ sample.output_text }}",
      "operation": "contains",
      "reference": "{{ item.expected }}"
    }
  ]
}
```

### `data.jsonl` - Test Data
```jsonl
{"input": "Test question 1", "expected": "Expected answer 1"}
{"input": "Test question 2", "expected": "Expected answer 2"}
```

### `prompt.txt` - System Prompt
```
Your system prompt that defines how the AI should behave during evaluation.
```

### `run.json` - Runtime Configuration
```json
{
  "model": "gpt-3.5-turbo",
  "max_samples": 100,
  "temperature": 0.7,
  "max_tokens": 1000,
  "seed": 42,
  "run_config": {
    "parallel_runs": 1,
    "timeout_seconds": 300,
    "retry_attempts": 3
  },
  "evaluation_settings": {
    "record_raw_completions": true,
    "record_sampling_details": true,
    "include_usage_stats": true
  }
}
```

#### Run Configuration Options:

**Model Settings:**
- `model`: OpenAI model to use (e.g., "gpt-3.5-turbo", "gpt-4")
- `max_samples`: Maximum number of samples to evaluate
- `temperature`: Sampling temperature (0.0 to 2.0)
- `max_tokens`: Maximum tokens in response
- `seed`: Random seed for reproducibility

**Runtime Settings:**
- `parallel_runs`: Number of parallel evaluation runs
- `timeout_seconds`: Maximum time to wait for completion
- `retry_attempts`: Number of retry attempts on failure

**Evaluation Settings:**
- `record_raw_completions`: Store raw model outputs
- `record_sampling_details`: Include sampling metadata
- `include_usage_stats`: Track token usage statistics

## 🎯 How It Works

### CLI Interface
When you run `npm start`, the system:

1. **Asks what you want to do:**
   - `(r)un` - Execute an evaluation
   - `(s)ee` - View existing evaluations

### Running an Evaluation

2. **Shows available analysis folders** from `./Analysis/`
3. **Validates required files** (`create.json`, `data.jsonl`, `prompt.txt`, `run.json`)
4. **Checks database** for existing eval record by folder name
5. **Creates OpenAI eval** if `eval_ID` is empty (using `create.json`)
6. **Uploads data** if `data_ID` is empty (using `data.jsonl`)
7. **Runs evaluation** using `prompt.txt`, `eval_ID`, `data_ID`, and `run.json` configuration
8. **Displays comprehensive results** with metrics and usage statistics

### Database Schema

The `Eval` model stores:
- `id` - Primary key
- `name` - Analysis folder name (unique)
- `eval_ID` - OpenAI evaluation ID
- `data_ID` - OpenAI dataset ID
- `createdAt` / `updatedAt` - Timestamps

## 🔧 Eval Functions

### `create(config)`
- Creates OpenAI eval using configuration from `create.json`
- Uses the new OpenAI Evals API with `data_source_config` and `testing_criteria`
- Returns eval ID for database storage

### `uploadData(dataFilePath)`
- Uploads JSONL data file to OpenAI Files API
- Sets purpose as 'evals' for proper categorization
- Returns dataset ID for database storage

### `run(promptFilePath, evalId, dataId, analysisFolder)`
- Executes evaluation using the OpenAI Evals API
- Loads runtime configuration from `run.json`
- Uses system message from `prompt.txt`
- Polls for completion with configurable timeout
- Returns detailed results with metrics and usage statistics

## 💡 Example Usage

### Creating a New Analysis

1. **Create folder:** `./Analysis/my-new-eval/`

2. **Add configuration files:**
   ```bash
   # create.json
   {
     "name": "my-new-eval",
     "data_source_config": {
       "type": "custom",
       "item_schema": {
         "type": "object",
         "properties": {
           "input": { "type": "string" },
           "expected": { "type": "string" }
         },
         "required": ["input", "expected"]
       },
       "include_sample_schema": true
     },
     "testing_criteria": [
       {
         "type": "string_check",
         "name": "Match expected response",
         "input": "{{ sample.output_text }}",
         "operation": "contains",
         "reference": "{{ item.expected }}"
       }
     ]
   }
   
   # data.jsonl
   {"input": "What is AI?", "expected": "Artificial intelligence"}
   
   # prompt.txt
   You are a helpful AI assistant. Provide clear, accurate answers.
   
   # run.json
   {
     "model": "gpt-3.5-turbo",
     "max_samples": 50,
     "temperature": 0.3,
     "max_tokens": 500,
     "seed": 123,
     "run_config": {
       "parallel_runs": 1,
       "timeout_seconds": 600,
       "retry_attempts": 2
     },
     "evaluation_settings": {
       "record_raw_completions": true,
       "record_sampling_details": true,
       "include_usage_stats": true
     }
   }
   ```

3. **Run the evaluation:**
   ```bash
   npm start
   # Choose "run"
   # Select your analysis folder
   # System handles the rest automatically
   ```

## 🗄️ Database Management

```bash
npm run db:up       # Start PostgreSQL
npm run db:down     # Stop PostgreSQL  
npm run db:studio   # Open database GUI
npm run db:migrate  # Run migrations
npm run db:reset    # Reset database (⚠️ deletes data)
```

## ✨ Features

- **🎯 Platform Integration:** Uses the new OpenAI Evals API from the platform
- **🔄 Configurable Runtime:** Flexible `run.json` configuration for each evaluation
- **💾 Database Persistence:** Tracks all evaluations and their OpenAI IDs
- **🖥️ Interactive CLI:** User-friendly terminal interface
- **📊 Comprehensive Results:** Detailed evaluation metrics, usage stats, and error handling
- **⚙️ Flexible Configuration:** Per-evaluation model, sampling, and runtime settings
- **🐳 Docker Integration:** Easy PostgreSQL setup

## 🛠️ Development

```bash
npm run dev         # Run with auto-reload
npm run db:studio   # View/edit database
```

## 📋 Requirements

- Node.js 18+
- Docker (for PostgreSQL)
- OpenAI API key with Evals access

## 🔍 API Structure

### Testing Criteria Types

The system supports various testing criteria:

- **string_check**: Exact string matching operations
- **semantic_similarity**: Model-based similarity scoring
- **factuality**: Factual accuracy assessment
- **custom_prompt**: Custom evaluation logic

### Data Source Configuration

Supports custom data schemas with flexible property definitions:

```json
{
  "type": "custom",
  "item_schema": {
    "type": "object",
    "properties": {
      "input": { "type": "string" },
      "expected": { "type": "string" }
    },
    "required": ["input", "expected"]
  }
}
```

### Runtime Configuration

Each evaluation can have different runtime settings:

- **Model Selection**: Choose different OpenAI models per evaluation
- **Sampling Control**: Configure temperature, max_tokens, and seed
- **Execution Control**: Set timeouts, retries, and parallel runs
- **Data Collection**: Control what metrics and details to capture

## 🔍 Troubleshooting

### Database Issues
```bash
docker ps                    # Check if PostgreSQL is running
npm run db:down && npm run db:up  # Restart database
docker logs evalproject_postgres  # Check logs
```

### API Issues
- Ensure your OpenAI API key has Evals access
- Check that your data format matches the schema
- Verify testing criteria syntax
- Validate `run.json` configuration format

### Missing Files
- Ensure each analysis folder has: `create.json`, `data.jsonl`, `prompt.txt`, `run.json`
- Check file permissions and paths
- Verify JSON syntax in all configuration files
- Validate that `run.json` contains all required fields

This system provides a clean, organized way to manage multiple OpenAI evaluations using the new platform API with full database tracking, flexible runtime configuration, and an intuitive CLI interface! 