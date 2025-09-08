const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function employeeDisplay(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Unauthorized access',
        salesManager: null,
        employeeData: [],
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Only sales managers can access this page',
        salesManager: null,
        employeeData: [],
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Sales Manager must be assigned to a valid branch',
        salesManager: null,
        employeeData: [],
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Branch not found or inactive',
        salesManager: null,
        employeeData: [],
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const employees = await Employee.find({
      role: { $regex: '^Salesman$', $options: 'i' },
      bid: salesManager.bid.trim(),
      $and: [
        { bid: { $ne: null } },
        { bid: { $ne: 'Not Assigned' } },
        { bid: { $exists: true } }
      ]
    }).lean();

    res.render('salesmanager/employee_features/employee_display', {
      error: null,
      salesManager: salesManager,
      employeeData: employees || [],
      activePage: 'employee',
      activeRoute: 'employees',
      message: req.query.message || null
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/employee_display', {
      error: 'Internal Server Error',
      salesManager: null,
      employeeData: [],
      activePage: 'employee',
      activeRoute: 'employees',
      message: null
    });
  }
}

async function employeeDetail(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Unauthorized access',
        employee: null,
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Only sales managers can access this page',
        employee: null,
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Sales Manager must be assigned to a valid branch',
        employee: null,
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Branch not found or inactive',
        employee: null,
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const e_id = req.params.e_id;
    const employee = await Employee.findOne({
      e_id,
      bid: salesManager.bid.trim(),
      role: { $regex: '^Salesman$', $options: 'i' },
      $and: [
        { bid: { $ne: null } },
        { bid: { $ne: 'Not Assigned' } },
        { bid: { $exists: true } }
      ]
    }).lean();

    if (!employee) {
      return res.status(404).render('salesmanager/employee_features/employee_details', {
        error: 'Employee not found, not a Salesman, or not in your branch',
        employee: null,
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    res.render('salesmanager/employee_features/employee_details', {
      error: null,
      employee,
      activePage: 'employee',
      activeRoute: 'employees',
      message: req.query.message || null
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/employee_details', {
      error: 'Internal Server Error',
      employee: null,
      activePage: 'employee',
      activeRoute: 'employees',
      message: null
    });
  }
}

async function fireEmployee(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).json({ error: 'Only sales managers can access this page' });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).json({ error: 'Sales Manager must be assigned to a valid branch' });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).json({ error: 'Branch not found or inactive' });
    }

    const e_id = req.params.e_id;
    const employee = await Employee.findOne({
      e_id,
      bid: salesManager.bid.trim(),
      role: { $regex: '^Salesman$', $options: 'i' },
      status: 'active',
      $and: [
        { bid: { $ne: null } },
        { bid: { $ne: 'Not Assigned' } },
        { bid: { $exists: true } }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found, not a Salesman, not active, or not in your branch' });
    }

    const { reason_for_exit } = req.body;
    if (!reason_for_exit) {
      return res.status(400).json({ error: 'Reason for exit is required' });
    }

    employee.status = 'fired';
    employee.fired_date = new Date();
    employee.reason_for_exit = reason_for_exit;
    await employee.save();

    res.redirect('/salesmanager/employees?message=Employee fired successfully');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateSalesmanSalary(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).json({ error: 'Only sales managers can access this page' });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).json({ error: 'Sales Manager must be assigned to a valid branch' });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).json({ error: 'Branch not found or inactive' });
    }

    const e_id = req.params.e_id;
    const employee = await Employee.findOne({
      e_id,
      bid: salesManager.bid.trim(),
      role: { $regex: '^Salesman$', $options: 'i' },
      $and: [
        { bid: { $ne: null } },
        { bid: { $ne: 'Not Assigned' } },
        { bid: { $exists: true } }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found, not a Salesman, or not in your branch' });
    }

    const { base_salary } = req.body;
    if (base_salary === undefined || base_salary === null) {
      return res.status(400).json({ error: 'Monthly salary is required' });
    }

    const salaryValue = parseFloat(base_salary);
    if (isNaN(salaryValue) || salaryValue < 0) {
      return res.status(400).json({ error: 'Monthly salary must be a non-negative number' });
    }

    employee.base_salary = salaryValue;
    await employee.save();

    const updatedEmployee = await Employee.findOne({ e_id }).lean();
    res.render('salesmanager/employee_features/employee_details', {
      error: null,
      employee: updatedEmployee,
      activePage: 'employee',
      activeRoute: 'employees',
      message: 'Salary updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function editSalesManager(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/edit_salesmanager', {
        error: 'Unauthorized access',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/edit_salesmanager', {
        error: 'Only sales managers can access this page',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    res.render('salesmanager/employee_features/edit_salesmanager', {
      error: null,
      salesManager,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/edit_salesmanager', {
      error: 'Internal Server Error',
      salesManager: null,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  }
}

async function updateSalesManager(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id });

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).json({ error: 'Only sales managers can access this page' });
    }

    salesManager.f_name = req.body.f_name || salesManager.f_name;
    salesManager.last_name = req.body.last_name || salesManager.last_name;
    salesManager.email = req.body.email || salesManager.email;
    salesManager.phone_no = req.body.phone_no || salesManager.phone_no;
    salesManager.address = req.body.address || salesManager.address;
    salesManager.acno = req.body.acno || salesManager.acno;
    salesManager.ifsc = req.body.ifsc || salesManager.ifsc;
    salesManager.bankname = req.body.bankname || salesManager.bankname;
    salesManager.base_salary = req.body.base_salary || salesManager.base_salary;

    if (!salesManager.f_name || !salesManager.last_name || !salesManager.email || 
        !salesManager.acno || !salesManager.ifsc || !salesManager.bankname || !salesManager.base_salary) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(salesManager.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (salesManager.phone_no) {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(salesManager.phone_no)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
      }
    }

    if (req.body.email && req.body.email !== salesManager.email) {
      const emailExists = await Employee.findOne({ email: req.body.email, e_id: { $ne: salesManager.e_id } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use by another employee' });
      }
    }

    if (salesManager.base_salary < 0) {
      return res.status(400).json({ error: 'Monthly salary cannot be negative' });
    }

    await salesManager.save();

    await Branch.updateOne(
      { bid: salesManager.bid },
      {
        manager_name: `${salesManager.f_name} ${salesManager.last_name}`,
        manager_email: salesManager.email,
        manager_ph_no: salesManager.phone_no
      }
    );

    res.redirect('/salesmanager/employees?message=Profile updated successfully');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function renderAddEmployeeForm(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Unauthorized access',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Only sales managers can access this page',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Sales Manager must be assigned to a valid branch',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Branch not found or inactive',
        salesManager: null,
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    res.render('salesmanager/employee_features/add_employee', {
      error: null,
      salesManager: salesManager,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/add_employee', {
      error: 'Internal Server Error',
      salesManager: null,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  }
}

async function addEmployee(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).json({ error: 'Only sales managers can access this page' });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).json({ error: 'Sales Manager must be assigned to a valid branch' });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).json({ error: 'Branch not found or inactive' });
    }

    const {
      f_name,
      last_name,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address
    } = req.body;

    if (!f_name || !last_name || !email || !acno || !ifsc || !bankname || !base_salary) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phone_no) {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone_no)) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
      }
    }

    const emailExists = await Employee.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use by another employee' });
    }

    if (base_salary < 0) {
      return res.status(400).json({ error: 'Monthly salary cannot be negative' });
    }

    const employeeCount = await Employee.countDocuments();
    const e_id = `EMP${employeeCount + 1}`;

    const newEmployee = new Employee({
      e_id,
      f_name,
      last_name,
      role: 'Salesman',
      status: 'active',
      bid: salesManager.bid.trim(),
      email,
      phone_no: phone_no || null,
      address: address || null,
      acno,
      ifsc,
      bankname,
      base_salary,
      createdBy: salesManager.f_name + ' ' + salesManager.last_name,
      hiredAt: new Date(),
      resignation_date: null,
      fired_date: null,
      reason_for_exit: null
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      redirect: '/salesmanager/employees'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { employeeDisplay, employeeDetail, fireEmployee, updateSalesmanSalary, editSalesManager, updateSalesManager, renderAddEmployeeForm, addEmployee };