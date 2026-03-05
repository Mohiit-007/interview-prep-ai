import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.scss'
import axios from "axios";

const MAX_CHARS = 5000
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

const Landing = () => {
  const navigate = useNavigate();
  const [jobText, setJobText] = useState('')
  const [selfText, setSelfText] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/",
        { withCredentials: true }
      );
      setReports(res.data.interviewReport || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
    };
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setError("Please login to generate your interview plan.");
      return;
    }

    if (!jobText.trim()) {
      setError("Job description is required.");
      return;
    }

    if (!file && !selfText.trim()) {
      setError("Please upload a resume or write a self description.");
      return;
    }    
    try {

      setLoading(true);   
      const formData = new FormData();
      if (file) {
        formData.append("resume", file);
      }
      formData.append("selfDescription", selfText);
      formData.append("JobDescription", jobText);

      const res = await axios.post(
        "http://localhost:8000/",
        formData,
        { withCredentials: true }
      );

      const report = res.data.interviewReport;

      setReports(prev => [report, ...prev]);
      navigate(`/interview/${report._id}`);

    } catch (err) {
      console.log("Failed to generate report", err);
    } finally {
      setLoading(false); 
    }
  };

  function handleFileSelect(f) {
    if (!f) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowed.includes(f.type)) {
      setError('Only PDF or DOCX files are accepted.')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File exceeds 3MB limit.')
      return
    }
    setError('')
    setFile(f)
  }

  function onDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files && e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0]
    if (f) handleFileSelect(f)
  }

  function clearFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = null
  }

  const canGenerate =
  jobText.trim().length > 0 &&
  (file || selfText.trim().length > 0);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/user/logout",
        {},
        { withCredentials: true }
      );

      navigate("/login");
    } catch (err) {
      console.log("Logout failed", err);
    }
  };

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/user/me",
          { withCredentials: true }
        );

        setIsLoggedIn(!!res.data.user);

      } catch (err) {
        setIsLoggedIn(false);
      } finally{
        setAuthLoading(false);
      }
    };

    checkAuth();

  }, []);  

  return (
    <main className="landing-hero">
      <div className="container">
      <header className="hero-header">
        <div className="header-top">
          <h1 className="title">
            Create Your Custom <span className="title-accent">Interview Plan</span>
          </h1>

          {authLoading ? (
            <div></div>
          ) : isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout} >Logout</button>
          ) : (
            <button className="login-btn" onClick={()=>navigate('/login')} >Login</button>
          )}
        </div>

        <p className="subtitle">
          Let our AI analyze the job requirements and your unique profile to build a winning strategy.
        </p>
      </header>

        <section className="card">
          <div className="columns">
            <div className="col left">
              <h3 className="label">Target Job Description</h3>
              <textarea
                className={`textarea job-textarea ${!jobText.trim() && error ? "error-border" : ""}`}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                maxLength={MAX_CHARS}
                placeholder={"Paste the full job description here... e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"}
              />
              <div className="meta">{jobText.length} / {MAX_CHARS} chars</div>
            </div>

            <div className="col right">
              <h3 className="label">Your Profile</h3>

              <label className="upload-box" onDragOver={(e) => e.preventDefault()} onDrop={onDrop} htmlFor="resume-upload">
                <input ref={fileInputRef} id="resume-upload" type="file" accept=".pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileChange} className="hidden-input" />
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <div className="upload-line">Click to upload or drag & drop</div>
                  <div className="upload-sub">PDF or DOCX (Max 3MB)</div>
                  {file && (
                    <div className="file-row">
                      <span className="file-name">{file.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="remove-btn">Remove</button>
                    </div>
                  )}
                </div>
              </label>

              <div className="divider"><span>OR</span></div>

              <textarea className="textarea self-textarea" value={selfText} onChange={(e) => setSelfText(e.target.value)} placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..." />

              <div className="info-box"><strong>Either a Resume or a Self Description</strong> is required to generate a personalized plan.</div>

              {error && <div className="error">{error}</div>}
            </div>
          </div>

          <div className="card-footer">
            <div className="note">AI-Powered Strategy Generation · Approx 30s</div>

            <button
              disabled={!canGenerate || loading}
              onClick={handleGenerate}
              className={`cta-btn ${(!canGenerate || loading) ? "disabled" : ""}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating Interview Plan...
                </>
              ) : (
                "★ Generate My Interview Strategy"
              )}
            </button>

          </div>
        </section>

          <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>
          {reports.length === 0 ? (
            <p className="no-reports">
              You haven't generated any interview plans yet.
            </p>
          ) : (
            <div className="report-grid">
              {reports.map((report) => (

                <div
                  key={report._id}
                  className="report-card"
                  onClick={() => navigate(`/interview/${report._id}`)}
                >

                  <h3>{report.title}</h3>

                  <p>
                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                  </p>

                  <span className="score">
                    Match Score: {report.matchScore}%
                  </span>

                </div>

              ))}

            </div>
          )}

        </section>
      </div>

    </main>
    
  )
}

export default Landing
