import pdf from 'pdf-parse-fork';
import axios from 'axios';

export const analyzePlacement = async (req, res) => {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: "Resume file missing" });
        }

        const jd = req.body.jobDescription || "MERN Stack Developer";
        const resumeBuffer = req.files.resume[0].buffer;

        // 1. Extract Text from PDF
        const data = await pdf(resumeBuffer);
        const resumeText = data.text;

        // 2. API Configuration
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // FIX: Re-structured the payload and fixed the syntax error
        const payload = {
            contents: [{
                parts: [{
                    text: `You are an expert HR and Technical Recruiter. 
                    Analyze the following Resume against the Job Description.
                    
                    Resume: ${resumeText}
                    Job Description: ${jd}
                    
                    TASK: Return ONLY a valid JSON object. 
                    CRITICAL: You must include "learningPath" and "interviewQuestions" arrays. 
                    If skills are missing, generate 3-5 technical interview questions.

                    Structure:
                    {
                      "matchPercentage": 75,
                      "missingSkills": ["skill1"],
                      "resumeTips": ["tip1"],
                      "learningPath": [
                         { "skill": "...", "resource": "...", "timeframe": "..." }
                      ],
                      "interviewQuestions": [
                         { "question": "...", "answerHint": "..." }
                      ]
                    }`
                }]
            }]
        };

        // 3. Direct API Call
        const response = await axios.post(url, payload);

        // 4. Extract text content safely
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Raw AI Response:", responseText); // Watch your terminal to see if the JSON is complete!

        if (!responseText) {
            throw new Error("Empty response from AI model");
        }

        // 5. Clean and Parse JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI did not return valid JSON");
        }

        const finalResult = JSON.parse(jsonMatch[0]);
        
        // 6. FINAL CHECK: If AI forgot the key, we add it so the frontend doesn't show "Questions will be generated..."
        if (!finalResult.interviewQuestions) {
            finalResult.interviewQuestions = [];
        }

        return res.json(finalResult);

    } catch (error) {
        console.error("Backend Error:", error.message);
        if (error.response && error.response.status === 503) {
            return res.status(503).json({ error: "AI Server busy." });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};