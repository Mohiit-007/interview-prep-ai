import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Code, MessageSquare, Map } from "lucide-react";
import { Download, FilePlus } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import "./Interview.scss";

const Interview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("technical");
  const [openIndex, setOpenIndex] = useState(null);
  const [report, setReport] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/report/${id}`,
          { withCredentials: true }
        );
        setReport(res.data.InterviewReport);
      } catch (err) {
        console.error("Error fetching report", err);
      }
    };
    fetchReport();
  }, []);

  if (!report) {
    return <div className="loading">Loading Interview Report...</div>;
  }

  const {
    matchScore,
    technicalQuestions,
    behavioralQuestions,
    skillgaps,
    preparationPlan,
  } = report;

  let matchText = "";
  let colorstyle = "";

  if (matchScore < 40) {
    matchText = "Weak match for this role";
    colorstyle = "#ef4444";
  } else if (matchScore < 70) {
    matchText = "Medium match for this role";
    colorstyle = "#f59e0b";
  } else {
    matchText = "Strong match for this role";
    colorstyle = "#22c55e";
  }


  const renderQuestions = (questions) => (
    <>
      {questions.map((q, i) => (
        <div key={i} className="accordion-card">
          <div
            className="accordion-header"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="header-left">
              <span className="q-badge">Q{i + 1}</span>
              <h4 className="question-title">{q.question}</h4>
            </div>
            <span className={`arrow ${openIndex === i ? "rotate" : ""}`}>
              ▾
            </span>
          </div>

          <div className={`accordion-body ${openIndex === i ? "open" : ""}`}>
            <div className="answer-block intention-block">
              <div className="block-title">INTENTION</div>
              <p>{q.intention}</p>
            </div>
            <div className="answer-block model-block">
              <div className="block-title">MODEL ANSWER</div>
              <p>{q.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const handleDownloadResume = async () => {
    try {
      setDownloading(true);
      const res = await axios.post(
        `http://localhost:8000/resume/pdf/${id}`,
        {},
        { responseType: "blob", withCredentials: true }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
      toast.success("Resume downloaded!", { icon: "📄" });
    } catch (error) {
      console.error("Resume download failed", error);
      toast.error("Failed to generate resume");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="interview-page">

      {/* Sidebar */}
      <aside className="sidebar">
        <h4>SECTIONS</h4>

        <button className="back-home-btn" onClick={() => navigate("/")}>
          ← Dashboard
        </button>

        <button
          className={`sidebar-item ${activeSection === "technical" ? "active" : ""}`}
          onClick={() => setActiveSection("technical")}
        >
          <Code size={18} />
          <span>Technical Questions</span>
        </button>

        <button
          className={`sidebar-item ${activeSection === "behavioral" ? "active" : ""}`}
          onClick={() => setActiveSection("behavioral")}
        >
          <MessageSquare size={18} />
          <span>Behavioral Questions</span>
        </button>

        <button
          className={`sidebar-item ${activeSection === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveSection("roadmap")}
        >
          <Map size={18} />
          <span>Road Map</span>
        </button>

        <div className="download-section">
          {report.resume && report.resume.trim().length > 50 ? (
            <button
              className="download-resume-btn"
              onClick={handleDownloadResume}
              disabled={downloading}
            >
              {downloading ? (
                <><span className="loader"></span>Generating Resume...</>
              ) : (
                <><Download size={18} />Download Resume</>
              )}
            </button>
          ) : (
            <div className="no-resume-box">
              <p>No resume uploaded for this report</p>
              <button className="add-resume-btn" onClick={() => navigate("/")}>
                <FilePlus size={15} />
                Add Resume
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="content fade">
        {activeSection === "technical" && (
          <>
            <h2>Technical Questions</h2>
            <br />
            {renderQuestions(technicalQuestions)}
          </>
        )}

        {activeSection === "behavioral" && (
          <>
            <h2>Behavioral Questions</h2>
            <br />
            {renderQuestions(behavioralQuestions)}
          </>
        )}

        {activeSection === "roadmap" && (
          <>
            <h2>Preparation Road Map</h2>
            <br />
            <div className="timeline">
              {preparationPlan.map((day, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="day-pill">Day {day.day}</span>
                    <h4>{day.focus}</h4>
                    <ul>
                      {day.tasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <aside className="right-panel">

        <div className="score-card">
          <div className="score-ring">
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle className="ring-bg" cx="80" cy="80" r="60" />
              <circle
                className="ring-progress"
                cx="80"
                cy="80"
                r="60"
                style={{
                  strokeDashoffset: 377 - (377 * matchScore) / 100,
                  stroke: colorstyle,
                }}
              />
            </svg>

            <div className="score-text">
              <span>{matchScore}%</span>
            </div>
          </div>

          <p className="score-label" style={{ color: colorstyle }}>
            {matchText}
          </p>
        </div>

        <div className="skill-gaps">
          <h4>Skill Gaps</h4>
          {skillgaps.map((gap, i) => (
            <div key={i} className={`gap-card ${gap.severity}`}>
              <span className="severity-dot"></span>
              {gap.skill}
            </div>
          ))}
        </div>

      </aside>
    </div>
  );
};

export default Interview;