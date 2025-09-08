const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function getSalesmanDetails(req, res) {
  try {
    if (!req.user || !req.user.emp_id) {
      return res.redirect("/login");
    }

    if (req.user.type !== "salesman") {
      return res.status(403).send("Access denied: Not a salesman");
    }

    console.log("Querying for e_id:", req.user.emp_id);
    const salesman = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesman) {
      console.log("No salesman found for e_id:", req.user.emp_id);
      return res.status(404).send("Salesman not found");
    }

    let branchName = "Unknown Branch";
    if (salesman.bid) {
      const branch = await Branch.findOne({ bid: salesman.bid }).lean();
      if (branch && branch.b_name) {
        branchName = branch.b_name;
      }
    }

    const hireDate = salesman.hiredAt || new Date();
    res.render("salesman/Employee_details/employee_details", {
      salesman: {
        salesmanId: salesman.e_id || "N/A",
        firstName: salesman.f_name || "Unknown",
        lastName: salesman.last_name || "Unknown",
        role: salesman.role || "Salesman",
        status: salesman.status.charAt(0).toUpperCase() + salesman.status.slice(1) || "Active",
        branch: branchName,
        email: salesman.email || "N/A",
        phoneNumber: salesman.phone_no || "N/A",
        registrationDate: hireDate,
        formattedRegistrationDate: hireDate
          ? new Date(hireDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "N/A",
        accountNumber: salesman.acno || "N/A",
        ifscCode: salesman.ifsc || "N/A",
        bank: salesman.bankname || "N/A",
        hireDate: hireDate,
        formattedHireDate: hireDate
          ? new Date(hireDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "N/A",
        monthlySalary: salesman.base_salary || 0,
        address: salesman.address || "N/A",
      },
      activePage: 'employee',
      activeRoute: 'employees',
      successMessage: req.query.success,
      errorMessage: req.query.error
    });
  } catch (error) {
    console.log("Error rendering employee details:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateSalesmanDetails(req, res) {
  try {
    if (!req.user || !req.user.emp_id) {
      return res.redirect("/login");
    }

    if (req.user.type !== "salesman") {
      return res.status(403).send("Access denied: Not a salesman");
    }

    console.log("Received form data:", req.body);

    const {
      firstName,
      lastName,
      status,
      email,
      phoneNumber,
      accountNumber,
      ifscCode,
      bank,
      address,
    } = req.body;

    const employee = await Employee.findOne({ e_id: req.user.emp_id });
    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    console.log("Employee before update:", employee);

    const branch = await Branch.findOne({ manager_id: employee._id });
    const wasManager = !!branch;

    // Update fields, ensuring required fields are not set to empty strings
    if (firstName !== undefined && firstName !== "") {
      employee.f_name = firstName;
    }
    if (lastName !== undefined && lastName !== "") {
      employee.last_name = lastName;
    }
    if (status !== undefined && status !== "") {
      employee.status = status.toLowerCase();
    }
    if (email !== undefined && email !== "") {
      employee.email = email;
    }
    if (phoneNumber !== undefined) {
      employee.phone_no = phoneNumber || null; // Allow clearing since it has default: null
    }
    if (accountNumber !== undefined && accountNumber !== "") {
      employee.acno = accountNumber;
    }
    if (ifscCode !== undefined && ifscCode !== "") {
      employee.ifsc = ifscCode;
    }
    if (bank !== undefined && bank !== "") {
      employee.bankname = bank;
    }
    if (address !== undefined) {
      employee.address = address || null; // Allow clearing since it has default: null
    }

    console.log("Employee after update (before save):", employee);

    await employee.save();

    const updatedEmployee = await Employee.findOne({ e_id: req.user.emp_id }).lean();
    console.log("Employee after save:", updatedEmployee);

    if (wasManager && (employee.status === "resigned" || employee.status === "fired")) {
      branch.manager_id = null;
      branch.manager_name = "Not Assigned";
      branch.manager_email = "N/A";
      branch.manager_ph_no = "N/A";
      branch.manager_assigned = false;
      await branch.save();
      console.log("Updated branch:", branch);
    }

    res.redirect("/salesman/employees?success=Employee%20details%20updated%20successfully!");
  } catch (error) {
    console.log("Error updating employee details:", error);
    // Redirect with an error message
    const errorMessage = encodeURIComponent(error.message || "Failed to update employee details");
    res.redirect(`/salesman/employees?error=${errorMessage}`);
  }
}

module.exports = { getSalesmanDetails, updateSalesmanDetails };