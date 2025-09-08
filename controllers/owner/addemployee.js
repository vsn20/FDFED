const Employee = require('../../models/employees');
const Branch = require('../../models/branches');

async function addemployee(req, res) {
  try {
    const {
      f_name,
      last_name,
      role,
      bid: bidFromForm,
      email,
      phone_no,
      acno,
      ifsc,
      bankname,
      base_salary,
      address
    } = req.body;

    const createdBy = req.cookies.createdBy || 'owner';

    // Generate unique employee ID
    const employeeCount = await Employee.countDocuments();
    const e_id = `EMP${employeeCount + 1}`;

    // Handle branch assignment
    const bid = bidFromForm === 'null' ? null : bidFromForm;

    // Validate Sales Manager branch assignment
    if (role === 'Sales Manager' && bid && bid !== 'null') {
      const branch = await Branch.findOne({ bid });
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: `Branch ${bid} not found.`
        });
      }
      if (branch.manager_assigned) {
        return res.status(400).json({
          success: false,
          message: `Branch ${bid} already has a Sales Manager assigned.`
        });
      }
    }

    // Create new employee
    const newEmployee = new Employee({
      e_id,
      f_name,
      last_name,
      role,
      status: 'active',
      bid,
      email,
      phone_no: phone_no || null,
      address: address || null,
      acno,
      ifsc,
      bankname,
      base_salary,
      createdBy,
      hiredAt: new Date(),
      resignation_date: null,
      fired_date: null,
      reason_for_exit: null
    });

    await newEmployee.save();

    // Update branch if Sales Manager
    if (role === 'Sales Manager' && bid && bid !== 'null') {
      await Branch.findOneAndUpdate(
        { bid },
        {
          manager_id: newEmployee._id,
          manager_name: `${f_name} ${last_name}`,
          manager_email: email,
          manager_ph_no: phone_no || 'N/A',
          manager_assigned: true
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Employee added successfully',
      redirect: '/admin/employees'
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding employee: ' + error.message
    });
  }
}

module.exports = { addemployee };