const express=require('express');
const {signup,login}=require('../controllers/authController');
const { generate2FACode, verify2FACode } = require("../controllers/authController");
const router=express.Router();

router.post('/signup',signup);
router.post('/login',login);
router.post('/2fa/generate', generate2FACode);
router.post('/2fa/verify', verify2FACode);

module.exports=router;