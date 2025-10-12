const Employee = require("../../models/employees");
const Sale = require("../../models/sale");

async function salary_display(req, res) {
  try {
    const user = res.locals.user;
    console.log('[salary_display] User:', user);
    const employee = await Employee.findOne({ e_id: user.emp_id, role: "Sales Manager", status: "active" });
    if (!employee) {
      console.log('[salary_display] Sales Manager not found for emp_id:', user.emp_id);
      return res.status(404).send("Sales Manager not found");
    }

    // Get current date and calculate 6-month range (X-7 to X-1)
    const currentDate = new Date();
    const monthYearOptions = [];
    for (let i = 7; i >= 1; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthYear = date
        .toLocaleString('en-US', { month: 'short', year: 'numeric' })
        .replace(' ', '-');
      monthYearOptions.push(monthYear);
    }

    // Get month-year from query, default to previous month (X-1)
    const defaultMonthYear = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      .toLocaleString('en-US', { month: 'short', year: 'numeric' })
      .replace(' ', '-');
    const monthYear = req.query.monthYear || defaultMonthYear;

    res.render("salesmanager/salaries_feature/display_salary", {
      activePage: 'employee',
      activeRoute: 'salaries',
      selectedMonthYear: monthYear,
      monthYearOptions: monthYearOptions
    });
  } catch (error) {
    console.error("[salary_display] Error rendering salaries page:", error);
    res.status(500).send("Internal server error");
  }
}

async function getSalaryData(req, res) {
  try {
    const user = res.locals.user;
    console.log('[getSalaryData] User:', user);
    const employee = await Employee.findOne({ e_id: user.emp_id, role: "Sales Manager", status: "active" });
    if (!employee) {
      console.log('[getSalaryData] Sales Manager not found for emp_id:', user.emp_id);
      return res.status(404).json({ error: "Sales Manager not found" });
    }

    // Get current date and calculate 6-month range (X-7 to X-1)
    const currentDate = new Date();
    
    // Get month-year from query, default to previous month (X-1)
    const defaultMonthYear = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      .toLocaleString('en-US', { month: 'short', year: 'numeric' })
      .replace(' ', '-');
    const monthYear = req.query.monthYear || defaultMonthYear;
    const [monthStr, yearStr] = monthYear.split("-");
    const normalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    // Validate month and year
    if (!monthMap.hasOwnProperty(normalizedMonth) || isNaN(yearStr)) {
      console.log('[getSalaryData] Invalid month-year format:', monthYear);
      return res.status(400).json({ error: "Invalid month-year format" });
    }

    const month = monthMap[normalizedMonth];
    const year = parseInt(yearStr);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    // Validate month-year is within X-7 to X-1
    const earliestDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7, 1);
    const latestDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    if (startDate < earliestDate || startDate >= latestDate) {
      console.log('[getSalaryData] Month-year out of allowed range:', monthYear);
      return res.status(400).json({ error: "Selected month-year is outside the allowed 6-month range" });
    }

    // Fetch employees from the same branch
    const employees = await Employee.find({
      bid: employee.bid,
      role: { $in: ["Sales Manager", "Salesman"] },
      status: "active"
    }).lean();

    // Fetch all sales for the branch in the selected month (for Sales Manager commission)
    const branchSales = await Sale.find({
      branch_id: employee.bid,
      sales_date: { $gte: startDate, $lt: endDate }
    }).lean();

    // Calculate salaries and commissions
    const salaryData = await Promise.all(
      employees.map(async (emp) => {
        const hireDate = new Date(emp.hiredAt);
        const isHired = startDate >= new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

        if (!isHired) {
          return {
            employee_name: `${emp.f_name} ${emp.last_name}`,
            role: emp.role,
            salary: "0.00",
            commission: "0.00",
            totalsalary: "0.00",
            note: "Not hired in this month"
          };
        }

        let commission = 0;
        if (emp.role === "Salesman") {
          const sales = await Sale.find({
            salesman_id: emp.e_id,
            branch_id: emp.bid,
            sales_date: { $gte: startDate, $lt: endDate }
          }).lean();
          commission = sales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.02), 0);
        } else if (emp.role === "Sales Manager") {
          commission = branchSales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.01), 0);
        }
        const totalSalary = emp.base_salary + commission;

        return {
          employee_name: `${emp.f_name} ${emp.last_name}`,
          role: emp.role,
          salary: emp.base_salary.toFixed(2),
          commission: commission.toFixed(2),
          totalsalary: totalSalary.toFixed(2)
        };
      })
    );

    res.json(salaryData);
  } catch (error) {
    console.error("[getSalaryData] Error fetching salaries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { salary_display, getSalaryData };