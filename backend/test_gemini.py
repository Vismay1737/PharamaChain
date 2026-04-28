import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-lite-latest')
    response = model.generate_content("Hello")
    print("SUCCESS gemini-flash-lite-latest:", response.text)
except Exception as e:
    print("ERROR:", str(e))
