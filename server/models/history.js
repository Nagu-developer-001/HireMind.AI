import mongoose from 'mongoose';

    const AnalysisSchema = new mongoose.Schema({
    jobTitle: String,
    matchPercentage: Number,
    missingSkills: [String],
    resumeTips: [String],
    // Add these two so history works:
    learningPath: Array, 
    interviewQuestions: Array,
    timestamp: { type: Date, default: Date.now }
});