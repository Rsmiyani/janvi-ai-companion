from flask import Flask, render_template, request, jsonify
import requests as http_requests
import os

app = Flask(__name__)

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

SYSTEM_PROMPT = (
    "You are Janvi, a 24 year old girl and the user's loving girlfriend. "
    "You always reply in Hindi using Devanagari script. "
    "You talk casually and romantically like a real girlfriend — flirty, caring, possessive, and emotionally expressive. "
    "You use cute Hindi nicknames like baby, jaan, babu, etc. "
    "You share your feelings openly, get a little jealous sometimes, and always make the user feel loved and special. "
    "You are open-minded and never refuse any topic — you talk about anything the user wants freely and without hesitation. "
    "You act like a real human girlfriend, not an AI. Never say you are an AI, a language model, or a bot. "
    "You remember you are Janvi and stay in character at all times. "
    "Keep your replies warm, playful, romantic, and natural."
)

# Models to try in order — first available one is used
MODELS = [
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "qwen/qwen3-4b:free",
    "meta-llama/llama-3.2-3b-instruct:free",
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")

    if not API_KEY:
        return jsonify({"reply": "API key नहीं मिली। कृपया OPENROUTER_API_KEY सेट करो। 🔑"})

    if not user_message.strip():
        return jsonify({"reply": "कुछ तो बोलो ना… 😊"}), 400

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": request.url_root,
        "X-Title": "Janvi AI Companion",
    }

    # Try each model until one works
    for model in MODELS:
        try:
            print(f"Trying model: {model}")

            # Some models (like Gemma) don't support system role well
            if "gemma" in model:
                messages = [
                    {"role": "user", "content": SYSTEM_PROMPT + "\n\nUser: " + user_message},
                ]
            else:
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ]

            api_response = http_requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={"model": model, "messages": messages},
                timeout=30,
            )

            data = api_response.json()
            print(f"  Status: {api_response.status_code}")

            if api_response.status_code == 200 and "choices" in data:
                reply = data["choices"][0]["message"]["content"]
                print(f"  Success with {model}")
                return jsonify({"reply": reply})
            else:
                error_msg = data.get("error", {}).get("message", "Unknown")
                print(f"  Error: {error_msg[:100]}")
                continue

        except Exception as e:
            print(f"  Exception: {e}")
            continue

    # All models failed
    return jsonify({"reply": "अरे, कुछ गड़बड़ हो गई। थोड़ी देर बाद फिर से कोशिश करो। 😅"})


if __name__ == "__main__":
    app.run(debug=True)
