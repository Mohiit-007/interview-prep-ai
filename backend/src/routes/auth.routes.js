const express = require("express");
const router = express.Router();

const {registerUser , loginUser , logoutUser, getmeUser} = require("../controller/auth");
const {authusermiddleware} = require("../middleware/auth.middleware")

router.post('/register',registerUser);

router.post('/login',loginUser);

router.post('/logout',logoutUser);

router.get("/me",authusermiddleware,getmeUser)

module.exports = router;