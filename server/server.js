const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const pdf = require('pdf-extraction');
const cors = require('cors');
const Groq = require('groq-sdk');
const authRoutes = require('./routes/auth');
require('dotenv').config();

console.log("Checking API Key:", process.env.GROQ_API_KEY ? "Key Found (Starts with gsk_)" : "Key NOT Found (Undefined)");
const app = express();
console.log(
  process.env.GROQ_API_KEY?.substring(0, 10)
);

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hiremind_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3. DATABASE SCHEMA & MODEL
const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: { type: String, required: true },
  matchPercentage: { type: Number, required: true },
  missingSkills: [String],
  resumeTips: [String],
  atsScore: { type: Number },
  atsVerdict: { type: String },
  atsBreakdown: {
    keywords: { type: Number },
    skills: { type: Number },
    projects: { type: Number },
    experience: { type: Number },
    formatting: { type: Number }
  },
  careerRecommendations: [{
    title: String,
    match: Number,
    salary: String,
    why: String,
    missingSkills: [String]
  }],
  learningPath: [{
    skill: String,
    resource: String,
    timeframe: String
  }],
  interviewQuestions: [{
    question: String,
    answerHint: String
  }],
  timestamp: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

// 4. CONFIGURATION
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 5. AUTH ROUTES
app.use('/api/auth', authRoutes);

// 6. ROUTES

// --- ANALYZE & SAVE ROUTE (PROTECTED) ---
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  const { protect } = require('./middleware/auth');
  
  try {
    // Check authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    const userId = decoded.id;

    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text;

    let systemPrompt = "";
    let userPrompt = "";
    const { jobDescription, analysisType } = req.body;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    if (analysisType === "medium") {
      systemPrompt = `
You are an ATS Evaluator.

Return ONLY valid JSON.

{
  "atsScore": 0,
  "atsVerdict": "",
  "atsBreakdown": {
    "keywords": 0,
    "skills": 0,
    "projects": 0,
    "experience": 0,
    "formatting": 0
  }
}
`;

      userPrompt = `
Analyze the resume for ATS compatibility.

Resume:

${resumeText}

Return ONLY ATS Score,
ATS Verdict,
ATS Breakdown.
`;
    } else {
      systemPrompt = `
You are an Expert Technical Recruiter, ATS Evaluator, Career Advisor, Resume Reviewer, and Interview Coach.

Analyze the candidate's resume against the provided Job Description.

Return ONLY valid JSON.

Your evaluation must include:

1. ATS Score (0-100)
2. ATS Verdict
3. ATS Breakdown
4. Match Percentage
5. Missing Skills
6. Resume Optimization Tips
7. Learning Roadmap
8. Interview Questions
9. Career Recommendations

ATS SCORING CRITERIA:

- Keywords Match (30 points)
- Technical Skills (25 points)
- Projects Quality (15 points)
- Experience Relevance (20 points)
- Resume Formatting & Structure (10 points)

ATS Verdict Rules:

90-100 = Excellent
80-89 = Strong
70-79 = Good
60-69 = Fair
Below 60 = Needs Improvement

CARIER RECOMMENDATIONS:

Recommend the TOP 3 most suitable career paths.

For each career path provide:

- title
- match percentage
- expected salary range in India
- reason why this career suits the candidate
- missing skills needed for that career

LEARNING ROADMAP:

Generate a practical roadmap based on missing skills.

Each roadmap item must contain:

- skill
- resource
- timeframe

INTERVIEW QUESTIONS:

Generate 5 relevant technical interview questions.

Each question must include:

- question
- answerHint

RESUME OPTIMIZATION:

Provide actionable suggestions that improve:

- ATS compatibility
- recruiter appeal
- technical presentation
- project descriptions
- achievement visibility

Return EXACTLY this JSON structure:

{
  "atsScore": 0,

  "atsVerdict": "",

  "atsBreakdown": {
    "keywords": 0,
    "skills": 0,
    "projects": 0,
    "experience": 0,
    "formatting": 0
  },

  "matchPercentage": 0,

  "missingSkills": [],

  "resumeTips": [],

  "learningPath": [
    {
      "skill": "",
      "resource": "",
      "timeframe": ""
    }
  ],

  "interviewQuestions": [
    {
      "question": "",
      "answerHint": ""
    }
  ],

  "careerRecommendations": [
    {
      "title": "",
      "match": 0,
      "salary": "",
      "why": "",
      "missingSkills": []
    }
  ]
}
`;

      userPrompt = `
Analyze the following resume against the provided job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Tasks:

1. Calculate resume match percentage.

2. Identify missing skills.

3. Provide resume optimization tips.

4. Generate a personalized learning roadmap.

5. Generate 5 interview questions with answer hints.

6. Recommend TOP 3 career paths.

For each career path provide:

- title
- match percentage
- expected salary range in India
- reason why it suits the candidate
- missing skills needed

Important:

- Career matches should be realistic.
- Salary ranges should reflect current Indian market.
- Learning roadmap should directly address missing skills.
- Interview questions should be relevant to the candidate profile.
- Return ONLY JSON.
`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: {
        type: "json_object"
      }
    });

    const resultJson = JSON.parse(chatCompletion.choices[0].message.content);

    if (!resultJson.careerRecommendations) {
      resultJson.careerRecommendations = [];
    }

    if (!resultJson.atsScore) {
      resultJson.atsScore = 0;
    }

    if (!resultJson.atsVerdict) {
      resultJson.atsVerdict = "Unknown";
    }

    if (!resultJson.atsBreakdown) {
      resultJson.atsBreakdown = {
        keywords: 0,
        skills: 0,
        projects: 0,
        experience: 0,
        formatting: 0
      };
    }

    // Save to MongoDB with userId
    const historyEntry = new Analysis({
      userId: userId,
      jobTitle: jobDescription.substring(0, 60),
      matchPercentage: resultJson.matchPercentage || 0,
      missingSkills: resultJson.missingSkills || [],
      resumeTips: resultJson.resumeTips || [],
      atsScore: resultJson.atsScore,
      atsVerdict: resultJson.atsVerdict,
      atsBreakdown: resultJson.atsBreakdown,
      careerRecommendations: resultJson.careerRecommendations || [],
      learningPath: resultJson.learningPath || [],
      interviewQuestions: resultJson.interviewQuestions || []
    });

    await historyEntry.save();

    // Return the FULL JSON to the frontend
    res.json(resultJson);
  } catch (error) {
    console.error("ANALYSIS ERROR:", error);
    res.status(500).json({ error: "Analysis failed." });
  }
});

// --- FETCH HISTORY ROUTE (PROTECTED) ---
app.get('/api/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    const userId = decoded.id;

    const history = await Analysis.find({ userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
