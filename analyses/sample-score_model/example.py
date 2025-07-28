import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": "Bearer {api_key}"}

# define a dummy grader for illustration purposes
grader = {
   "type": "score_model",
   "name": "my_score_model",
   "input": [
        {
            "role": "system",
            "content": "You are an expert grader. If the reference and model answer are exact matches, output a score of 1. If they are somewhat similar in meaning, output a score in 0.5. Otherwise, give a score of 0."
        },
        {
            "role": "user",
            "content": "Reference: {{ item.reference_answer }}. Model answer: {{ sample.output_text }}"
        }
   ],
   "pass_threshold": 0.5,
   "model": "o3-mini-2024-01-31",
   "range": [0, 1],
   "sampling_params": {
       "max_tokens": 32768,
       "top_p": 1,
       "reasoning_effort": "medium"
   },
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": 1.0
  },
  "model_sample": "0.9"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run response:", response.text)