require("dotenv").config();
const app = require("./src/app");
const connectdb = require("./src/db");
connectdb();

app.listen(8000,()=>console.log("server started"))