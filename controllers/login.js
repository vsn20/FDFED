const User = require("../models/users");
const Employee = require("../models/employees");
const { setuser } = require("../service/auth");

async function handlelogin(req, res) {
  const { user_id, password } = req.body;

  const user = await User.findOne({ user_id, password });
  if (!user) {
    return res.render("employeelogin", {
      activePage: "employee",
      loginError: "Wrong credentials",
      signupError: null,
    });
  }

  const employee = await Employee.findOne({ e_id: user.emp_id });
  if (!employee) {
    return res.render("employeelogin", {
      activePage: "employee",
      loginError: "Employee not found",
      signupError: null,
    });
  }

  // Check if the employee's status is active
  if (employee.status === "resigned" || employee.status === "fired") {
    return res.render("employeelogin", {
      activePage: "employee",
      loginError: "Invalid: Employee is resigned or fired",
      signupError: null,
    });
  }

  const token = setuser(user, employee); // Sets type based on employee.role
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
}

module.exports = { handlelogin };