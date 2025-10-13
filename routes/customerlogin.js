const express = require('express');
const router = express.Router();
const { setuser } = require("../service/auth");
const Sale = require("../models/sale");

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route 1: Send OTP
router.post('/customer-send-otp', async (req, res) => {
    console.log('=== SEND OTP ROUTE HIT ===');
    console.log('Request body:', req.body);
    
    const { mobileNumber } = req.body;
    const trimmedMobileNumber = mobileNumber ? mobileNumber.trim() : "";

    // Validate mobile number
    if (!trimmedMobileNumber.match(/^[0-9]{10}$/)) {
        console.log("Invalid mobile number");
        return res.json({
            success: false,
            message: "Please enter a valid 10-digit mobile number"
        });
    }

    try {
        // Check if the customer has a sale in any branch
        const saleExists = await Sale.findOne({ phone_number: trimmedMobileNumber }).lean();
        console.log('Sale exists:', !!saleExists);
        
        if (!saleExists) {
            console.log("No sale found for this customer");
            return res.json({
                success: false,
                message: "You need to have a purchase in any branch to log in"
            });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with 5-minute expiry
        otpStore.set(trimmedMobileNumber, {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // TODO: Send OTP via SMS service
        // await sendSMS(trimmedMobileNumber, `Your OTP is: ${otp}`);
        
        // FOR DEVELOPMENT ONLY - Log OTP to console
        console.log(`✅ OTP for ${trimmedMobileNumber}: ${otp}`);

        return res.json({
            success: true,
            message: "OTP sent successfully to your mobile number",
            // REMOVE THIS IN PRODUCTION - Only for testing
            otp: otp 
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.json({
            success: false,
            message: "Failed to send OTP. Please try again"
        });
    }
});

// Route 2: Verify OTP and Login
router.post('/customer-login', async (req, res) => {
    console.log('=== LOGIN ROUTE HIT ===');
    console.log('Request body:', req.body);
    
    const { mobileNumber, otp } = req.body;
    const trimmedMobileNumber = mobileNumber ? mobileNumber.trim() : "";
    const trimmedOtp = otp ? otp.trim() : "";

    // Validate mobile number
    if (!trimmedMobileNumber.match(/^[0-9]{10}$/)) {
        return res.json({
            success: false,
            message: "Please enter a valid 10-digit mobile number"
        });
    }

    // Validate OTP format
    if (!trimmedOtp) {
        return res.json({
            success: false,
            message: "Please enter the OTP"
        });
    }
    
    if (trimmedOtp.length !== 6) {
        return res.json({
            success: false,
            message: "Please enter the complete 6-digit OTP"
        });
    }

    try {
        // Check if OTP exists for this mobile number
        const storedOtpData = otpStore.get(trimmedMobileNumber);
        console.log('Stored OTP data:', storedOtpData);
        console.log('Provided OTP:', trimmedOtp);
        
        if (!storedOtpData) {
            return res.json({
                success: false,
                message: "OTP expired or not found. Please request a new OTP"
            });
        }

        // Check if OTP has expired
        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(trimmedMobileNumber);
            return res.json({
                success: false,
                message: "OTP has expired. Please request a new OTP"
            });
        }

        // Verify OTP
        if (storedOtpData.otp !== trimmedOtp) {
            return res.json({
                success: false,
                message: "Incorrect OTP. Please try again"
            });
        }

        // OTP is valid - Delete it from store
        otpStore.delete(trimmedMobileNumber);
        console.log('✅ OTP verified successfully');

        // Verify customer has purchase (double-check)
        const saleExists = await Sale.findOne({ phone_number: trimmedMobileNumber }).lean();
        if (!saleExists) {
            return res.json({
                success: false,
                message: "You need to have a purchase in any branch to log in"
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

        console.log('✅ Customer logged in successfully');
        return res.json({
            success: true,
            redirectUrl: '/customer/home'
        });

    } catch (error) {
        console.error("Error during customer login:", error);
        return res.json({
            success: false,
            message: "Internal Server Error. Please try again"
        });
    }
});

// Optional: Clean up expired OTPs periodically
setInterval(() => {
    const now = Date.now();
    for (const [mobile, data] of otpStore.entries()) {
        if (now > data.expiresAt) {
            otpStore.delete(mobile);
            console.log(`Cleaned up expired OTP for ${mobile}`);
        }
    }
}, 60000); // Run every minute

console.log('✅ Customer auth routes loaded');

module.exports = router;