const mongoose = require("mongoose");

async function connectdb() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    }
    catch(err){
        console.error("MongoDB Error:", err);
        // If DB connection fails, surface the error and exit — the app cannot function without the DB.
        throw err;
    }
}

module.exports = connectdb;