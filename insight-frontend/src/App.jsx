import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAudioUrl(null);
      setError(null);
    }
  };

  const handleSynthesize = async () => {
    if (!file) {
      setError("Please select a text or PDF file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('https://keren-uncircuitous-irreparably.ngrok-free.dev/api/synthesize', {
        method: 'POST',
        body: formData,
        headers:{
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error("Server failed to generate podcast.");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err) {
      console.error(err);
      setError("Pipeline Error: Ensure the Express server and Python environment are running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      
      <div className="max-w-xl w-full bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-800">
        
        {/* Upgraded Header Section */}
        <div className="bg-slate-950/50 px-8 py-10 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 relative z-10">
          Generate Audio Summaries from a book PDF or text
          </h1>
          
          {/* NEW: Clear, functional subtitle */}
          {/* <h2 className="text-lg font-semibold text-slate-200 mb-4 relative z-10 tracking-wide">
            Document-to-Podcast Generator
          </h2>
           */}
          {/* NEW: Explicitly explains what the app does to the user */}
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 relative z-10 leading-relaxed">
            Upload dense textbook chapters or PDFs. This deterministic NLP pipeline chunks the data, applies abstractive summarization, and synthesizes it into a concise, high-fidelity audio podcast. No chatbots involved.
          </p>

          <div className="flex flex-wrap justify-center gap-2 relative z-10">
            <span className="px-2 py-1 bg-slate-900/80 text-blue-400 text-xs rounded border border-slate-700 font-mono shadow-sm">
              Engine: HuggingFace
            </span>
            <span className="px-2 py-1 bg-slate-900/80 text-emerald-400 text-xs rounded border border-slate-700 font-mono shadow-sm">
              Model: BART-large-cnn
            </span>
            <span className="px-2 py-1 bg-slate-900/80 text-purple-400 text-xs rounded border border-slate-700 font-mono shadow-sm">
              Voice: ElevenLabs TTS
            </span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-8 relative">
          
          {/* Dark Dropzone */}
          <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-slate-800/50 hover:border-slate-600 transition-colors group bg-slate-900/50">
            <input 
              type="file" 
              accept=".txt,.pdf" 
              onChange={handleFileChange} 
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
            />
            
            <div className="space-y-3 pointer-events-none relative z-10">
              <svg className="mx-auto h-10 w-10 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-sm text-slate-300">
                <span className="font-semibold text-blue-400">Select source document</span> or drag and drop
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Injects .TXT or .PDF into the summarization chunker
              </p>
            </div>
          </div>

          {/* Dark File Indicator */}
          {file && (
            <div className="mt-4 flex items-center justify-between p-3 bg-slate-800/80 text-slate-200 rounded-lg border border-slate-700 text-sm shadow-inner">
              <span className="font-medium truncate mr-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"></path></svg>
                {file.name}
              </span>
              <span className="text-blue-300 text-[11px] font-bold px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md uppercase tracking-wide">
                Ready for parsing
              </span>
            </div>
          )}

          {/* Dark Error Banner */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50 font-medium flex items-start gap-2">
               <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          {/* Upgraded Action Button */}
          <button 
            onClick={handleSynthesize} 
            disabled={isLoading || !file}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:border disabled:border-slate-700 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Executing Pipeline...
              </>
            ) : (
              'Initialize Synthesis'
            )}
          </button>

          {/* Dark Audio Player Result Section */}
          {audioUrl && (
            <div className="mt-8 pt-6 border-t border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Output Generated
                </h3>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                {/* Custom styling for the native audio player to invert its colors where supported */}
                <audio controls src={audioUrl} className="w-full mb-3 outline-none opacity-90 sepia-[.2] hue-rotate-[180deg] saturate-[2]" />
                <a 
                  href={audioUrl} 
                  download="Insight_Synthesizer_Output.mp3" 
                  className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Master Audio
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;