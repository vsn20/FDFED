const User = require("../models/users");
const Employee = require("../models/employees");
const { setuser } = require("../service/auth");

async function handlesignup(req, res) {
  const { user_id, email, password, confirm_password } = req.body;

  // Trim inputs to avoid whitespace issues
  const trimmedPassword = password ? password.trim() : "";
  const trimmedConfirmPassword = confirm_password ? confirm_password.trim() : "";

  //console.log("Received user_id:", user_id);
  //console.log("Received email:", email);
  //console.log("Received password:", trimmedPassword);
  //console.log("Received confirm_password:", trimmedConfirmPassword);
  //console.log("Passwords match?", trimmedPassword === trimmedConfirmPassword);

  // Check if passwords match
  if (trimmedPassword !== trimmedConfirmPassword) {
    return res.render("employeelogin", {
      activePage: "employee",
      signupError: "Passwords do not match",
      loginError: null,
    });
  }

  try {
    // Check if user_id is taken
    const existingUser = await User.findOne({ user_id });
    if (existingUser) {
      return res.render("employeelogin", {
        activePage: "employee",
        signupError: "User ID taken",
        loginError: null,
      });
    }

    // Check if email exists in Employee
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.render("employeelogin", {
        activePage: "employee",
        signupError: "You are not a registered employee",
        loginError: null,
      });
    }

    // Check if account already exists for this employee
    const existingUserByEmpId = await User.findOne({ emp_id: employee.e_id });
    if (existingUserByEmpId) {
      return res.render("employeelogin", {
        activePage: "employee",
        signupError: "Account already created",
        loginError: null,
      });
    }

    // Create new user with only the password
    const newUser = new User({
      user_id,
      emp_id: employee.e_id,
      password: trimmedPassword,
    });
    await newUser.save();

    // Set token and redirect
    const token = setuser(newUser, employee);
    res.cookie("uid", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    const userType = employee.role.toLowerCase();
    if (userType === "owner") {
      return res.redirect("admin/home");
    } else if (userType === "sales manager") {
      return res.redirect("salesmanager/home");
    } else if (userType === "salesman") {
      return res.redirect("salesman/home");
    } else {
      return res.status(403).send("Unauthorized role");
    }
  } catch (error) {
    return res.render("employeelogin", {
      activePage: "employee",
      signupError: "Signup failed: " + error.message,
      loginError: null,
    });
  }
}

module.exports = { handlesignup };