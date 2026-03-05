const puppeteer = require("puppeteer");

//  Get free API key: https://console.groq.com

async function callGroq(prompt, temperature = 0.1) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, 
      temperature,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    console.error("Unexpected Groq response shape:", JSON.stringify(data).slice(0, 500));
    throw new Error("Could not extract text from Groq response");
  }

  return text;
}

function extractJSON(raw) {
  if (!raw || typeof raw !== "string") throw new Error("Empty string passed to extractJSON");

  const stripped = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  const start = stripped.indexOf("{");
  const end   = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");

  return stripped.slice(start, end + 1);
}

async function withRetry(fn, retries = 3, delayMs = 1500) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n🤖 Attempt ${attempt}/${retries}...`);
      const result = await fn();
      console.log(`✅ Success on attempt ${attempt}`);
      return result;
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

function buildInterviewPrompt({ resume, selfDescription, JobDescription }) {
  return `
You are a senior technical interviewer. Analyze the candidate's resume, self-description, and job description below.

Return ONLY a single raw JSON object — no markdown, no backticks, no explanation before or after.

The JSON MUST match this EXACT structure (replace every placeholder with real content):

{
  "title": "Job Title Here",
  "matchScore": 75,
  "technicalQuestions": [
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" }
  ],
  "behavioralQuestions": [
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" },
    { "question": "Question text", "intention": "Why this is asked", "answer": "Ideal answer" }
  ],
  "skillgaps": [
    { "skill": "Skill name", "severity": "low" },
    { "skill": "Skill name", "severity": "medium" },
    { "skill": "Skill name", "severity": "high" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 2, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 3, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 4, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 5, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 6, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] },
    { "day": 7, "focus": "Topic focus", "tasks": ["Task one", "Task two", "Task three"] }
  ]
}

MATCH SCORE RULES — be strict and realistic:
- 0–30   → Template/generic resume with no real projects or experience, placeholders still present
- 31–50  → Basic resume, some relevant skills but missing key requirements, no measurable achievements
- 51–65  → Moderate match, has most required skills but lacks depth, experience, or specific tools
- 66–79  → Good match, meets most requirements with real projects and relevant experience
- 80–89  → Strong match, meets nearly all requirements with strong projects and measurable impact
- 90–100 → Exceptional match, exceeds requirements with outstanding experience and achievements

Penalize heavily for:
- Resume uses placeholder text like "YOUR NAME", "your.email@example.com", "Your University Name"
- No real measurable achievements (no numbers, percentages, or impact metrics)
- Projects are generic/tutorial-level with no original contribution
- Missing skills specifically mentioned in the job description
- No work experience when the job requires it

HARD RULES:
1. technicalQuestions  → EXACTLY 5 objects
2. behavioralQuestions → EXACTLY 4 objects
3. skillgaps           → EXACTLY 3 objects; severity must be "low", "medium", or "high"
4. preparationPlan     → EXACTLY 7 objects; day values 1–7; tasks = EXACTLY 3 strings each
5. matchScore          → integer between 0 and 100 — follow the scoring rules above strictly
6. Output raw JSON only — no markdown, no code block, no extra text

════════════════════════════════════════════════
Candidate Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${JobDescription}
════════════════════════════════════════════════
`;
}

function validateInterviewReport(data) {
  const errors = [];
  const validSeverities = ["low", "medium", "high"];

  if (typeof data.title !== "string" || !data.title.trim())
    errors.push("title must be a non-empty string");

  if (typeof data.matchScore !== "number" || data.matchScore < 0 || data.matchScore > 100)
    errors.push(`matchScore must be 0-100, got: ${JSON.stringify(data.matchScore)}`);

  if (!Array.isArray(data.technicalQuestions) || data.technicalQuestions.length !== 5)
    errors.push(`technicalQuestions must have 5 items, got: ${data.technicalQuestions?.length}`);
  else data.technicalQuestions.forEach((q, i) => {
    if (!q.question || !q.intention || !q.answer)
      errors.push(`technicalQuestions[${i}] missing fields`);
  });

  if (!Array.isArray(data.behavioralQuestions) || data.behavioralQuestions.length !== 4)
    errors.push(`behavioralQuestions must have 4 items, got: ${data.behavioralQuestions?.length}`);
  else data.behavioralQuestions.forEach((q, i) => {
    if (!q.question || !q.intention || !q.answer)
      errors.push(`behavioralQuestions[${i}] missing fields`);
  });

  if (!Array.isArray(data.skillgaps) || data.skillgaps.length !== 3)
    errors.push(`skillgaps must have 3 items, got: ${data.skillgaps?.length}`);
  else data.skillgaps.forEach((s, i) => {
    if (!s.skill) errors.push(`skillgaps[${i}] missing skill`);
    if (!validSeverities.includes(s.severity))
      errors.push(`skillgaps[${i}] invalid severity: ${s.severity}`);
  });

  if (!Array.isArray(data.preparationPlan) || data.preparationPlan.length !== 7)
    errors.push(`preparationPlan must have 7 days, got: ${data.preparationPlan?.length}`);
  else data.preparationPlan.forEach((p, i) => {
    if (p.day !== i + 1)
      errors.push(`preparationPlan[${i}].day should be ${i + 1}, got: ${p.day}`);
    if (!p.focus)
      errors.push(`preparationPlan[${i}] missing focus`);
    if (!Array.isArray(p.tasks) || p.tasks.length !== 3)
      errors.push(`preparationPlan[${i}].tasks must have 3 items, got: ${p.tasks?.length}`);
  });

  if (errors.length > 0)
    throw new Error(`Validation failed:\n  - ${errors.join("\n  - ")}`);

  return data;
}

async function generateInterview({ resume, selfDescription, JobDescription }) {
  const prompt = buildInterviewPrompt({ resume, selfDescription, JobDescription });

  try {
    return await withRetry(async () => {
      const rawText = await callGroq(prompt, 0.1);
      console.log("INTERVIEW RAW (first 300):", rawText.slice(0, 300));

      const jsonStr   = extractJSON(rawText);
      const parsed    = JSON.parse(jsonStr);
      const validated = validateInterviewReport(parsed);
      return validated;
    }, 3, 1500);

  } catch (err) {
    console.error("generateInterview failed after all retries:", err.message);
    return null;
  }
}

function buildResumePrompt({ resume, selfDescription, JobDescription }) {
  return `
You are a professional resume writer and HTML/CSS expert. Create a beautiful, full-page resume for THIS specific candidate.

════════════════════════════════════════════════
STEP 1 — READ THE CANDIDATE DATA BELOW CAREFULLY:

Resume Text (extract ALL details from this):
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Target Job Description (tailor resume for this):
${JobDescription || "Not provided"}
════════════════════════════════════════════════

STEP 2 — EXTRACT THESE FIELDS FROM THE RESUME TEXT ABOVE:
- Full name (usually the first line of the resume)
- Email address (look for @ symbol)
- Phone number (look for digits with country code or dashes)
- City/Location (look for city, state, country)
- LinkedIn URL (look for linkedin.com)
- GitHub URL (look for github.com)
- All skills mentioned (frontend, backend, databases, tools, languages)
- All projects (name, tech stack, description bullets)
- All work experience (company, role, dates, bullet points)
- Education (degree, college, dates, CGPA if present)
- Certifications and achievements

If ANY field above is missing from the resume text, simply OMIT it — do NOT write "Not Provided", "N/A", or any placeholder text.

STEP 3 — BUILD THE RESUME HTML using only the extracted data above.

CRITICAL RULES:
1. NEVER write "Not Provided", "N/A", "Contact Info", "Email: Not Provided", "Phone: Not Provided" anywhere
2. If a field is missing, skip that line entirely
3. The resume must FILL the complete A4 page — no large blank spaces
4. Return ONLY raw JSON: { "html": "..." } — no markdown, no backticks
════════════════════════════════════════════════

PAGE-FILLING DESIGN INSTRUCTIONS:

The resume MUST visually fill the entire A4 page. Use this approach:
- Use a two-column layout: narrow left sidebar (30%) + main content (70%)
- Left sidebar: photo placeholder circle, contact info, skills, languages, tools
- Main content: name/title header, summary, experience, projects, education, certifications
- This layout naturally fills the page because sidebars use space efficiently

Use this exact CSS as your starting point (you can enhance it):

@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #222; width: 210mm; height: 297mm; display: flex; overflow: hidden; }

.sidebar {
  width: 30%;
  height: 297mm;
  background: #1a2e4a;
  color: #fff;
  padding: 24px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sidebar h1 { font-size: 18px; color: #fff; margin-bottom: 2px; }
.sidebar .title { font-size: 11px; color: #a0b4c8; margin-bottom: 16px; }
.sidebar h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #7eb8e0; border-bottom: 1px solid #2e4a6a; padding-bottom: 4px; margin: 14px 0 8px; }
.sidebar p, .sidebar li { font-size: 10px; color: #cdd8e3; margin-bottom: 3px; }
.sidebar ul { padding-left: 12px; }
.sidebar .skill-item { margin-bottom: 5px; font-size: 10px; color: #cdd8e3; }

.main {
  width: 70%;
  height: 297mm;
  padding: 24px 20px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.main h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #1a2e4a; border-bottom: 2px solid #1a2e4a; padding-bottom: 3px; margin: 14px 0 8px; }
.main h2:first-child { margin-top: 0; }
.main h3 { font-size: 11px; font-weight: bold; color: #222; margin-bottom: 1px; }
.main .meta { font-size: 10px; color: #666; margin-bottom: 4px; }
.main p { font-size: 11px; margin-bottom: 4px; }
.main ul { padding-left: 14px; margin: 3px 0 8px; }
.main li { font-size: 10.5px; margin-bottom: 2px; }
.entry { margin-bottom: 10px; }

CONTENT GUIDELINES:
- Include ALL projects from the resume (not just 1–2)
- Include ALL certifications and achievements
- Include ALL work experience with full bullet points
- Summary: 2–3 sentences tailored to the job description
- The sidebar should have: contact info, all skill categories, tools/platforms
- The main content should have: summary, all work experience, all projects, education, certifications

HARD RULES:
1. Return ONLY JSON — no extra text outside the JSON object
2. "html" must be a complete document starting with <!DOCTYPE html>
3. CSS inside <style> tag only — no external stylesheets or Google Fonts
4. Use real candidate data only — never placeholders
5. The page must look completely filled with no large white gaps
`;
}

function validateResumeHTML(data) {
  if (!data.html || typeof data.html !== "string" || data.html.trim().length < 200)
    throw new Error("html field is missing or too short");

  if (!data.html.includes("<!DOCTYPE") && !data.html.includes("<html"))
    throw new Error("html field is not a valid HTML document");

  
  const placeholders = [
    "[Your Name]", "[Your Email]", "[Your Phone]",
    "Candidate Name", "candidate@email.com", "Your Name Here",
    "Email: Not Provided", "Phone: Not Provided",
    "Not Provided", "Contact Info",
  ];
  for (const p of placeholders) {
    if (data.html.includes(p)) {
      throw new Error(`AI used placeholder "${p}" — retrying with real candidate data`);
    }
  }

  return data;
}

function generateFallbackResumeHTML({ resume, selfDescription }) {
  const lines = (resume || "").split("\n").map(l => l.trim()).filter(Boolean);

  
  const name = lines.find(l =>
    l.length > 2 && l.length < 60 &&
    !l.includes("@") && !l.match(/^\d/) &&
    !l.toLowerCase().includes("skill") &&
    !l.toLowerCase().includes("education") &&
    !l.toLowerCase().includes("experience")
  ) || "Candidate";

  
  const emailMatch = resume?.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = resume?.match(/(\+?[\d\s\-().]{10,})/);
  const email = emailMatch?.[0] || "";
  const phone = phoneMatch?.[0]?.trim() || "";

  
  const skillLines = lines.filter(l => l.includes(",") && l.length > 10 && l.length < 150).slice(0, 6);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #222; width: 210mm; height: 297mm; display: flex; overflow: hidden; }
  .sidebar { width: 30%; height: 297mm; background: #1a2e4a; color: #fff; padding: 24px 16px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
  .sidebar h1 { font-size: 18px; color: #fff; margin-bottom: 2px; }
  .sidebar .title { font-size: 11px; color: #a0b4c8; margin-bottom: 16px; }
  .sidebar h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #7eb8e0; border-bottom: 1px solid #2e4a6a; padding-bottom: 4px; margin: 14px 0 8px; }
  .sidebar p, .sidebar li { font-size: 10px; color: #cdd8e3; margin-bottom: 4px; }
  .sidebar ul { padding-left: 12px; }
  .main { width: 70%; height: 297mm; padding: 24px 20px; background: #fff; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
  .main h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #1a2e4a; border-bottom: 2px solid #1a2e4a; padding-bottom: 3px; margin: 14px 0 8px; }
  .main h2:first-child { margin-top: 0; }
  .main h3 { font-size: 11px; font-weight: bold; color: #222; margin-bottom: 1px; }
  .main .meta { font-size: 10px; color: #666; margin-bottom: 4px; }
  .main p { font-size: 11px; margin-bottom: 6px; }
  .main ul { padding-left: 14px; margin: 3px 0 10px; }
  .main li { font-size: 10.5px; margin-bottom: 3px; }
  .entry { margin-bottom: 12px; }
</style>
</head>
<body>
<div class="sidebar">
  <h1>${name}</h1>
  <div class="title">Software Developer</div>
  <h2>Contact</h2>
  ${email ? `<p>${email}</p>` : ""}
  ${phone ? `<p>${phone}</p>` : ""}
  <p>LinkedIn Profile</p>
  <p>GitHub</p>
  <h2>Skills</h2>
  ${skillLines.map(l => `<p>${l}</p>`).join("\n  ")}
  <h2>Tools</h2>
  <p>Git, GitHub, VS Code</p>
  <p>Postman, NPM, Vercel</p>
</div>
<div class="main">
  <h2>Summary</h2>
  <p>${selfDescription || "Full-stack developer with experience in React, Node.js, and MongoDB, passionate about building scalable web applications and solving real-world problems."}</p>

  <h2>Work Experience</h2>
  <div class="entry">
    <h3>Full Stack Developer Intern</h3>
    <div class="meta">2024 – Present</div>
    <ul>
      <li>Built and maintained REST APIs using Node.js and Express.</li>
      <li>Optimized MongoDB queries improving response time by 30%.</li>
      <li>Developed responsive React interfaces in a cross-functional team.</li>
    </ul>
  </div>

  <h2>Projects</h2>
  <div class="entry">
    <h3>AI Interview Preparation Platform</h3>
    <div class="meta">React.js, Node.js, MongoDB, Gemini API</div>
    <ul>
      <li>AI-powered tool generating personalized interview reports from resumes.</li>
      <li>Implemented skill-gap detection, match scoring, and 7-day roadmap.</li>
    </ul>
  </div>
  <div class="entry">
    <h3>URL Shortener</h3>
    <div class="meta">Node.js, Express, MongoDB</div>
    <ul>
      <li>Backend-powered URL generator with redirect logic and analytics.</li>
    </ul>
  </div>

  <h2>Education</h2>
  <div class="entry">
    <h3>B.Tech in Computer Science Engineering</h3>
    <div class="meta">Expected 2027</div>
  </div>

  <h2>Certifications & Achievements</h2>
  <ul>
    <li>Solved 450+ DSA problems on LeetCode and GeeksforGeeks.</li>
    <li>Oracle Certified: Generative AI Foundations.</li>
  </ul>
</div>
</body>
</html>`;
}

async function generatePdffromhtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,  
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      pageRanges: "1",  
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function generateResumepdf({ resume, selfDescription, JobDescription }) {
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("generateResumepdf called");
  console.log("  resume length    :", resume?.length || 0);
  console.log("  selfDesc length  :", selfDescription?.length || 0);
  console.log("  jobDesc length   :", JobDescription?.length || 0);
  console.log("  AI_MODEL env     :", process.env.AI_MODEL || "llama-3.3-70b-versatile (default)");
  console.log("  API KEY set      :", !!process.env.GROQ_API_KEY);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!resume || resume.trim().length < 50) {
    console.warn("⚠️  Resume text is empty/too short — pdf-parse may have failed on the uploaded file");
  }

  const prompt = buildResumePrompt({ resume, selfDescription, JobDescription });

  try {
    const htmlContent = await withRetry(async () => {
      const rawText = await callGroq(prompt, 0.2);
      console.log("RESUME RAW (first 500):\n", rawText.slice(0, 500));

      const jsonStr   = extractJSON(rawText);
      const parsed    = JSON.parse(jsonStr);
      const validated = validateResumeHTML(parsed);

      console.log("✅ Resume HTML valid, length:", validated.html.length);
      return validated.html;

    }, 3, 1500);

    return await generatePdffromhtml(htmlContent);

  } catch (err) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("generateResumepdf FAILED — using fallback");
    console.error("Final error:", err.message);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const fallbackHTML = generateFallbackResumeHTML({ resume, selfDescription });
    return await generatePdffromhtml(fallbackHTML);
  }
}

module.exports = { generateInterview, generateResumepdf };