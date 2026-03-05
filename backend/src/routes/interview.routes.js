const express = require("express");
const router = express.Router();
const {authusermiddleware} = require("../middleware/auth.middleware")
const {
    generateInterviewreport,
    getInterviewreportByIdController,
    getAllinterviewreports,
    generateResumepdfController,
} = require("../controller/interview");

const upload = require("../middleware/file.middleware")

router.post('/',authusermiddleware,upload.single('resume'),generateInterviewreport)

router.get('/report/:InterviewId',authusermiddleware,getInterviewreportByIdController)

router.get('/',authusermiddleware,getAllinterviewreports)

router.post('/resume/pdf/:InterviewReportId',authusermiddleware,generateResumepdfController);

module.exports = router;