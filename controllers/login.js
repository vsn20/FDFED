const User = require("../models/users");
const Employee = require("../models/employees");
const { setuser } = require("../service/auth");
const bcrypt = require("bcrypt");

async function handlelogin(req, res) {
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

    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.json({
        success: false,
        message: "Employee not found"
      });
    }

    // Check if the employee's status is active
    if (employee.status === "resigned" || employee.status === "fired") {
      return res.json({
        success: false,
        message: "Invalid: Employee is resigned or fired"
      });
    }

    const token = setuser(user, employee);
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
    console.error("Login error:", error);
    return res.json({
      success: false,
      message: "An error occurred during login. Please try again."
    });
  }
}

module.exports = { handlelogin };