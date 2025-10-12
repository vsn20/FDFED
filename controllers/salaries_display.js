const Employee = require("../models/employees");
const Sale = require("../models/sale");

async function salary_display(req, res) {
  try {
    res.render("owner/salaries_feature/display_salary", {
      activePage: 'employee',
      activeRoute: 'salaries'
    });
  } catch (error) {
    console.error("[salary_display] Error rendering salaries:", error);
    res.status(500).send("server error");
  }
}

async function getSalaryData(req, res) {
  try {
    console.log('[getSalaryData] Request received:', req.url, req.query);
    console.log('[getSalaryData] User:', res.locals.user);

    // Simplified role check for debugging
    if (!res.locals.user) {
      console.log('[getSalaryData] No user found in res.locals');
      return res.status(403).json({ error: "Access denied: No user data" });
    }

    // Get current date and calculate 6-month range (X-7 to X-1)
    const currentDate = new Date();
    // Get month-year from query, default to previous month (X-1)
    const defaultMonthYear = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      .toLocaleString('default', { month: 'short', year: 'numeric' })
      .replace(' ', '-');
    const monthYear = req.query.monthYear || defaultMonthYear;
    const [monthStr, yearStr] = monthYear.split("-");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    // Validate month and year
    if (!monthMap.hasOwnProperty(monthStr) || isNaN(yearStr)) {
      console.log('[getSalaryData] Invalid month-year format:', monthYear);
      return res.status(400).json({ error: "Invalid month-year format" });
    }

    const month = monthMap[monthStr];
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

    // Fetch all Sales Managers and Salesmen
    const employees = await Employee.find({
      role: { $in: ["Sales Manager", "Salesman"] },
      status: "active"
    }).lean();
    console.log('[getSalaryData] Employees found:', employees.length);

    // Calculate salaries and commissions
    const salaryData = await Promise.all(
      employees.map(async (emp) => {
        const hireDate = new Date(emp.hiredAt);
        const isHired = startDate >= new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

        if (!isHired) {
          return {
            eid: emp.e_id,
            ename: `${emp.f_name} ${emp.last_name}`,
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
          const branchSales = await Sale.find({
            branch_id: emp.bid,
            sales_date: { $gte: startDate, $lt: endDate }
          }).lean();
          commission = branchSales.reduce((sum, sale) => sum + (sale.profit_or_loss * 0.01), 0);
        }
        const totalSalary = emp.base_salary + commission;

        return {
          eid: emp.e_id,
          ename: `${emp.f_name} ${emp.last_name}`,
          role: emp.role,
          salary: emp.base_salary.toFixed(2),
          commission: commission.toFixed(2),
          totalsalary: totalSalary.toFixed(2)
        };
      })
    );
    console.log('[getSalaryData] Salary data prepared:', salaryData);

    res.json({
      salary: salaryData,
      selectedMonthYear: monthYear
    });
  } catch (error) {
    console.error("[getSalaryData] Error fetching salaries:", error);
    res.status(500).json({ error: "server error" });
  }
}

module.exports = { salary_display, getSalaryData };