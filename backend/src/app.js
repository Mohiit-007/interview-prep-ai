const express = require("express");
const app = express();
const cookieparser = require("cookie-parser")
const cors = require("cors");
const userroute = require("../src/routes/auth.routes");
const interviewroute = require("./routes/interview.routes")

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieparser());

app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true,
}))

app.use('/user',userroute);
app.use('/',interviewroute)

module.exports = app;