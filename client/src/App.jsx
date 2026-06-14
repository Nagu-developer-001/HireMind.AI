import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingState from './LoadingState.jsx';
// 1. IMPORT PDF LIBRARIES
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- SUB-COMPONENT: InterviewQuestionsView ---
const InterviewQuestionsView = ({ questions }) => {
  const [visibleIdx, setVisibleIdx] = useState(null);

  return (
    <div style={styles.glassCard}>
      <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Prep: Interview Questions</h3>
      <div style={styles.listContainer}>
        {questions && questions.length > 0 ? questions.map((q, i) => (
          <div key={i} style={styles.questionBox}>
            <p style={styles.itemText}><strong>Q:</strong> {q.question}</p>
            <button 
              onClick={() => setVisibleIdx(visibleIdx === i ? null : i)}
              style={styles.revealBtn}
            >
              {visibleIdx === i ? "Hide Hint" : "Show Answer Hint"}
            </button>
            {visibleIdx === i && (
              <p style={styles.hintText}>{q.answerHint}</p>
            )}
          </div>
        )) : (
          <p style={styles.itemText}>Questions will be generated based on your analysis.</p>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: RoadmapView ---
const RoadmapView = ({ roadmap }) => (
  <div style={styles.glassCard}>
    <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Learning Roadmap</h3>
    <div style={styles.timelineContainer}>
      {roadmap && roadmap.length > 0 ? roadmap.map((step, i) => (
        <div key={i} style={styles.timelineItem}>
          <div style={styles.timelineBadge}>{step.timeframe}</div>
          <div style={styles.timelineContent}>
            <h4 style={styles.timelineSkill}>{step.skill}</h4>
            <a 
              href={step.resource?.startsWith('http') ? step.resource : `https://www.google.com/search?q=best+way+to+learn+${step.skill}`} 
              target="_blank" 
              rel="noreferrer"
              style={styles.resourceActionButton}
            >
              Start Learning →
            </a>
          </div>
        </div>
      )) : (
        <p style={styles.itemText}>No roadmap available for this analysis.</p>
      )}
    </div>
  </div>
);

// --- SUB-COMPONENT: AnalysisDashboard ---
// 2. ADD EXPORT LOGIC WRAPPER
const AnalysisDashboard = ({ result, onExport }) => {
  const getTheme = (score) => {
    if (score > 75) return { color: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' };
    if (score > 50) return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' };
    return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.15)' };
  };

  const theme = getTheme(result.matchPercentage);

  return (
    <div style={styles.dashboardContainer}>
      {/* EXPORT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
        <button onClick={onExport} style={styles.exportBtn}>
          📥 Export Roadmap & Report
        </button>
      </div>

      {/* 3. WRAP THE CONTENT TO BE CAPTURED */}
      <div id="capture-area">
        <div style={{ ...styles.glassCard, border: `1px solid ${theme.glow}`, boxShadow: `0 0 50px ${theme.glow}`, marginBottom: '30px' }}>
          <span style={{ ...styles.labelUpper, color: theme.color }}>Match Analysis</span>
          <div style={{ ...styles.heroPercentage, color: theme.color }}>
            {result.matchPercentage}<span style={styles.smallPercent}>%</span>
          </div>
          <div style={styles.progressContainer}>
            <div 
              style={{ 
                ...styles.progressBar, 
                width: `${result.matchPercentage}%`, 
                backgroundColor: theme.color, 
                boxShadow: `0 0 15px ${theme.color}` 
              }} 
            />
          </div>
          <p style={styles.heroSubtext}>Analysis based on provided Job Description</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.glassCard}>
            <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Missing Skills</h3>
            <div style={styles.listContainer}>
              {result.missingSkills?.map((skill, i) => (
                <div key={i} style={styles.itemRow}>
                  <div style={styles.neonBlueDot} />
                  <span style={styles.itemText}>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <RoadmapView roadmap={result.learningPath} />

          <div style={styles.glassCard}>
            <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Optimization Tips</h3>
            <div style={styles.listContainer}>
              {result.resumeTips?.map((tip, i) => (
                <div key={i} style={styles.itemRow}>
                  <div style={styles.neonBlueDot} />
                  <p style={styles.itemText}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <InterviewQuestionsView questions={result.interviewQuestions} />
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: HistoryView ---
const HistoryView = ({ history }) => (
  <div style={styles.dashboardContainer}>
    <h2 style={styles.cardTitle}><span style={styles.accentText}>/</span> Past Audits</h2>
    {history.length > 0 ? history.map((item, i) => (
      <div key={i} style={{ ...styles.glassCard, textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '25px', marginBottom: '15px' }}>
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{item.jobTitle || "Resume Analysis"}</h4>
          <p style={{ color: '#555', fontSize: '0.8rem', margin: '5px 0 0' }}>{new Date(item.timestamp).toLocaleDateString()}</p>
        </div>
        <div style={{ color: item.matchPercentage > 70 ? '#10b981' : '#f59e0b', fontSize: '1.5rem', fontWeight: '800' }}>
          {item.matchPercentage}%
        </div>
      </div>
    )) : <p style={styles.mainSub}>No history yet. Run your first audit under the Analyzer tab!</p>}
  </div>
);

// --- SUB-COMPONENT: ResourcesView ---
const ResourcesView = () => (
  <div style={styles.grid}>
    <div style={styles.glassCard}>
      <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Technical Prep</h3>
      <div style={styles.listContainer}>
        <a href="https://www.hackerrank.com/domains/java" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ HackerRank Java Mastery</a>
        <a href="https://react.dev/" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ Modern React Documentation</a>
        <a href="https://www.geeksforgeeks.org/top-100-dsa-interview-questions/" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ DSA Interview Patterns</a>
      </div>
    </div>
    <div style={styles.glassCard}>
      <h3 style={styles.cardTitle}><span style={styles.accentText}>/</span> Placement Readiness</h3>
      <div style={styles.listContainer}>
        <a href="https://www.naukri.com/campus" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ Naukri Campus (CodeQuest)</a>
        <a href="https://www.linkedin.com/pulse/how-optimize-your-linkedin-profile-placement-ready-2026" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ LinkedIn Profile Optimization</a>
        <a href="https://roadmap.sh/full-stack" target="_blank" rel="noreferrer" style={styles.resourceLink}>→ Full Stack Developer Roadmap</a>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT: App ---
export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [activeView, setActiveView] = useState('analyzer'); 
  const [history, setHistory] = useState([]);

  // 4. THE EXPORT FUNCTION
  const handleExportPDF = () => {
    const input = document.getElementById('capture-area');
    
    // Temporarily hide buttons that shouldn't be in PDF (like "Show Hint")
    const buttons = input.querySelectorAll('button');
    buttons.forEach(btn => btn.style.display = 'none');

    html2canvas(input, {
      backgroundColor: '#050505',
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Roadmap_Report_${new Date().toLocaleDateString()}.pdf`);
      
      // Bring buttons back
      buttons.forEach(btn => btn.style.display = 'inline-block');
    });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) return alert("Select a PDF first!");
    if (!jobDescription.trim()) return alert("Please paste a Job Description!");

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    setResult(null); 
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData);
      setResult(response.data);
      setLoading(false); 
    } catch (error) {
      setLoading(false); 
      alert("An error occurred during analysis. Check your backend/Groq API key.");
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>HireMind<span style={styles.logoAccent}>.AI</span></div>
          <div style={styles.navLinks}>
            <span 
              style={activeView === 'analyzer' ? styles.activeLink : styles.link} 
              onClick={() => setActiveView('analyzer')}
            >Analyzer</span>
            <span 
              style={activeView === 'history' ? styles.activeLink : styles.link} 
              onClick={() => { setActiveView('history'); fetchHistory(); }}
            >History</span>
            <span 
              style={activeView === 'resources' ? styles.activeLink : styles.link} 
              onClick={() => setActiveView('resources')}
            >Resources</span>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        {activeView === 'analyzer' && (
          <>
            <div style={styles.heroHeader}>
              <h1 style={styles.mainHeading}>Elevate Your Career</h1><br/>
              <p style={styles.mainSub}>AI-driven resume auditing for the modern workforce.</p>
            </div>

            <div style={styles.inputWrapper}>
              <textarea 
                placeholder="Paste the Job Description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={styles.textArea}
              />
              
              <div style={styles.uploadArea}>
                <label style={styles.fileBox}>
                  <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                  <span style={styles.fileText}>{file ? file.name : "Choose Resume (PDF)"}</span>
                </label>
                <button onClick={handleAnalyze} disabled={loading} style={styles.primaryBtn}>
                  {loading ? "Analysing..." : "Run Audit"}
                </button>
              </div>
            </div>

            {loading && <LoadingState />}
            {/* PASS EXPORT FUNCTION TO DASHBOARD */}
            {!loading && result && <AnalysisDashboard result={result} onExport={handleExportPDF} />}
          </>
        )}

        {activeView === 'history' && <HistoryView history={history} />}
        {activeView === 'resources' && <ResourcesView />}
      </div>
    </div>
  );
}

const styles = {
  // ... ALL YOUR EXISTING STYLES ...
  page: { backgroundColor: '#050505', minHeight: '100vh', color: '#ffffff', fontFamily: '"Inter", sans-serif', paddingBottom: '80px' },
  nav: { borderBottom: '1px solid #1a1a1a', backgroundColor: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1100px', margin: '0 auto', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px' },
  logoAccent: { color: '#3b82f6' },
  navLinks: { display: 'flex', gap: '35px' },
  link: { fontSize: '0.85rem', color: '#666', cursor: 'pointer', transition: '0.2s' },
  activeLink: { fontSize: '0.85rem', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
  heroHeader: { textAlign: 'center', marginBottom: '50px' },
  mainHeading: { fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', margin: 0, color: '#fff' },
  mainSub: { color: '#888', fontSize: '1.1rem', marginTop: '12px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '60px' },
  textArea: { backgroundColor: '#0d0d0d', color: '#fff', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', fontSize: '0.95rem', minHeight: '150px', outline: 'none' },
  uploadArea: { backgroundColor: '#0d0d0d', padding: '12px', borderRadius: '16px', display: 'flex', gap: '12px', border: '1px solid #1a1a1a' },
  fileBox: { flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '20px', cursor: 'pointer' },
  fileText: { color: '#666', fontSize: '0.95rem' },
  primaryBtn: { backgroundColor: '#fff', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
  dashboardContainer: { display: 'flex', flexDirection: 'column', gap: '30px' },
  glassCard: { backgroundColor: '#0d0d0d', padding: '30px', borderRadius: '28px', border: '1px solid #1a1a1a', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' },
  labelUpper: { fontSize: '0.8rem', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase' },
  heroPercentage: { fontSize: '10rem', fontWeight: '900', margin: '10px 0', letterSpacing: '-6px', lineHeight: 1 },
  smallPercent: { fontSize: '3.5rem', fontWeight: '300' },
  progressContainer: { height: '6px', backgroundColor: '#1a1a1a', width: '280px', margin: '25px auto', borderRadius: '10px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '10px', transition: 'width 1.2s' },
  heroSubtext: { color: '#555', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', alignItems: 'stretch' },
  cardTitle: { textAlign: 'left', fontSize: '1.2rem', fontWeight: '700', marginBottom: '30px', display: 'flex', alignItems: 'center' },
  accentText: { color: '#3b82f6', marginRight: '10px' },
  listContainer: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' },
  itemRow: { display: 'flex', gap: '18px', alignItems: 'flex-start' },
  neonBlueDot: { minWidth: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '7px', boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)' },
  itemText: { margin: 0, fontSize: '0.95rem', color: '#999', lineHeight: '1.6' },
  resourceLink: { color: '#999', textDecoration: 'none', fontSize: '0.95rem', transition: '0.2s', marginBottom: '10px' },
  timelineContainer: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '25px' },
  timelineItem: { display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid #3b82f644', paddingLeft: '20px', position: 'relative', paddingBottom: '10px' },
  timelineBadge: { 
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a', 
    color: '#3b82f6', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    fontSize: '0.65rem', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    border: '1px solid #3b82f644'
  },
  timelineContent: { marginTop: '5px' },
  timelineSkill: { margin: '0 0 10px 0', fontSize: '1rem', color: '#fff', fontWeight: '600', lineHeight: '1.4' },
  resourceActionButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#3b82f611',
    color: '#3b82f6',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid #3b82f644',
    transition: '0.3s ease',
    textAlign: 'center'
  },
  questionBox: {
    backgroundColor: '#050505',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #1a1a1a',
    marginBottom: '15px',
    textAlign: 'left'
  },
  revealBtn: {
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f644',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: '0.2s ease'
  },
  hintText: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#0d0d0d',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#10b981',
    borderLeft: '4px solid #10b981',
    lineHeight: '1.5'
  },
  // 5. ADD THE NEW EXPORT BUTTON STYLE
  exportBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    border: '1px solid #3b82f644',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: '0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};