const express = require('express');
const https = require('https');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const dotenv = require('dotenv');

dotenv.config(); 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_PRO_API);

// Middleware to parse JSON bodies
app.use(express.json());

// Handle POST request to /prompt
app.post('/prompt', async (req, res) => {
    try {
        // Extract the prompt and chat history from the request body
        const { prompt, chatHistory } = req.body;

        // Generate content using Google Generative AI
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log(prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send the response back to the client along with updated chat history
        res.json({ success: true, response: text, chatHistory });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Handle GET request to clear chat history
app.get('/clear-history', (req, res) => {
    try {
        // Clear chat history from localStorage
        localStorage.removeItem('chatHistory');
        res.status(200).json({ success: true, message: 'Chat history cleared successfully.' });
    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// HTTPS options
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

// Start HTTPS server
const PORT = process.env.PORT || 443;
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
