const pdfParse = require("pdf-parse");
const { generateInterview, generateResumepdf } = require("../service/ai.service");
const InterviewReportModel = require("../models/interviewReport");
const generateDummyInterviewReport = require("../utils/dummyInterviewReport");
const { report } = require("../routes/interview.routes");


async function generateInterviewreport(req, res) {
  try {
    const { JobDescription, selfDescription } = req.body;

    if (!JobDescription) {
      return res.status(400).json({ msg: "Job description is required" });
    }

    if (!req.file && !selfDescription) {
      return res.status(400).json({ msg: "Resume or self description is required" });
    }

   
    let resumecontent = "";

    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumecontent = pdfData.text || "";
      } catch (err) {
        console.log("PDF parse failed:", err.message);
        resumecontent = "";
      }
    }


    let reportData = await generateInterview({
      resume: resumecontent,
      selfDescription,
      JobDescription,
    });

    if (!reportData) {
      console.log("AI failed after all retries — using fallback report");
      reportData = generateDummyInterviewReport();
    }

    const interviewReport = await InterviewReportModel.create({
      user: req.user._id,
      resume: resumecontent,
      selfDescription,
      JobDescription,
      ...reportData,
    });

    res.status(201).json({
      msg: "Interview report generated successfully",
      interviewReport,
    });

  } catch (error) {
    console.error("Interview report error:", error);
    res.status(500).json({ msg: "Internal server error", error: error.message });
  }
}

async function getInterviewreportByIdController(req,res){
    const {InterviewId} = req.params;

    const InterviewReport = await InterviewReportModel.findOne({ _id: InterviewId, user: req.user._id });

    if(!InterviewReport){
        return res.status(404).json({
            msg : "Interview report not found",
        })
    }

    res.status(200).json({
        msg : "Interview report fetched successfully",
        InterviewReport
    })
}

async function getAllinterviewreports(req,res) {
    const interviewReport = await InterviewReportModel.find({user : req.user._id}).sort({createdAt : -1}).limit(4)
    .select("-resume -selfDescription -JobDescription -__v -technicalQuestions -behavioralQuestions -skillgaps -preparationPlan");

    return res.status(200).json({
        msg : "Interview report fetched successfully",
        interviewReport
    })
}

async function generateResumepdfController(req, res) {
  try {

    const { InterviewReportId } = req.params;

    const interviewReport = await InterviewReportModel.findById(InterviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        msg: "Interview report not found",
      });
    }

    const { resume, selfDescription, JobDescription } = interviewReport;

    const pdfBuffer = await generateResumepdf({
      resume,
      selfDescription,
      JobDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    });

    res.send(pdfBuffer);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
}

module.exports = { generateInterviewreport, getInterviewreportByIdController, getAllinterviewreports, generateResumepdfController };