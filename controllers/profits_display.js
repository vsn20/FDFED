const Product = require("../models/products");
const Order = require("../models/orders");
const Employee = require("../models/employees");
const Branch = require("../models/branches");
const Sale = require("../models/sale");

// Helper function to calculate profit for a given sales array, branch, and date range
async function calculateProfit(sales, branchId, startDate, endDate) {
  let totalSalesProfit = 0;
  let totalSalesmenCommission = 0;
  let totalSalesManagerCommission = 0;

  console.log(`[Debug] Calculating profit for ${sales.length} sales, branch ${branchId}, startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);

  // Calculate total sales profit and commissions
  for (const sale of sales) {
    const saleProfit = (sale.sold_price - sale.purchased_price) * sale.quantity;
    totalSalesProfit += saleProfit;

    // Calculate commissions per sale
    const salesmenCommission = sale.sold_price * sale.quantity * 0.02; // 2% commission for salesmen
    const managerCommission = sale.sold_price * sale.quantity * 0.01; // 1% commission for sales manager
    totalSalesmenCommission += salesmenCommission;
    totalSalesManagerCommission += managerCommission;

    console.log(`[Debug] Sale ${sale.sales_id}: Profit=${saleProfit}, SalesmenCommission=${salesmenCommission}, ManagerCommission=${managerCommission}`);
  }

  // Fetch all active employees for the branch (salesmen and sales manager)
  const employees = await Employee.find({
    bid: branchId,
    status: "active",
    role: { $in: ["Salesman", "Sales Manager"] },
    hiredAt: { $lte: endDate }
  });

  let totalEmployeeSalaries = 0;
  for (const employee of employees) {
    totalEmployeeSalaries += employee.base_salary || 0;
    console.log(`[Debug] Employee ${employee.e_id} (${employee.role}) salary: ${employee.base_salary || 0}`);
  }

  // Calculate final profit
  const profit = totalSalesProfit - (totalEmployeeSalaries + totalSalesmenCommission + totalSalesManagerCommission);
  console.log(`[Debug] Profit calc: SalesProfit=${totalSalesProfit}, EmployeeSalaries=${totalEmployeeSalaries}, SalesmenCommission=${totalSalesmenCommission}, ManagerCommission=${totalSalesManagerCommission}, Profit=${profit}`);

  return profit;
}

// Function to render profits
async function profits_display(req, res) {
  try {
    // Get current date in UTC
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-based

    // Generate past 6 months (excluding current month) for dropdown
    const months = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    for (let i = 6; i >= 1; i--) {
      const date = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      months.push({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1, // 1-based for API
        name: monthNames[date.getUTCMonth()]
      });
    }

    // Default to the most recent past month
    const defaultMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const defaultMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const defaultMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0));
    const defaultMonthName = `${monthNames[defaultMonthDate.getUTCMonth()]} ${defaultMonthDate.getUTCFullYear()}`;

    // Fetch all active branches
    const branches = await Branch.find({ active: "active" });
    const profits = [];

    // Calculate profit for each branch for the default month
    for (const branch of branches) {
      const sales = await Sale.find({
        branch_id: branch.bid,
        sales_date: { $gte: defaultMonthStart, $lte: defaultMonthEnd }
      });
      console.log(`[Debug] Initial render - Branch ${branch.bid}: Found ${sales.length} sales for ${defaultMonthName}`);
      const profit = await calculateProfit(sales, branch.bid, defaultMonthStart, defaultMonthEnd);
      profits.push({
        branch_id: branch.bid,
        branch_name: branch.b_name,
        profit: profit
      });
    }

    res.render("owner/profits", {
      profits,
      selectedMonth: defaultMonthName,
      months,
      activePage: 'profits',
      activeRoute: 'profits'
    });
  } catch (error) {
    console.log("Error rendering profits", error);
    res.status(500).send("Internal server error");
  }
}

// Function to fetch profit by month
async function profitByMonth(req, res) {
  try {
    const [year, month] = req.query.month.split('-').map(Number); // e.g., "2025-4"
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }
    const monthIndex = month - 1; // Convert to 0-based
    const startDate = new Date(Date.UTC(year, monthIndex, 1));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = `${monthNames[monthIndex]} ${year}`;

    // Fetch all active branches
    const branches = await Branch.find({ active: "active" });
    const profits = [];

    // Calculate profit for each branch
    for (const branch of branches) {
      const sales = await Sale.find({
        branch_id: branch.bid,
        sales_date: { $gte: startDate, $lte: endDate }
      });
      console.log(`[Debug] Profit by month - Branch ${branch.bid}: Found ${sales.length} sales for ${monthName}`);
      const profit = await calculateProfit(sales, branch.bid, startDate, endDate);
      profits.push({
        branch_id: branch.bid,
        branch_name: branch.b_name,
        profit: profit
      });
    }

    res.json({ profits, monthName });
  } catch (error) {
    console.error('[Error] Failed to fetch profit by month:', error);
    res.status(500).json({ error: "Failed to calculate profit" });
  }
}

module.exports = { profits_display, profitByMonth };