const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Company = require('../models/company');
const { setuser } = require("../service/auth");
const bcrypt = require("bcrypt");

async function handleCompanyLogin(req, res) {
    const { user_id, password } = req.body;

    try {
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.json({
                success: false,
                message: "Wrong credentials"
            });
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({
                success: false,
                message: "Wrong credentials"
            });
        }

        const company = await Company.findOne({ c_id: user.c_id });
        if (!company) {
            return res.json({
                success: false,
                message: "Company not found"
            });
        }

        const token = setuser(user, { cname: company.cname });
        res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        return res.json({
            success: true,
            redirectUrl: '/company/home'
        });

    } catch (error) {
        console.error("Company login error:", error);
        return res.json({
            success: false,
            message: "An error occurred during login. Please try again."
        });
    }
}

async function handleCompanySignup(req, res) {
    const { user_id, email, password, confirm_password } = req.body;

    try {
        // Validate password match
        if (password !== confirm_password) {
            return res.json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Check if user_id is already taken
        const existingUser = await User.findOne({ user_id });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User ID taken"
            });
        }

        // Check if email exists in Company model
        const company = await Company.findOne({ email });
        if (!company) {
            return res.json({
                success: false,
                message: "Company email not found. Please contact support."
            });
        }

        // Check if account already exists for this company
        const existingCompanyUser = await User.findOne({ c_id: company.c_id });
        if (existingCompanyUser) {
            return res.json({
                success: false,
                message: "Account already exists for this company"
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user with hashed password
        const newUser = new User({
            user_id,
            c_id: company.c_id,
            password: hashedPassword
        });
        await newUser.save();

        const token = setuser(newUser, { cname: company.cname });
        res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        return res.json({
            success: true,
            redirectUrl: '/company/home'
        });

    } catch (error) {
        console.error("Company signup error:", error);
        return res.json({
            success: false,
            message: "Signup failed: " + error.message
        });
    }
}

// Define routes with full paths
router.post('/company-loginvalidation', handleCompanyLogin);
router.post('/company-signupvalidation', handleCompanySignup);

module.exports = router;