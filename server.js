const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Set up Multer to save uploaded files temporarily
const upload = multer({ dest: 'uploads/' });

app.post('/api/synthesize', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No document uploaded.');
    }

    const inputFilePath = req.file.path;
    console.log(`File received. Starting Python processing...`);

    // Call the Python script using the specific virtual environment executable
    // Note: If on Mac/Linux, this path would be './venv/bin/python'
    const pythonExecutable = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
    const pythonProcess = spawn(pythonExecutable, ['summarizer.py', inputFilePath]);

    let outputData = '';

    // Capture standard output from Python
    pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
        console.log(`Python: ${data}`);
    });

    // Capture errors
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    // When Python finishes
    pythonProcess.on('close', (code) => {
        // Clean up the temporary uploaded text file
        fs.unlinkSync(inputFilePath);

        if (code !== 0) {
            return res.status(500).send('Error generating podcast.');
        }

        // Parse the Python output to find the success string
        const lines = outputData.split('\n');
        const successLine = lines.find(line => line.includes('SUCCESS:'));

        if (successLine) {
            const audioFilename = successLine.split(':')[1].trim();
            const audioPath = path.join(__dirname, audioFilename);
            
            // Send the MP3 file back to the client
            res.download(audioPath, 'Insight_Podcast.mp3', (err) => {
                if (err) console.error("Error sending file:", err);
                // Optional: delete the generated MP3 after sending to save space
            });
        } else {
            res.status(500).send('Processing failed.');
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Insight Synthesizer API running on http://localhost:${PORT}`);
});