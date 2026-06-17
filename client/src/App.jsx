import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingState from './LoadingState.jsx';
import Spline from "@splinetool/react-spline";
// 1. IMPORT PDF LIBRARIES
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from 'html2canvas';

//--- SUB-COMPONENT:ResumeBuilder 
const ResumeBuilder = () => {
  const calculateATSScore = () => {
  let score = 0;

  if (resumeData.fullName) score += 10;
  if (resumeData.email) score += 10;
  if (resumeData.phone) score += 10;
  if (resumeData.linkedin) score += 10;

  if (resumeData.degree) score += 10;
  if (resumeData.college) score += 10;

  if (resumeData.skills) score += 15;

  if (
    resumeData.projectTitle &&
    resumeData.projectDescription
  )
    score += 15;

  if (resumeData.certifications) score += 5;
  if (resumeData.achievements) score += 5;

  return score;
};
  const validateATSResume = () => {
  const issues = [];

  if (!resumeData.fullName.trim())
    issues.push("Full Name missing");

  if (!resumeData.email.trim())
    issues.push("Email missing");

  if (!resumeData.phone.trim())
    issues.push("Phone Number missing");

  if (!resumeData.degree.trim())
    issues.push("Education details missing");

  if (!resumeData.skills.trim())
    issues.push("Skills section missing");

  if (!resumeData.projectTitle.trim())
    issues.push("Project/Experience missing");

  if (!resumeData.linkedin.trim())
    issues.push("LinkedIn profile recommended");

  return issues;
};
const generateResumePDF = () => {
  const issues = validateATSResume();
  const atsScore = calculateATSScore();

  if (issues.length > 0) {
    const proceed = window.confirm(
      `ATS Score: ${atsScore}/100\n\n` +
      issues.join("\n") +
      "\n\nGenerate Resume Anyway?"
    );

    if (!proceed) return;
  }

  const pdf = new jsPDF();

  let y = 20;

  // =========================
  // NAME
  // =========================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);

  pdf.text(
    resumeData.fullName || "Your Name",
    20,
    y
  );

  y += 6;

  // =========================
  // CONTACT
  // =========================
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(
    `${resumeData.email || ""} | ${resumeData.phone || ""}`,
    20,
    y
  );

  y += 7;

  let x = 20;

pdf.setTextColor(0, 102, 204);

if (resumeData.linkedin) {
  pdf.textWithLink(
    "LinkedIn",
    x,
    y,
    {
      url: resumeData.linkedin
    }
  );

  x += 35;
}

if (resumeData.github) {
  pdf.textWithLink(
    "GitHub",
    x,
    y,
    {
      url: resumeData.github
    }
  );

  x += 30;
}

if (resumeData.portfolio) {
  pdf.textWithLink(
    "Portfolio",
    x,
    y,
    {
      url: resumeData.portfolio
    }
  );
}

pdf.setTextColor(0, 0, 0);

y += 6;
let links = [];

if (resumeData.linkedin) links.push("LinkedIn");
if (resumeData.github) links.push("GitHub");
if (resumeData.portfolio) links.push("Portfolio");
  if (links.length > 0) {
    pdf.text(links.join(" | "), 20, y);
    y += 6;
  }

  y += 3;

  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // PROFESSIONAL SUMMARY
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "PROFESSIONAL SUMMARY",
    20,
    y
  );

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const summary =
    `Motivated ${resumeData.degree || "student"} with skills in ${
      resumeData.skills || "various domains"
    }. Passionate about learning, problem solving and contributing to real-world projects.`;

  const summaryLines =
    pdf.splitTextToSize(summary, 170);

  pdf.text(summaryLines, 20, y);

  y += summaryLines.length * 6 + 7;

  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // EDUCATION
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text("EDUCATION", 20, y);

  y +=6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(
    resumeData.degree || "",
    20,
    y
  );

  y += 6;

  pdf.text(
    resumeData.college || "",
    20,
    y
  );

  y += 6;

  if (resumeData.cgpa) {
    pdf.text(
      `CGPA: ${resumeData.cgpa}`,
      20,
      y
    );

    y += 6;
  }

  pdf.text(
    `Graduation Year: ${
      resumeData.graduationYear || ""
    }`,
    20,
    y
  );

  y += 6;

  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // SKILLS
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text("SKILLS", 20, y);

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const skillLines =
    pdf.splitTextToSize(
      resumeData.skills || "",
      170
    );

  pdf.text(skillLines, 20, y);

y += skillLines.length * 5 + 5;
  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // PROJECTS / EXPERIENCE
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "PROJECTS / EXPERIENCE",
    20,
    y
  );

  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);

  pdf.text(
    resumeData.projectTitle ||
      "Project Title",
    20,
    y
  );

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const projectLines =
    pdf.splitTextToSize(
      resumeData.projectDescription || "",
      170
    );

  pdf.text(projectLines, 20, y);

  y += projectLines.length * 6 + 5;

  if (resumeData.projectLink) {
    pdf.setTextColor(0, 102, 204);

    pdf.textWithLink(
      "Project Link",
      20,
      y,
      {
        url: resumeData.projectLink,
      }
    );

    pdf.setTextColor(0, 0, 0);

    y += 6;
  }

  y += 5;

  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // CERTIFICATIONS
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "CERTIFICATIONS",
    20,
    y
  );

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const certLines =
    pdf.splitTextToSize(
      resumeData.certifications || "",
      170
    );

  pdf.text(certLines, 20, y);

  y += certLines.length * 6 + 10;

  pdf.line(20, y, 190, y);

  y += 6;

  // =========================
  // ACHIEVEMENTS
  // =========================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "ACHIEVEMENTS",
    20,
    y
  );

  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const achievementLines =
    pdf.splitTextToSize(
      resumeData.achievements || "",
      170
    );

  pdf.text(
    achievementLines,
    20,
    y
  );

  // =========================
  // SAVE
  // =========================

  pdf.save(
    `${resumeData.fullName || "Resume"}_Resume.pdf`
  );
};
 const [resumeData, setResumeData] = useState({
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",

  degree: "",
  college: "",
  cgpa: "",
  graduationYear: "",

  skills: "",

  projectTitle: "",
  projectDescription: "",
  projectLink: "",

  certifications: "",
  achievements: ""
});
  const handleChange = (e) => {
  setResumeData({
    ...resumeData,
    [e.target.name]: e.target.value,
  });
};

return (
  <div style={styles.resumeContainer}>
    <div style={styles.glassCard}>
      <h2 style={styles.resumeTitle}>
        Resume Builder
      </h2>

      {/* Personal Information */}

      <h3 style={styles.sectionHeading}>
        Personal Information
      </h3>

      <div style={styles.resumeGrid}>
        <input
          style={styles.resumeInput}
          name="fullName"
          placeholder="Full Name"
          value={resumeData.fullName}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="email"
          placeholder="Email"
          value={resumeData.email}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="phone"
          placeholder="Phone Number"
          value={resumeData.phone}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="linkedin"
          placeholder="LinkedIn URL"
          value={resumeData.linkedin}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="github"
          placeholder="GitHub URL (Optional)"
          value={resumeData.github}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="portfolio"
          placeholder="Portfolio URL (Optional)"
          value={resumeData.portfolio}
          onChange={handleChange}
        />
      </div>

      {/* Education */}

      <h3 style={styles.sectionHeading}>
        Education
      </h3>

      <div style={styles.resumeGrid}>
        <input
          style={styles.resumeInput}
          name="degree"
          placeholder="Degree"
          value={resumeData.degree}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="college"
          placeholder="College / University"
          value={resumeData.college}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="cgpa"
          placeholder="CGPA / Percentage"
          value={resumeData.cgpa}
          onChange={handleChange}
        />

        <input
          style={styles.resumeInput}
          name="graduationYear"
          placeholder="Graduation Year"
          value={resumeData.graduationYear}
          onChange={handleChange}
        />
      </div>

      {/* Skills */}

      <h3 style={styles.sectionHeading}>
        Skills
      </h3>

      <textarea
        style={styles.resumeTextarea}
        name="skills"
        placeholder="Example: React, Java, Leadership, Marketing, Research, Finance, Python..."
        value={resumeData.skills}
        onChange={handleChange}
      />

      {/* Projects / Experience */}

      <h3 style={styles.sectionHeading}>
        Projects / Experience
      </h3>

      <input
        style={styles.resumeInput}
        name="projectTitle"
        placeholder="Project / Internship / Experience Title"
        value={resumeData.projectTitle}
        onChange={handleChange}
      />

      <textarea
        style={styles.resumeTextarea}
        name="projectDescription"
        placeholder="Describe your project, internship, research work, experience, responsibilities, achievements..."
        value={resumeData.projectDescription}
        onChange={handleChange}
      />

      <input
        style={styles.resumeInput}
        name="projectLink"
        placeholder="Project / GitHub / LinkedIn Link (Optional)"
        value={resumeData.projectLink}
        onChange={handleChange}
      />

      {/* Certifications */}

      <h3 style={styles.sectionHeading}>
        Certifications
      </h3>

      <textarea
        style={styles.resumeTextarea}
        name="certifications"
        placeholder="One certification per line"
        value={resumeData.certifications}
        onChange={handleChange}
      />

      {/* Achievements */}

      <h3 style={styles.sectionHeading}>
        Achievements
      </h3>

      <textarea
        style={styles.resumeTextarea}
        name="achievements"
        placeholder="One achievement per line"
        value={resumeData.achievements}
        onChange={handleChange}
      />

      <button
        style={styles.primaryBtn}
        onClick={generateResumePDF}
      >
        Generate Resume PDF
      </button>
    </div>
  </div>
);
};

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
const CareerRecommendationsView = ({ careers }) => (
  <div style={styles.glassCard}>
    <h3 style={styles.cardTitle}>
      <span style={styles.accentText}>/</span>
      Career Path Recommendations
    </h3>

    {careers && careers.length > 0 ? (
      careers.map((career, index) => (
        <div
          key={index}
          style={styles.careerCard}
        >
          <h4 style={styles.careerTitle}>
            {index === 0
              ? "🥇"
              : index === 1
              ? "🥈"
              : "🥉"}{" "}
            {career.title}
          </h4>

          <div style={styles.careerMeta}>
            <span>
              Match: {career.match}%
            </span>

            <span>
              Salary: {career.salary}
            </span>
          </div>

          <p style={styles.careerWhy}>
            {career.why}
          </p>

          <div>
            <strong style={{ color: "#fff" }}>
              Missing Skills:
            </strong>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              {career.missingSkills?.map(
                (skill, i) => (
                  <span
                    key={i}
                    style={styles.skillTag}
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      ))
    ) : (
      <p style={styles.itemText}>
        No career recommendations available.
      </p>
    )}
  </div>
);
const ATSScoreView = ({ result }) => (
  <div style={styles.glassCard}>
    <h3 style={styles.cardTitle}>
      <span style={styles.accentText}>/</span>
      ATS Score
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "25px",
      }}
    >
      <div
        style={{
          fontSize: "3.5rem",
          fontWeight: "900",
          color: "#3b82f6",
          lineHeight: "1",
        }}
      >
        {result.atsScore}
        <span
          style={{
            fontSize: "1.2rem",
            color: "#666",
          }}
        >
          /100
        </span>
      </div>

      <div
        style={{
          marginTop: "12px",
          padding: "6px 16px",
          borderRadius: "20px",
          background: "#3b82f622",
          color: "#3b82f6",
          fontWeight: "600",
          fontSize: "0.85rem",
        }}
      >
        {result.atsVerdict}
      </div>
    </div>

    <div style={styles.listContainer}>
      <div style={styles.itemRow}>
        <span>Keywords</span>
        <span>{result.atsBreakdown?.keywords}/30</span>
      </div>

      <div style={styles.itemRow}>
        <span>Skills</span>
        <span>{result.atsBreakdown?.skills}/25</span>
      </div>

      <div style={styles.itemRow}>
        <span>Projects</span>
        <span>{result.atsBreakdown?.projects}/15</span>
      </div>

      <div style={styles.itemRow}>
        <span>Experience</span>
        <span>{result.atsBreakdown?.experience}/20</span>
      </div>

      <div style={styles.itemRow}>
        <span>Formatting</span>
        <span>{result.atsBreakdown?.formatting}/10</span>
      </div>
    </div>
  </div>
);
// --- SUB-COMPONENT: AnalysisDashboard ---
// 2. ADD EXPORT LOGIC WRAPPER
const AnalysisDashboard = ({ result, onExport }) => {
  const getTheme = (score) => {
    if (score > 75)
      return {
        color: "#10b981",
        glow: "rgba(16, 185, 129, 0.15)",
      };

    if (score > 50)
      return {
        color: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.15)",
      };

    return {
      color: "#ef4444",
      glow: "rgba(239, 68, 68, 0.15)",
    };
  };

  const theme = getTheme(result.matchPercentage);

  return (
    <div style={styles.dashboardContainer}>
      {/* Export Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "-20px",
        }}
      >
        <button onClick={onExport} style={styles.exportBtn}>
          📥 Export Roadmap & Report
        </button>
      </div>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    marginBottom: "30px"
  }}
>
  <ATSScoreView result={result} />
</div>
        {/* Match Score Card */}
        <div
          style={{
            ...styles.glassCard,
            border: `1px solid ${theme.glow}`,
            boxShadow: `0 0 50px ${theme.glow}`,
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              ...styles.labelUpper,
              color: theme.color,
            }}
          >
            Match Analysis
          </span>

          <div
            style={{
              ...styles.heroPercentage,
              color: theme.color,
            }}
          >
            {result.matchPercentage}
            <span style={styles.smallPercent}>%</span>
          </div>

          <div style={styles.progressContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${result.matchPercentage}%`,
                backgroundColor: theme.color,
                boxShadow: `0 0 15px ${theme.color}`,
              }}
            />
          </div>

          <p style={styles.heroSubtext}>
            Analysis based on provided Job Description
          </p>
        </div>

        {/* Main Cards */}
        <div style={styles.grid}>
          {/* Missing Skills */}
          <div style={styles.glassCard}>
            <h3 style={styles.cardTitle}>
              <span style={styles.accentText}>/</span>
              Missing Skills
            </h3>

            <div style={styles.listContainer}>
              {result.missingSkills?.map((skill, i) => (
                <div key={i} style={styles.itemRow}>
                  <div style={styles.neonBlueDot} />
                  <span style={styles.itemText}>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Career Recommendations */}
          <CareerRecommendationsView
            careers={result.careerRecommendations}
          />

          {/* Learning Roadmap */}
          <RoadmapView roadmap={result.learningPath} />

          {/* Optimization Tips */}
          {/* Optimization Tips */}
<div
  style={{
    ...styles.glassCard,
    gridColumn: "1 / -1"
  }}
>
  <h3 style={styles.cardTitle}>
    <span style={styles.accentText}>/</span>
    Optimization Tips
  </h3>

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
        <div id="capture-area">
        {/* Interview Questions */}
        <div style={{ marginTop: "30px" }}>
          <InterviewQuestionsView
            questions={result.interviewQuestions}
          />
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
  const [resultType, setResultType] = useState(null);
  const [analysisType, setAnalysisType] = useState("medium");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [activeView, setActiveView] = useState('analyzer'); 
  const [history, setHistory] = useState([]);
  
  // 4. THE EXPORT FUNCTION
const handleExportPDF = () => {
  if (!result) return;
  console.log("ATS Score:", result?.atsScore);
console.log("ATS Verdict:", result?.atsVerdict);
console.log("ATS Breakdown:", result?.atsBreakdown);
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  // WATERMARK
pdf.setTextColor(230, 230, 230);
pdf.setFontSize(50);
pdf.setFont("helvetica", "bold");

pdf.text(
  "HIREMIND.AI",
  pageWidth / 2,
  150,
  {
    angle: 45,
    align: "center"
  }
);

pdf.setTextColor(0, 0, 0);
  // Header
  // HEADER
pdf.setFillColor(15, 23, 42);
pdf.rect(0, 0, pageWidth, 30, "F");

pdf.setTextColor(255, 255, 255);

pdf.setFontSize(22);
pdf.setFont("helvetica", "bold");

pdf.text("HireMind.AI", 15, 18);

pdf.setFontSize(10);

pdf.text(
  "AI Resume Intelligence Platform",
  15,
  25
);

pdf.text(
  `Generated: ${new Date().toLocaleDateString()}`,
  pageWidth - 55,
  18
);

pdf.text(
  "Confidential Report",
  pageWidth - 55,
  25
);
  
  let y = 45;
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
pdf.text("ATS Score", 15, y);

pdf.setFontSize(28);
pdf.setFillColor(59, 130, 246);

pdf.roundedRect(
  70,
  y + 2,
  40,
  12,
  3,
  3,
  "F"
);

pdf.setTextColor(255,255,255);

pdf.setFontSize(10);

pdf.text(
  result.atsVerdict || "Unknown",
  90,
  y + 10,
  { align: "center" }
);

pdf.setTextColor(0,0,0);

pdf.setFontSize(12);
pdf.text(
  `Verdict: ${result.atsVerdict || "Unknown"}`,
  15,
  y + 25
);

autoTable(pdf, {
  startY: y + 35,

  head: [["Category", "Score"]],

  body: [
    ["Keywords", result.atsBreakdown?.keywords],
    ["Skills", result.atsBreakdown?.skills],
    ["Projects", result.atsBreakdown?.projects],
    ["Experience", result.atsBreakdown?.experience],
    ["Formatting", result.atsBreakdown?.formatting]
  ],

  theme: "grid",

  headStyles: {
    fillColor: [59, 130, 246]
  }
});

y = pdf.lastAutoTable.finalY + 15;
  // Match Score
  pdf.setTextColor(0, 0, 0);

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Resume Audit Report", 15, y);

  y += 8;

  pdf.setFontSize(14);
  pdf.text(
    `Match Score: ${result.matchPercentage}%`,
    15,
    y
  );

  y += 15;

  // Missing Skills
  pdf.setFontSize(15);
  pdf.text("Missing Skills", 15, y);

  autoTable(pdf, {
    startY: y + 5,
    head: [["#", "Skill"]],
    body: result.missingSkills?.map((skill, index) => [
      index + 1,
      skill,
    ]) || [],
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
    },
  });

  y = pdf.lastAutoTable.finalY + 15;
  pdf.setFontSize(13);
pdf.text("Career Skill Gaps", 15, y);

autoTable(pdf, {
  startY: y + 5,

  head: [["Career", "Missing Skills"]],

  body:
    result.careerRecommendations?.map((career) => [
      career.title,
      career.missingSkills?.join(", "),
    ]) || [],

  theme: "striped",

  headStyles: {
    fillColor: [239, 68, 68],
  },

  styles: {
    overflow: "linebreak",
  },
});

y = pdf.lastAutoTable.finalY + 15;
  // Roadmap
  pdf.setFontSize(15);
  pdf.text("Learning Roadmap", 15, y);

  autoTable(pdf, {
    startY: y + 5,
    head: [["Timeframe", "Skill"]],
    body:
      result.learningPath?.map((item) => [
        item.timeframe,
        item.skill,
      ]) || [],
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
    },
  });

  y = pdf.lastAutoTable.finalY + 15;

  // Resume Tips
  pdf.setFontSize(15);
  pdf.text("Resume Optimization Tips", 15, y);

  autoTable(pdf, {
    startY: y + 5,
    head: [["Recommendations"]],
    body:
      result.resumeTips?.map((tip) => [tip]) || [],
    theme: "striped",
    headStyles: {
      fillColor: [245, 158, 11],
    },
  });

  y = pdf.lastAutoTable.finalY + 15;

  // Interview Questions
  pdf.setFontSize(15);
  pdf.text("Interview Preparation", 15, y);

  autoTable(pdf, {
    startY: y + 5,
    head: [["Question", "Answer Hint"]],
    body:
      result.interviewQuestions?.map((q) => [
        q.question,
        q.answerHint,
      ]) || [],
    theme: "grid",
    headStyles: {
      fillColor: [139, 92, 246],
    },
    styles: {
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 90 },
    },
  });

  // Footer on every page
  const pageCount =
  pdf.internal.getNumberOfPages();

for (let i = 1; i <= pageCount; i++) {

  pdf.setPage(i);

  pdf.setDrawColor(200);
  pdf.line(
    10,
    285,
    pageWidth - 10,
    285
  );

  pdf.setFontSize(9);
  pdf.setTextColor(120);

  pdf.text(
    "Generated by HireMind.AI",
    15,
    290
  );

  pdf.text(
    "www.hiremind.ai",
    pageWidth / 2,
    290,
    { align: "center" }
  );

  pdf.text(
    `Page ${i} of ${pageCount}`,
    pageWidth - 35,
    290
  );
}

  pdf.save(
    `HireMind_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
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
    setResult(null);
    if (!file) return alert("Select a PDF first!");
    if (!jobDescription.trim()) return alert("Please paste a Job Description!");

    const formData = new FormData();

  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);
  formData.append("analysisType", analysisType);

    setResult(null); 
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData);
      setResult(response.data);
      setResultType(analysisType);
      setLoading(false); 
    } catch (error) {
      setLoading(false); 
      alert("An error occurred during analysis. Check your backend/Groq API key.");
    }
  };

  return (
<div style={styles.layout}>
    
    {/* LEFT SIDE */}
    <div style={styles.splineSection}>
      <div style={{
  position: "absolute",
  bottom: 0,
  right: 0,
  width: "180px",
  height: "60px",
  background: "#000",
  zIndex: 9999
}} />
<div style={styles.splineLogo}>
    HireMind<span style={styles.logoAccent}>.AI</span>
  </div>
      <Spline
        scene="https://prod.spline.design/CP8qC0VzZjsITy-V/scene.splinecode"
      />
    </div>

    {/* RIGHT SIDE */}
    <div style={styles.appSection}>
      <div style={styles.page}>      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.navLinks}>
            <span style={activeView === 'Resume' ? styles.activeLink : styles.link}
              onClick={() => setActiveView('Resume')}
            >Resume</span>
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
    <input
      type="file"
      onChange={handleFileChange}
      style={{ display: "none" }}
    />
    <span style={styles.fileText}>
      {file
        ? file.name
        : "Choose Resume (PDF)"}
    </span>
  </label>

  <select
    value={analysisType}
    onChange={(e) =>
      setAnalysisType(e.target.value)
    }
    style={styles.analysisSelect}
  >
    <option value="medium">
      ⚡ Quick Analysis
    </option>

    <option value="deep">
      🧠 Deep Research
    </option>
  </select>

  <button
    onClick={handleAnalyze}
    disabled={loading}
    style={styles.primaryBtn}
  >
    {loading
      ? "Analysing..."
      : "Run Audit"}
  </button>

</div>
            </div>

            {loading && <LoadingState />}
            {/* PASS EXPORT FUNCTION TO DASHBOARD */}
{!loading &&
  result &&
  resultType === "medium" && (
    <ATSScoreView result={result} />
)}

{!loading &&
  result &&
  resultType === "deep" && (
    <AnalysisDashboard
      result={result}
      onExport={handleExportPDF}
    />
)}      
</>
        )}
        {activeView === "Resume" && (<ResumeBuilder />)}
        {activeView === 'history' && <HistoryView history={history} />}
        {activeView === 'resources' && <ResourcesView />}
      </div>
    </div>
    </div>
    </div>
  );
}

const styles = {
  splineLogo: {
  position: "absolute",
  top: "25px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 999,
  fontSize: "2rem",
  fontWeight: "800",
  color: "#fff",
},
  // ... ALL YOUR EXISTING STYLES ...
page: {
  backgroundColor: '#050505',
  minHeight: '100vh',
  color: '#ffffff',
  fontFamily: '"Inter", sans-serif',
  paddingBottom: '80px',
  width: '100%',
  boxSizing: 'border-box'
},  nav: { borderBottom: '1px solid #1a1a1a', backgroundColor: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 },
navInner: {
  width: "100%",
  padding: "18px 30px",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
},  logo: { fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px' },
  logoAccent: { color: "#3b82f6", },
  navLinks: { display: 'flex', gap: '35px' ,marginLeft: 'auto'},
  link: { fontSize: '0.85rem', color: '#666', cursor: 'pointer', transition: '0.2s' },
  activeLink: { fontSize: '0.85rem', color: '#fff', fontWeight: '600', cursor: 'pointer' },
content: {
  width: "100%",
  padding: "20px",
  boxSizing: "border-box"
},  heroHeader: { textAlign: 'center', marginBottom: '50px' },

  mainHeading: { fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-2px', margin: 0, color: '#fff' },
  mainSub: { color: '#888', fontSize: '1.1rem', marginTop: '12px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '60px' },
  textArea: { backgroundColor: '#0d0d0d', color: '#fff', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px', fontSize: '0.95rem', minHeight: '150px', outline: 'none' },
  uploadArea: { backgroundColor: '#0d0d0d', padding: '12px', borderRadius: '16px', display: 'flex', gap: '12px', border: '1px solid #1a1a1a' },
  fileBox: { flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '20px', cursor: 'pointer' },
  fileText: { color: '#666', fontSize: '0.95rem' },
  primaryBtn: { backgroundColor: '#fff', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
  dashboardContainer: { display: 'flex', flexDirection: 'column', gap: '30px' },
glassCard: {
  width: "100%",
  backgroundColor: "#0d0d0d",
  padding: "30px",
  borderRadius: "28px",
  boxSizing: "border-box"
},  labelUpper: { fontSize: '0.8rem', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase' },
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
  },
layout: {
  display: "flex",
  width: "100%",
  minHeight: "100vh",
},
splineSection: {
  flex: 1.3,
  height: "100vh",
  background: "#000",
  position: "relative",
  overflow: "hidden",
},

appSection: {
  flex: 1.7,
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  minWidth: 0,
},
careerCard: {
  backgroundColor: "#050505",
  border: "1px solid #1a1a1a",
  borderRadius: "16px",
  padding: "18px",
  marginBottom: "18px",
  textAlign: "left"
},

careerTitle: {
  margin: 0,
  color: "#fff",
  fontSize: "1rem",
  fontWeight: "700"
},

careerMeta: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
  color: "#3b82f6",
  fontSize: "0.85rem",
  fontWeight: "600"
},

careerWhy: {
  color: "#999",
  lineHeight: "1.6",
  marginTop: "12px",
  marginBottom: "15px"
},

skillTag: {
  backgroundColor: "#3b82f611",
  border: "1px solid #3b82f644",
  color: "#3b82f6",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: "600"
},
splineLogo: {
  position: "absolute",
  top: "25px",
  left: "30px",
  zIndex: 999,
  fontSize: "2rem",
  fontWeight: "800",
  color: "#fff",
  letterSpacing: "-1px",
},
resumeContainer: {
  width: "100%",
},

resumeTitle: {
  fontSize: "2rem",
  fontWeight: "800",
  color: "#fff",
  marginBottom: "30px",
  textAlign: "left",
},

resumeGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  width: "100%"
},

resumeInput: {
  backgroundColor: "#050505",
  border: "1px solid #1a1a1a",
  color: "#fff",
  padding: "14px",
  borderRadius: "12px",
  outline: "none",
  fontSize: "0.95rem",
},

resumeTextarea: {
  width: "100%",
  minHeight: "120px",
  backgroundColor: "#050505",
  border: "1px solid #1a1a1a",
  color: "#fff",
  padding: "14px",
  borderRadius: "12px",
  outline: "none",
  fontSize: "0.95rem",
  marginBottom: "15px",
  resize: "vertical",
  boxSizing: "border-box",
},
sectionHeading: {
  color: "#fff",
  fontSize: "1.2rem",
  fontWeight: "700",
  marginTop: "25px",
  marginBottom: "15px"
},

resumeContainer: {
  width: "100%"
},

resumeGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
  marginBottom: "15px"
},
analysisSelect: {
  background: "#111827",
  color: "#fff",
  border: "1px solid #374151",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  outline: "none",
  cursor: "pointer",
  minWidth: "180px"
},
resumeInput: {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #222",
  background: "#0d0d0d",
  color: "#fff",
  outline: "none"
},

resumeTextarea: {
  width: "100%",
  minHeight: "100px",
  marginBottom: "15px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #222",
  background: "#0d0d0d",
  color: "#fff",
  resize: "vertical",
  boxSizing: "border-box"
},
sectionHeading: {
  color: "#fff",
  fontSize: "1.2rem",
  fontWeight: "700",
  marginTop: "25px",
  marginBottom: "15px"
},
};