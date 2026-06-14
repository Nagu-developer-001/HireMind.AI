import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  matchPercentage: { type: Number, required: true },
  missingSkills: [String],
  resumeTips: [String],
  learningPath: [{ 
    skill: String, 
    resource: String, 
    timeframe: String 
  }], // Added for the Roadmap feature
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model('Analysis', AnalysisSchema);