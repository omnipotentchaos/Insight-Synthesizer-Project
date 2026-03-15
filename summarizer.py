import sys
import os
from transformers import pipeline
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from pypdf import PdfReader
import nltk
from nltk.tokenize import sent_tokenize

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')


# 1. Initialize the pipeline
summarizer = pipeline("text2text-generation", model="Falconsai/text_summarization")

def chunk_and_summarize(text, summarizer, max_words_per_chunk=300):
    """Safely chunks text by complete sentences to avoid cutting off mid-word."""
    
    # 1. Split the entire document into an array of perfect sentences
    sentences = sent_tokenize(text)
    
    chunks = []
    current_chunk = []
    current_word_count = 0

    # 2. Group sentences together until we hit the 300-word safety limit
    for sentence in sentences:
        words_in_sentence = len(sentence.split())
        
        if current_word_count + words_in_sentence <= max_words_per_chunk:
            current_chunk.append(sentence)
            current_word_count += words_in_sentence
        else:
            # Chunk is full! Save it and start a new one
            if current_chunk:
                chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_word_count = words_in_sentence
            
    # Catch any leftover sentences at the end
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    # 3. Summarize each safe chunk
    summarized_text = []
    for chunk in chunks:
        # Skip tiny leftover chunks that might break the AI
        if len(chunk.split()) < 20: 
            continue
            
        summary = summarizer(
            chunk,
            max_new_tokens=150,  
            min_length=30,
            do_sample=False,
            truncation=True      # Enforces the hard 512 token limit just in case
        )
        summarized_text.append(summary[0]['summary_text'])

    return " ".join(summarized_text)


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
        final_result = chunk_and_summarize(user_text, summarizer)
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