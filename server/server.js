const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const pdf = require('pdf-extraction');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();
console.log("Checking API Key:", process.env.GROQ_API_KEY ? "Key Found (Starts with gsk_)" : "Key NOT Found (Undefined)");
const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3. DATABASE SCHEMA & MODEL
const AnalysisSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  matchPercentage: { type: Number, required: true },
  missingSkills: [String],
  resumeTips: [String],
  timestamp: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

// 4. CONFIGURATION
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 5. ROUTES

// --- ANALYZE & SAVE ROUTE ---
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Technical Recruiter. You MUST return a JSON object. 
          Include: matchPercentage (Number), missingSkills (Array), resumeTips (Array), 
          learningPath (Array of {skill, resource, timeframe}), 
          and interviewQuestions (Array of {question, answerHint}).`
        },
        {
          role: "user",
          content: `Analyze the Resume against the JD and return a JSON object.
          
          JD: ${jobDescription}
          Resume: ${resumeText}

          
          "missingSkills": [],
            "resumeTips": [],
            "learningPath": [{ "skill": "", "resource": "", "timeframe": "" }],
            "interviewQuestions": [{ "question": "", "answerHint": "" }]
          }`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const resultJson = JSON.parse(chatCompletion.choices[0].message.content);

    // Save to MongoDB (Ensure schema includes new fields)
    const historyEntry = new Analysis({
      jobTitle: jobDescription.substring(0, 60),
      matchPercentage: resultJson.matchPercentage || 0,
      missingSkills: resultJson.missingSkills || [],
      resumeTips: resultJson.resumeTips || [],
      // If you updated your schema to include these, uncomment below:
      // learningPath: resultJson.learningPath || [],
      // interviewQuestions: resultJson.interviewQuestions || []
    });

    await historyEntry.save();

    // Return the FULL JSON to the frontend
    res.json(resultJson);

  } catch (error) {
    console.error("ANALYSIS ERROR:", error);
    res.status(500).json({ error: "Analysis failed." });
  }
});
// --- FETCH HISTORY ROUTE ---
app.get('/api/history', async (req, res) => {
  try {
    const history = await Analysis.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
