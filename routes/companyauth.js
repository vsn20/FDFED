const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Company = require('../models/company');
const { setuser } = require("../service/auth");

async function handleCompanyLogin(req, res) {
    const { user_id, password } = req.body;

    const user = await User.findOne({ user_id, password });
    if (!user) {
        return res.render("companylogin", {
            loginError: "Wrong credentials",
            signupError: null,
            activePage: 'company'
        });
    }

    const company = await Company.findOne({ c_id: user.c_id });
    if (!company) {
        return res.render("companylogin", {
            loginError: "Company not found",
            signupError: null,
            activePage: 'company'
        });
    }

    const token = setuser(user, { cname: company.cname });
    res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    return res.redirect('/company/home');
}

async function handleCompanySignup(req, res) {
    const { user_id, email, password, confirm_password } = req.body;

    // Check if user_id is already taken
    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
        return res.render("companylogin", {
            loginError: null,
            signupError: "User ID taken",
            activePage: 'company'
        });
    }

    // Validate password match
    if (password !== confirm_password) {
        return res.render("companylogin", {
            loginError: null,
            signupError: "Passwords do not match",
            activePage: 'company'
        });
    }

    // Check if email exists in Company model
    const company = await Company.findOne({ email });
    if (!company) {
        return res.render("companylogin", {
            loginError: null,
            signupError: "Company email not found",
            activePage: 'company'
        });
    }

    // Create new user with c_id from Company
    const newUser = new User({
        user_id,
        c_id: company.c_id,
        password
    });
    await newUser.save();

    const token = setuser(newUser, { cname: company.cname });
    res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    return res.redirect('/company/home');
}

// Define routes with full paths
router.post('/company-loginvalidation', handleCompanyLogin);
router.post('/company-signupvalidation', handleCompanySignup);

module.exports = router;