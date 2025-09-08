const express = require("express");

const router = express.Router();

const {handlelogin}= require("../controllers/login");

router.post("/",handlelogin);

module.exports=router;
