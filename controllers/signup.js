const User = require("../models/users");
const Employee = require("../models/employees");
const { setuser } = require("../service/auth");
const bcrypt = require("bcrypt");

async function handlesignup(req, res) {
  const { user_id, email, password, confirm_password } = req.body;

  // Trim inputs to avoid whitespace issues
  const trimmedPassword = password ? password.trim() : "";
  const trimmedConfirmPassword = confirm_password ? confirm_password.trim() : "";

  // Check if passwords match
  if (trimmedPassword !== trimmedConfirmPassword) {
    return res.json({
      success: false,
      message: "Passwords do not match"
    });
  }

  try {
    // Check if user_id is taken
    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User ID taken"
      });
    }

    // Check if email exists in Employee
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.json({
        success: false,
        message: "You are not a registered employee"
      });
    }

    // Check if account already exists for this employee
    const existingUserByEmpId = await User.findOne({ emp_id: employee.e_id });
    if (existingUserByEmpId) {
      return res.json({
        success: false,
        message: "Account already created"
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

    // Create new user with hashed password
    const newUser = new User({
      user_id,
      emp_id: employee.e_id,
      password: hashedPassword,
    });
    await newUser.save();

    // Set token
    const token = setuser(newUser, employee);
    res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // Determine redirect URL based on role
    const userType = employee.role.toLowerCase();
    let redirectUrl;

    if (userType === "owner") {
      redirectUrl = "/admin/home";
    } else if (userType === "sales manager") {
      redirectUrl = "/salesmanager/home";
    } else if (userType === "salesman") {
      redirectUrl = "/salesman/home";
    } else {
      return res.json({
        success: false,
        message: "Unauthorized role"
      });
    }

    return res.json({
      success: true,
      redirectUrl: redirectUrl
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.json({
      success: false,
      message: "Signup failed: " + error.message
    });
  }
}

module.exports = { handlesignup };