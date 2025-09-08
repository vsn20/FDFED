const express = require("express");
const router = express.Router();
const { handlesignup } = require("../controllers/signup");

router.post("/", handlesignup);

module.exports = router;