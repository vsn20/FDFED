const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function employeeDisplay(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Unauthorized access',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Only sales managers can access this page',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Sales Manager must be assigned to a valid branch',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/employee_display', {
        error: 'Branch not found or inactive',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/employee_features/employee_display', {
      error: null,
      activePage: 'employee',
      activeRoute: 'employees',
      message: req.query.message || null
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/employee_display', {
      error: 'Internal Server Error',
      activePage: 'employee',
      activeRoute: 'employees',
      message: null
    });
  }
}

async function getSelfData(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee || employee.role.toLowerCase() !== 'sales manager') {
      return res.status(403).json({ error: 'Only sales managers can access this' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getEmployeesData(req, res) {
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

    const employees = await Employee.find({
      role: { $regex: '^Salesman$', $options: 'i' },
      bid: salesManager.bid.trim(),
      $and: [
        { bid: { $ne: null } },
        { bid: { $ne: 'Not Assigned' } },
        { bid: { $exists: true } }
      ]
    }).lean();

    res.json(employees || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function employeeDetail(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Unauthorized access',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Only sales managers can access this page',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Sales Manager must be assigned to a valid branch',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/employee_details', {
        error: 'Branch not found or inactive',
        activePage: 'employee',
        activeRoute: 'employees',
        message: null
      });
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/employee_features/employee_details', {
      error: null,
      activePage: 'employee',
      activeRoute: 'employees',
      e_id: req.params.e_id,
      message: req.query.message || null
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/employee_details', {
      error: 'Internal Server Error',
      activePage: 'employee',
      activeRoute: 'employees',
      message: null
    });
  }
}

async function getEmployeeById(req, res) {
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

    const employee = await Employee.findOne({ e_id: req.params.e_id }).lean();

    if (!employee || employee.bid !== salesManager.bid || employee.role.toLowerCase() !== 'salesman') {
      return res.status(404).json({ error: 'Employee not found or not accessible' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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

    const employee = await Employee.findOne({ e_id: req.params.e_id });
    if (!employee || employee.bid !== salesManager.bid || employee.role.toLowerCase() !== 'salesman' || employee.status !== 'active') {
      return res.status(404).json({ error: 'Employee not found or cannot be fired' });
    }

    const { reason_for_exit } = req.body;
    if (!reason_for_exit) {
      return res.status(400).json({ error: 'Reason for exit is required' });
    }

    employee.status = 'fired';
    employee.fired_date = new Date();
    employee.reason_for_exit = reason_for_exit;
    employee.bid = null;

    await employee.save();

    res.json({
      success: true,
      message: 'Employee fired successfully',
      redirect: '/salesmanager/employees'
    });
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

    const employee = await Employee.findOne({ e_id: req.params.e_id });
    if (!employee || employee.bid !== salesManager.bid || employee.role.toLowerCase() !== 'salesman' || employee.status !== 'active') {
      return res.status(404).json({ error: 'Employee not found or cannot update salary' });
    }

    const { base_salary } = req.body;
    if (isNaN(base_salary) || base_salary < 0) {
      return res.status(400).json({ error: 'Invalid salary value' });
    }

    employee.base_salary = parseFloat(base_salary);
    await employee.save();

    res.json({
      success: true,
      message: 'Salary updated successfully',
      redirect: `/salesmanager/employee-details/${req.params.e_id}`
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
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/edit_salesmanager', {
        error: 'Only sales managers can access this page',
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/employee_features/edit_salesmanager', {
      error: null,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/edit_salesmanager', {
      error: 'Internal Server Error',
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

    const {
      f_name,
      last_name,
      email,
      phone_no,
      address,
      acno,
      ifsc,
      bankname
    } = req.body;

    if (!f_name || !last_name || !email || !acno || !ifsc || !bankname) {
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

    const emailExists = await Employee.findOne({ email, e_id: { $ne: salesManager.e_id } });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use by another employee' });
    }

    salesManager.f_name = f_name;
    salesManager.last_name = last_name;
    salesManager.email = email;
    salesManager.phone_no = phone_no || null;
    salesManager.address = address || null;
    salesManager.acno = acno;
    salesManager.ifsc = ifsc;
    salesManager.bankname = bankname;

    await salesManager.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      redirect: '/salesmanager/employees'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function renderAddEmployeeForm(req, res) {
  try {
    if (!req.user || !req.user.emp_id || req.user.type.toLowerCase().replace(/\s/g, '') !== 'salesmanager') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Unauthorized access',
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const salesManager = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!salesManager || salesManager.role.toLowerCase() !== 'sales manager') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Only sales managers can access this page',
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    if (!salesManager.bid || salesManager.bid === 'Not Assigned') {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Sales Manager must be assigned to a valid branch',
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    const branch = await Branch.findOne({ bid: salesManager.bid, active: 'active' }).lean();
    if (!branch) {
      return res.status(403).render('salesmanager/employee_features/add_employee', {
        error: 'Branch not found or inactive',
        activePage: 'employee',
        activeRoute: 'employees'
      });
    }

    res.render('salesmanager/employee_features/add_employee', {
      error: null,
      activePage: 'employee',
      activeRoute: 'employees'
    });
  } catch (error) {
    res.status(500).render('salesmanager/employee_features/add_employee', {
      error: 'Internal Server Error',
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

    res.json({
      success: true,
      message: 'Employee added successfully',
      redirect: '/salesmanager/employees'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { employeeDisplay, getSelfData, getEmployeesData, employeeDetail, getEmployeeById, fireEmployee, updateSalesmanSalary, editSalesManager, updateSalesManager, renderAddEmployeeForm, addEmployee };