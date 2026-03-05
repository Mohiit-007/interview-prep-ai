# InterviewAI – AI Powered Interview Preparation & Resume Generator

InterviewAI is an **AI-powered backend system** that analyzes a candidate's **resume, self description, and job description** to generate a **personalized interview preparation report and a professional resume PDF**.

The system uses **LLM APIs (Groq / LLaMA models)** to evaluate candidate-job matching, detect skill gaps, generate interview questions, and create a **7-day interview preparation plan**.

---

# 🚀 Features

## 👤 Candidate Features

* Generate Interview Preparation Report
* Analyze Resume vs Job Description
* Get Personalized Interview Questions
* Skill Gap Detection
* 7-Day Interview Preparation Plan
* Generate Professional Resume PDF

---

## 🤖 AI Interview Features

* AI Match Score (0–100)
* 5 Technical Interview Questions
* 4 Behavioral Interview Questions
* Skill Gap Analysis with severity
* Structured Interview Preparation Plan

---

## 📄 Resume Generation Features

* AI Generated Resume Layout
* Professional A4 Resume Design
* Two Column Resume Structure
* Automatic Data Extraction from Resume
* PDF Resume Generation using Puppeteer

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express.js
* Puppeteer

## AI

* Groq API
* LLaMA 3.3 70B Versatile

## Other Tools

* JSON Validation
* Retry Mechanism
* HTML Resume Generation

---

# 📂 Project Structure

```
InterviewAI
│
├── backend
│     ├── interview.js
│     ├── controllers
│     ├── routes
│     └── server.js
│
├── utils
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```
git clone https://github.com/yourusername/interview-ai.git
cd interview-ai
```

---

## 2️⃣ Install Dependencies

```
npm install
```

---

## 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

```
GROQ_API_KEY=your_groq_api_key
AI_MODEL=llama-3.3-70b-versatile
```

Get your API key from:

https://console.groq.com

---

## 4️⃣ Run the Server

```
npm run dev
```

or

```
node server.js
```

Server runs on:

```
http://localhost:8000
```

---

# 📡 API Features

## Generate Interview Report

The AI analyzes the candidate profile and returns:

* Job Match Score
* Technical Interview Questions
* Behavioral Interview Questions
* Skill Gap Analysis
* 7-Day Preparation Plan

Example Request:

```
POST /api/interview
```

```
{
  "resume": "resume text here",
  "selfDescription": "candidate description",
  "JobDescription": "job description here"
}
```

---

## Generate Resume PDF

The system converts AI generated **HTML Resume → Professional PDF** using Puppeteer.

Example Request:

```
POST /api/resume
```

```
{
  "resume": "resume text",
  "selfDescription": "about the candidate",
  "JobDescription": "target job description"
}
```

Response: **PDF file**

---

# 🔁 Reliability Features

* Retry System for AI API failures
* Strict JSON Validation
* Automatic JSON Extraction from AI response
* Fallback Resume Generator if AI fails

---

# ⭐ Highlights

* AI Powered Interview Preparation
* Automated Resume Generation
* Structured Interview Reports
* PDF Resume Export
* Robust Error Handling

---

# 🔮 Future Improvements

* AI Mock Interview Simulator
* Speech-based Interview Practice
* Resume ATS Score Analysis
* Job Recommendation System
* Frontend Dashboard

---

# 👨‍💻 Author

**Mohit Sahu**

Computer Science Engineering Student
MERN Stack Developer
AI & Full Stack Enthusiast 🚀
