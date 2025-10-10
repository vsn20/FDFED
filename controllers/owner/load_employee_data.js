const Employee = require('../../models/employees');
const Branch = require('../../models/branches');

async function loademployeedata(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render('owner/employee_feature/home.ejs', {
      activePage: 'employee',
      activeRoute: 'employees',
    });
  } catch (error) {
    res.status(500).send(`Error loading employee data: ${error.message}`);
  }
}

async function getEmployeesData(req, res) {
  try {
    const employees = await Employee.find().lean();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { e_id } = req.params;
    const employee = await Employee.findOne({ e_id }).lean();
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getEmployeeDetails(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render('owner/employee_feature/employee_details.ejs', {
      activePage: 'employee',
      activeRoute: 'employees',
    });
  } catch (error) {
    res.status(500).send(`Error loading employee details: ${error.message}`);
  }
}

async function getEditEmployee(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render('owner/employee_feature/edit_employee.ejs', {
      activePage: 'employee',
      activeRoute: 'employees',
    });
  } catch (error) {
    res.status(500).send(`Error loading edit employee page: ${error.message}`);
  }
}

async function updateEmployee(req, res) {
  try {
    const { e_id } = req.params;
    const {
      f_name,
      last_name,
      role,
      bid: bidFromForm,
      status,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address
    } = req.body;

    const employee = await Employee.findOne({ e_id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Determine final bid
    let finalBid = bidFromForm === 'null' ? null : bidFromForm;
    if (role === 'Sales Manager' && (status === 'resigned' || status === 'fired')) {
      finalBid = null; // Automatically unassign branch
    }

    // Validate bid if provided
    if (finalBid && finalBid !== 'null') {
      const branchExists = await Branch.findOne({ bid: finalBid });
      if (!branchExists) {
        return res.status(400).json({ success: false, message: `Invalid branch ID: ${finalBid}` });
      }
    }

    // Clear old branch if Sales Manager's branch changes or is unassigned
    if (employee.role === 'Sales Manager' && employee.bid && (employee.bid !== finalBid || finalBid === null)) {
      await Branch.findOneAndUpdate(
        { bid: employee.bid },
        {
          manager_id: null,
          manager_name: 'Not Assigned',
          manager_email: 'N/A',
          manager_ph_no: 'N/A',
          manager_assigned: false
        }
      );
    }

    // Validate Sales Manager branch assignment for active status
    if (role === 'Sales Manager' && finalBid && status === 'active') {
      const branch = await Branch.findOne({ bid: finalBid });
      if (!branch) {
        return res.status(404).json({ success: false, message: `Branch ${finalBid} not found` });
      }
      if (branch.manager_assigned && branch.manager_id && branch.manager_id.toString() !== employee._id.toString()) {
        return res.status(400).json({ success: false, message: `Branch ${finalBid} already has a Sales Manager assigned` });
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findOneAndUpdate(
      { e_id },
      {
        f_name,
        last_name,
        role,
        bid: finalBid,
        status,
        email,
        phone_no: phone_no || null,
        acno,
        ifsc,
        bankname,
        base_salary,
        address: address || null,
        ...(status === 'resigned' ? { resignation_date: new Date() } : {}),
        ...(status === 'fired' ? { fired_date: new Date() } : {})
      },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update new branch if Sales Manager is active and assigned
    if (role === 'Sales Manager' && status === 'active' && finalBid) {
      await Branch.findOneAndUpdate(
        { bid: finalBid },
        {
          manager_id: updatedEmployee._id,
          manager_name: `${f_name} ${last_name}`,
          manager_email: email,
          manager_ph_no: phone_no || 'N/A',
          manager_assigned: true
        }
      );
    }

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: `Error updating employee: ${error.message}` });
  }
}

async function syncEmployeeBranchData(req, res) {
  try {
    const branches = await Branch.find();
    const employees = await Employee.find();

    // Reset all branches
    await Branch.updateMany({}, {
      manager_id: null,
      manager_name: 'Not Assigned',
      manager_email: 'N/A',
      manager_ph_no: 'N/A',
      manager_assigned: false
    });

    // Reassign active Sales Managers to their branches
    for (const employee of employees) {
      if (employee.role === 'Sales Manager' && employee.bid && employee.status === 'active') {
        const branch = await Branch.findOne({ bid: employee.bid });
        if (branch && !branch.manager_assigned) {
          await Branch.findOneAndUpdate(
            { bid: employee.bid },
            {
              manager_id: employee._id,
              manager_name: `${employee.f_name} ${employee.last_name}`,
              manager_email: employee.email,
              manager_ph_no: employee.phone_no || 'N/A',
              manager_assigned: true
            }
          );
        }
      }
    }

    res.status(200).send('Employee and branch data synced successfully');
  } catch (error) {
    res.status(500).send(`Error syncing data: ${error.message}`);
  }
}

module.exports = { 
  loademployeedata, 
  getEmployeesData,
  getEmployeeById,
  getEmployeeDetails, 
  getEditEmployee, 
  updateEmployee, 
  syncEmployeeBranchData 
};