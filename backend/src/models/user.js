const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname : {
        type : String,
        trim : true,
        required : true,
    },
    email : {
        type : String,
        trim : true,
        lowercase : true,
        required : [true,"Email is required"],
        unique : true
    },
    password : {
        type : String,
        minlength : 6,
        required : [true,"Password is required"]
    }
},{timestamps : true});

const User = mongoose.model("user", userSchema);

module.exports = User;