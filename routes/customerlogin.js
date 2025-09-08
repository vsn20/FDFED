const express = require('express');
const router = express.Router();
const { setuser, getuser } = require("../service/auth");
const Sale = require("../models/sale");

router.post('/', async (req, res) => {
    const { mobileNumber, otp } = req.body;

    // Trim inputs to avoid whitespace issues
    const trimmedMobileNumber = mobileNumber ? mobileNumber.trim() : "";
    const trimmedOtp = otp ? otp.trim() : "";

    // Validate mobile number
    if (!trimmedMobileNumber.match(/^[0-9]{10}$/)) {
        console.log("Invalid mobile number");
        return res.render("customerlogin", {
            error: "Please enter a valid 10-digit mobile number",
            activePage: 'customer',
        });
    }

    // Check if the customer has a sale in any branch
    try {
        const saleExists = await Sale.findOne({ phone_number: trimmedMobileNumber }).lean();
        if (!saleExists) {
            console.log("No sale found for this customer");
            return res.render("customerlogin", {
                error: "You need to have a purchase in any branch to log in",
                activePage: 'customer',
            });
        }
    } catch (error) {
        console.error("Error checking sales:", error);
        return res.render("customerlogin", {
            error: "Internal Server Error",
            activePage: 'customer',
        });
    }

    // Create a customer object
    const customer = {
        user_id: trimmedMobileNumber,
        type: "customer"
    };

    // Generate uid using setuser
    const uid = setuser(customer);

    // Set uid cookie
    res.cookie('uid', uid, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // Placeholder OTP validation (replace with actual logic)
    if (!trimmedOtp || !trimmedOtp.match(/^[0-9]{6}$/)) {
        console.log("Invalid OTP");
        return res.render("customerlogin", {
            error: "Invalid OTP",
            activePage: 'customer',
        });
    }

    return res.redirect('/customer/home');
});

module.exports = router;