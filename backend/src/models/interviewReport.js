const mongoose = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema({
    question : {
        type : String,
        required : [true,"technical question is required"]
    },
    intention : {
        type : String,
        required : [true,"Intention is required"]
    },
    answer : {
        type : String,
        required : [true,"Answer is required"]
    },
},{_id : false,})

const behavioralQuestionSchema = new mongoose.Schema({
    question : {
        type : String,
        required : [true,"technical question is required"]
    },
    intention : {
        type : String,
        required : [true,"Intention is required"]
    },
    answer : {
        type : String,
        required : [true,"Answer is required"]
    },
},{_id : false,})

const skillgapSchema = new mongoose.Schema({
    skill : {
        type : String,
        required : [true,"Skill is required"]
    },
    severity : {
        type : String,
        enum : ["low","medium","high"],
        required : [true,"severity is required"]
    }
},{_id : false})

const preparationPlanSchema  = new mongoose.Schema({
    day : {
        type : Number,
        required : [true , "Day is required"],
    },
    focus : {
        type : String,
        required : [true, "Focus is required"]
    },
    tasks : [{
        type : String,
        required : [true , "task is required"]
    }]
},{_id : false})


const interviewReportSchema = new mongoose.Schema({
    JobDescription : {
        type : String,
        required : true,
    },
    resume : {
        type : String,
    },
    selfDescription : {
        type : String,
    },
    title : {
        type : String,
        required : true,
    },
    matchScore : {
        type : Number,
        min : 0,
        max : 100,
    },
    technicalQuestions : [ technicalQuestionSchema ],
    behavioralQuestions : [ behavioralQuestionSchema ],
    skillgaps : [ skillgapSchema ],
    preparationPlan : [ preparationPlanSchema ],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
},{timestamps : true})

const Report = mongoose.model("InterviewReport",interviewReportSchema);

module.exports = Report;