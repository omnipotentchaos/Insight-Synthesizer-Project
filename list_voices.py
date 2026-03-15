import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

# Load your API key
load_dotenv()
api_key = os.getenv("ELEVENLABS_API_KEY")

# Initialize client
client = ElevenLabs(api_key=api_key)

# Fetch and print all available voices and their IDs
print("Fetching your available voices...\n")
response = client.voices.get_all()

for voice in response.voices:
    print(f"Name: {voice.name} | ID: {voice.voice_id}")