const jwt = require("jsonwebtoken");
const usermodel = require("../models/user")
const blacklistmodel = require("../models/blacklist")

async function authusermiddleware(req,res,next) {
    const token = req.cookies?.token;

    if(!token){
        return res.status(401).json({msg : "token is not found"});
    }
    const isTokenBlacklisted = await blacklistmodel.findOne({token});

    if(isTokenBlacklisted){
        return res.status(401).json({msg : "Token is Invalid"});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await usermodel.findById(decoded.id);

        if(!user){
            return res.status(401).json({msg : "User not exist"});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            msg : "Invalid token"
        })
    }
}

module.exports = {authusermiddleware}