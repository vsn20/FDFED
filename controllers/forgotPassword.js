const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const User = require("../models/users");
const Employee = require("../models/employees");
const Company = require("../models/company");

// Gmail credentials (replace with your actual email and app password)
const EMAIL_USER = "electroland2005@gmail.com"; // Replace with your Gmail address
const EMAIL_PASS = "edycvqdxyijeycqf"; // Replace with your 16-character app password

// In-memory OTP storage (temporary, for demo purposes)
const otpStorage = new Map();

async function sendOtp(req, res) {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({ success: false, message: "Identifier and type are required." });
    }

    // Debug: Log credentials (remove in production)
    console.log("EMAIL_USER:", EMAIL_USER ? "Set" : "Undefined");
    console.log("EMAIL_PASS:", EMAIL_PASS ? "Set" : "Undefined");

    // Check for missing credentials
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("Missing email credentials in controller.");
      return res.status(500).json({ success: false, message: "Server configuration error: Email credentials missing." });
    }

    let userExists = false;
    let userType = null;
    let userEmail = null;

    if (type === "user_id") {
      const user = await User.findOne({ user_id: identifier }).lean();
      if (user) {
        const employee = await Employee.findOne({ e_id: user.emp_id }).lean();
        const company = await Company.findOne({ c_id: user.c_id }).lean();

        if (employee && ["owner", "Sales Manager", "Salesman"].includes(employee.role)) {
          userType = employee.role.toLowerCase() === "sales manager" ? "sales manager" : employee.role.toLowerCase();
          userEmail = employee.email;
          userExists = true;
        } else if (company) {
          userType = "company";
          userEmail = company.email;
          userExists = true;
        }
      }
    } else if (type === "email") {
      const employee = await Employee.findOne({ email: identifier }).lean();
      const company = await Company.findOne({ email: identifier }).lean();

      if (employee && ["owner", "Sales Manager", "Salesman"].includes(employee.role)) {
        userType = employee.role.toLowerCase() === "sales manager" ? "sales manager" : employee.role.toLowerCase();
        userEmail = employee.email;
        userExists = true;
      } else if (company) {
        userType = "company";
        userEmail = company.email;
        userExists = true;
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid identifier type." });
    }

    if (!userExists) {
      return res.status(404).json({ success: false, message: "User ID or Email ID does not exist for an employee or company." });
    }

    if (!userEmail) {
      return res.status(500).json({ success: false, message: "Email address not found for this user." });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store OTP in-memory
    otpStorage.set(userEmail, { otp, timestamp: Date.now() });
    setTimeout(() => otpStorage.delete(userEmail), 10 * 60 * 1000); // Expire after 10 minutes

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"ElectroWorld" <${EMAIL_USER}>`,
      to: userEmail,
      subject: "Your OTP for Password Reset",
      text: `Your OTP for resetting your ElectroWorld password is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for resetting your ElectroWorld password is:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${userEmail} for ${type} ${identifier} (${userType}): ${otp}`);

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
}

// Backend: Reset Password function
async function resetPassword(req, res) {
    try {
      const { otp, "new-password": newPassword, "confirm-password": confirmPassword, "display-identifier": identifier } = req.body;
  
      // Debug: Log received fields
      console.log("Received reset request:", { otp, newPassword, confirmPassword, identifier });
  
      // Validate required fields
      if (!otp || !newPassword || !confirmPassword || !identifier) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${[
            !otp && "OTP",
            !newPassword && "new password",
            !confirmPassword && "confirm password",
            !identifier && "identifier",
          ].filter(Boolean).join(", ")}.`,
        });
      }
  
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match." });
      }
  
      // Find user email and record
      let userEmail = null;
      let user = null;
  
      const employeeByEmail = await Employee.findOne({ email: identifier }).lean();
      const companyByEmail = await Company.findOne({ email: identifier }).lean();
      const userById = await User.findOne({ user_id: identifier }).lean();
  
      if (employeeByEmail && ["owner", "Sales Manager", "Salesman"].includes(employeeByEmail.role)) {
        userEmail = employeeByEmail.email;
        user = await User.findOne({ emp_id: employeeByEmail.e_id });
      } else if (companyByEmail) {
        userEmail = companyByEmail.email;
        user = await User.findOne({ c_id: companyByEmail.c_id });
      } else if (userById) {
        const employee = await Employee.findOne({ e_id: userById.emp_id }).lean();
        const company = await Company.findOne({ c_id: userById.c_id }).lean();
        if (employee && ["owner", "Sales Manager", "Salesman"].includes(employee.role)) {
          userEmail = employee.email;
          user = userById;
        } else if (company) {
          userEmail = company.email;
          user = userById;
        }
      }
  
      if (!userEmail || !user) {
        return res.status(404).json({ success: false, message: "User not found or not authorized for password reset." });
      }
  
      // Validate OTP
      const storedOtpData = otpStorage.get(userEmail);
      if (!storedOtpData || storedOtpData.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
      }
  
      // Check OTP expiration (10 minutes)
      const currentTime = Date.now();
      const otpAge = (currentTime - storedOtpData.timestamp) / 1000 / 60; // In minutes
      if (otpAge > 10) {
        otpStorage.delete(userEmail);
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
      }
  
      // Update password in plain text
      await User.updateOne({ _id: user._id }, { password: newPassword });
  
      // Clear OTP
      otpStorage.delete(userEmail);
  
      console.log(`Password reset successfully for ${userEmail} (${user.user_id}).`);
  
      // Return success with redirect URL for client handling
      res.json({ 
        success: true, 
        message: "Password reset successfully! Redirecting to home page...",
        redirectUrl: "http://localhost:8000"
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
    }
  }
module.exports = { sendOtp, resetPassword };