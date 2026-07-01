const express = require("express");
const app = express();
const cookieparser = require("cookie-parser")
const cors = require("cors");
const userroute = require("../src/routes/auth.routes");
const interviewroute = require("./routes/interview.routes")

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieparser());

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    credentials: true,
}));

app.use('/user',userroute);
app.use('/',interviewroute)

module.exports = app;