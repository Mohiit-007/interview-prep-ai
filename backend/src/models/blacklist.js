const mongoose = require("mongoose");

const blacklistschema = new mongoose.Schema({
    token : {
        type : String,
        required : [true,"token is required to be added in blacklist"]
    }
},{timestamps : true})

const blacklistmodel = mongoose.model("blacklistotken",blacklistschema);

module.exports = blacklistmodel;