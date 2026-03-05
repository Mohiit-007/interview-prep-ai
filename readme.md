# InterviewAI – AI Powered Interview Preparation & Resume Generator

InterviewAI is an **AI-powered full stack web application** that analyzes a candidate's **resume, self description, and job description** to generate a **personalized interview preparation report and a professional resume PDF**.

The system uses **LLM APIs (Groq / LLaMA models)** to evaluate candidate-job matching, detect skill gaps, generate interview questions, and create a **7-day interview preparation plan**.

The project includes a **React frontend** for user interaction and a **Node.js backend API** for AI processing and PDF generation.

---

# 🚀 Features

## 👤 User Features

* User Signup & Login
* Secure Authentication using JWT
* Upload Resume for Analysis
* Generate AI Interview Preparation Report
* View Match Score with Job Description
* Generate Professional Resume PDF
* Logout

---

## 🤖 AI Interview Features

* AI Match Score (0–100)
* 5 Technical Interview Questions
* 4 Behavioral Interview Questions
* Skill Gap Analysis with severity levels
* 7-Day Interview Preparation Plan

---

## 📄 Resume Generation Features

* AI Generated Resume Layout
* Professional A4 Resume Design
* Two Column Resume Structure
* Automatic Data Extraction from Resume
* HTML Resume Generation
* PDF Resume Generation using Puppeteer

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Axios
* SCSS

## Backend

* Node.js
* Express.js
* Puppeteer

## Database

* MongoDB
* Mongoose

## AI Integration

* Groq API
* LLaMA 3.3 70B Versatile

## Authentication & Security

* JWT Authentication
* Authorization Middleware
* Secure API Routes

---

# ⚙️ Installation

## Clone the Repository

```
git clone https://github.com/yourusername/interview-ai.git
cd interview-ai
```

---

## Install Dependencies

Backend:

```
cd backend
npm install
```

Frontend:

```
cd frontend
npm install
```

---

## Setup Environment Variables

Create a `.env` file inside the backend folder.

```
GROQ_API_KEY=your_groq_api_key
AI_MODEL=llama-3.3-70b-versatile
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Get Groq API key from:

https://console.groq.com

---

## Run Backend Server

```
cd backend
npm run dev
```

Backend runs on:

```
http://localhost:8000
```

---

## Run Frontend

```
cd frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5173
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

# 🔐 Authentication & Authorization

The system uses **JWT based authentication**.

Protected routes include:

* Generate Interview Report
* Generate Resume PDF
* Access User Profile

Authorization middleware ensures that **only authenticated users can access protected APIs**.

---

# 🔁 Reliability Features

* Retry System for AI API failures
* Strict JSON Validation
* Automatic JSON Extraction from AI response
* Fallback Resume Generator if AI fails

---

# ⭐ Highlights

* Full Stack AI Application
* AI Powered Interview Preparation
* Automated Resume Generation
* Secure Authentication System
* PDF Resume Export
* Robust Error Handling

---

# 🔮 Future Improvements

* AI Mock Interview Simulator
* Speech-based Interview Practice
* Resume ATS Score Analysis
* Job Recommendation System
* Dashboard for tracking interview preparation

---

# 👨‍💻 Author

**Mohit Sahu**

Computer Science Engineering Student
MERN Stack Developer
AI & Full Stack Enthusiast 🚀
