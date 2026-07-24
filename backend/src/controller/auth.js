const usermodel = require("../models/user");
const blacklistmodel =  require("../models/blacklist");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

async function registerUser(req,res) {
    try {

        const {fullname,email,password} = req.body;
        if(!fullname || !email || !password){
            return res.status(400).json({msg : "All fields are required"})
        }
        const mail = await usermodel.findOne({email});
        if(mail){
            return res.status(400).json({msg : "Email alreay exists"})
        }
        const hashedpassword = await bcrypt.hash(password,10);
        const user = await usermodel.create({
            fullname,
            email,
            password : hashedpassword,
        })

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
        const token = jwt.sign({
            id : user._id,
        }, jwtSecret, {expiresIn : "1d"})

        res.cookie("token",token,{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            msg : "User created successfully",
            user : {
                _id : user._id,
                fullname : user.fullname,
                email : user.email,
            }
        })

    } catch (error) {
        // Handle Mongo duplicate key error (E11000) with a friendly message
        if (error && error.code === 11000) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
            return res.status(409).json({
                msg: `${duplicateField} already exists`,
                error: error.message,
            });
        }
        res.status(500).json({
            msg : "Internal server error",
            error : error.message,
        })
    }    
}

async function loginUser(req,res) {
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({msg : "All fields are required"})
        }

        const user = await usermodel.findOne({email});
        if(!user){
            return res.status(401).json({msg : "Invalid credentails"})
        }

        const matchedPassword = await bcrypt.compare(password,user.password);
        if(!matchedPassword){
            return res.status(401).json({msg : "Invalid credentails"})
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
        const token = jwt.sign({
            id : user._id,
        }, jwtSecret, {expiresIn : "1d"})

        res.cookie("token",token,{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            msg : "User logged in",
            user : {
                _id : user._id,
                fullname : user.fullname,
                email : user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            msg : "Internal server error",
            error : error.message,
        })
    }
}

async function logoutUser(req,res) {
    try {
        const token = req.cookies?.token;
        if(token){
            await blacklistmodel.create({token});
        }
        res.clearCookie("token",{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
            sameSite : "strict"
        });
        return res.status(200).json({
            msg : "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            msg : "Internal server error",
            error : error.message,
        })
    }
}

async function getmeUser(req,res) {
    try{
        const user = await usermodel.findById(req.user._id);

        res.status(200).json({
            msg : "user details fetched successfully",
            user:{
                id : user._id,
                fullname : user.fullname,
                email : user.email,
            }  
        })
    }
    catch(error){
        res.status(500).json({
            msg : "Internal server error",
            error : error.message,
        })
    }
}

module.exports = {registerUser, loginUser , logoutUser, getmeUser};