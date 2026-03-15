import sys
import os
from transformers import pipeline
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from pypdf import PdfReader


# 1. Initialize the pipeline
summarizer = pipeline("text2text-generation", model="Falconsai/text_summarization")

def chunk_and_summarize(text, max_chunk_words=400):
    """Divides a large text into smaller chunks and summarizes each one."""
    
    # Split text into a list of words
    words = text.split()
    
    # Group words into chunks of 'max_chunk_words'
    chunks = [' '.join(words[i:i + max_chunk_words]) for i in range(0, len(words), max_chunk_words)]
    
    full_summary = []
    print(f"\nDivided text into {len(chunks)} chunks. Processing...\n")
    
    for i, chunk in enumerate(chunks):
        # Dynamically calculate max/min lengths so short chunks don't cause errors
        chunk_length = len(chunk.split())
        max_len = min(130, int(chunk_length * 0.6)) 
        min_len = min(30, int(chunk_length * 0.2))
        
        # Generate summary for this specific chunk
        summary = summarizer(chunk, max_length=max_len, min_length=min_len, do_sample=False)
        
        # Extract the text (handles both v4 and v5 transformers output keys)
        output_text = summary[0].get('generated_text', summary[0].get('summary_text', ''))
        full_summary.append(output_text)
        
        print(f"--> Chunk {i+1} summarized.")
        
    # Stitch it all back together
    return " ".join(full_summary)

def extract_text(file_path):
    """Extracts text based on file type."""
    # 1. Read the first 4 bytes to check the file's "Magic Number"
    with open(file_path, 'rb') as test_file:
        is_pdf = test_file.read(4) == b'%PDF'
        
    if is_pdf:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    else:
        # Assume it's a standard text file
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()

            
if __name__ == "__main__":
    # 1. Get the input file path from the command line argument
    if len(sys.argv) < 2:
        print("Error: No input file provided.")
        sys.exit(1)
        
    input_file_path = sys.argv[1]
    
    try:
        # 1. Extract text dynamically
        user_text = extract_text(input_file_path)

        # 2. Process the text
        final_result = chunk_and_summarize(user_text)
        # 4. Generate Audio
        load_dotenv()
        api_key = os.getenv("ELEVENLABS_API_KEY")
        client = ElevenLabs(api_key=api_key)
    
    # Make sure to use your valid Voice ID here
        voice_id = "JBFqnCBsd6RMkjVDRZzb" 
    
   
        audio_iterator = client.text_to_speech.convert(
            voice_id=voice_id, 
            text=final_result,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        audio_data = b"".join(audio_iterator)
        
        # Save it to a known location
        output_filename = "output_podcast.mp3"
        with open(output_filename, "wb") as f:
            f.write(audio_data)

        # 5. VERY IMPORTANT: Print only the final filename so Node.js can read it
        print(f"SUCCESS:{output_filename}")
    except Exception as e:
        print(f"ERROR:{e}")
        sys.exit(1)