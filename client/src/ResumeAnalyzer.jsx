import React, { useState } from 'react';
import axios from 'axios';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', "MERN Stack Developer"); // You can add an input field for this later

    try {
      // Ensure this matches your server port (5000)
      const res = await axios.post('http://localhost:5000/api/analyze', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Smart Placement Assistant</h1>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div style={{ marginTop: '20px', textAlign: 'left', border: '1px solid #ccc', padding: '15px' }}>
          <h3>Match Score: {result.matchPercentage}%</h3>
          
          <h4>Missing Skills:</h4>
          <ul>
            {result.missingSkills.map((s, i) => <li key={i}>{s}</li>)}
          </ul>

          <h4>Tips:</h4>
          <ul>
            {result.resumeTips?.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;