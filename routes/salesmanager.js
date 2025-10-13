const express = require("express");
const router = express.Router();
const Employee = require("../models/employees");
const Branch = require("../models/branches");
const Sale = require("../models/sale");
const Product = require("../models/products");
const Order = require("../models/orders");

// Helper function to calculate profit (unchanged)
async function calculateProfit(sales, branchId, startDate) {
  let totalSalesAmount = 0;
  let totalRetailCost = 0;
  let totalOrderPurchaseCost = 0;

  console.log(`[Debug] Calculating profit for ${sales.length} sales, startDate: ${startDate.toISOString()}`);

  for (const sale of sales) {
    totalSalesAmount += sale.sold_price * sale.quantity;
    const product = await Product.findOne({ prod_id: sale.product_id });
    if (product && product.Retail_price != null) {
      totalRetailCost += sale.quantity * parseFloat(product.Retail_price);
    } else {
      console.log(`[Warning] Product not found or Retail_price missing for product_id: ${sale.product_id}`);
    }
  }

  const orders = await Order.find({
    branch_id: branchId,
    status: "accepted",
    order_date: { $gte: startDate }
  });

  for (const order of orders) {
    const product = await Product.findOne({ prod_id: order.product_id });
    if (product && product.Purchase_price != null) {
      totalOrderPurchaseCost += order.quantity * parseFloat(product.Purchase_price);
      console.log(`[Debug] Order ${order.order_id} purchase cost: ${order.quantity} * ${product.Purchase_price} = ${order.quantity * parseFloat(product.Purchase_price)}`);
    } else {
      console.log(`[Warning] Product not found or Purchase_price missing for product_id: ${order.product_id}`);
    }
  }

  const salesmen = await Employee.find({
    bid: branchId,
    role: "Salesman",
    status: "active"
  });
  const totalSalesmenSalaries = salesmen.reduce((sum, salesman) => {
    if (salesman.hiredAt && salesman.hiredAt > startDate) {
      console.log(`[Debug] Salesman ${salesman.e_id} not hired by ${startDate.toISOString()}, salary: 0`);
      return sum;
    }
    console.log(`[Debug] Salesman ${salesman.e_id} salary: ${salesman.base_salary || 0}`);
    return sum + (salesman.base_salary || 0);
  }, 0);

  const branch = await Branch.findOne({ bid: branchId, active: "active" });
  let salesManagerSalary = 0;
  if (branch && branch.manager_id) {
    const salesManager = await Employee.findOne({ _id: branch.manager_id, status: "active" });
    if (salesManager && (!salesManager.hiredAt || salesManager.hiredAt <= startDate)) {
      salesManagerSalary = salesManager.base_salary || 0;
      console.log(`[Debug] Sales Manager ${salesManager.e_id} salary: ${salesManagerSalary}`);
    } else {
      console.log(`[Debug] Sales Manager not hired by ${startDate.toISOString()}, salary: 0`);
    }
  }

  const profit = totalSalesAmount - (totalRetailCost + totalOrderPurchaseCost + totalSalesmenSalaries + salesManagerSalary);
  console.log(`[Debug] Profit calc: Sales=${totalSalesAmount}, Retail=${totalRetailCost}, OrderPurchaseCost=${totalOrderPurchaseCost}, SalesmenSalaries=${totalSalesmenSalaries}, ManagerSalary=${salesManagerSalary}, Profit=${profit}`);
  return profit;
}

// Render empty Sales Manager homepage
router.get("/home", async (req, res) => {
  console.log('[Route] Accessing /salesmanager/home');
  const emp_id = req.user?.emp_id;
  if (!emp_id) {
    console.log('[Error] No authenticated user found');
    return res.redirect("/login");
  }

  res.render("salesmanager/home", {
    activePage: "employee",
    activeRoute: ""
  });
});

// API endpoint to fetch Sales Manager dashboard data
router.get("/home/data", async (req, res) => {
  console.log('[Route] Accessing /salesmanager/home/data');
  try {
    const emp_id = req.user?.emp_id;
    if (!emp_id) {
      console.log('[Error] No authenticated user found');
      return res.status(401).json({ error: "Unauthorized" });
    }

    const employee = await Employee.findOne({ e_id: emp_id, status: "active" });
    if (!employee) {
      console.log('[Error] No active employee found for emp_id:', emp_id);
      return res.status(401).json({ error: "Employee not found" });
    }

    const branch = await Branch.findOne({ manager_id: employee._id, active: "active" });
    if (!branch) {
      console.log('[Error] No active branch assigned to this manager');
      return res.json({
        cumulativeProfit: null,
        previousMonthProfit: null,
        branch_name: "N/A",
        previousMonthName: "",
        months: []
      });
    }

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const previousMonthStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const previousMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0));

    const cumulativeEnd = previousMonthEnd;

    const previousMonthSales = await Sale.find({
      branch_id: branch.bid,
      sales_date: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });
    console.log(`[Debug] Previous month sales (${previousMonthStart.toISOString()} to ${previousMonthEnd.toISOString()}): ${previousMonthSales.length}`);

    const cumulativeSales = await Sale.find({
      branch_id: branch.bid,
      sales_date: { $lte: cumulativeEnd }
    });
    console.log(`[Debug] Cumulative sales up to ${cumulativeEnd.toISOString()}: ${cumulativeSales.length}`);

    const previousMonthProfit = await calculateProfit(previousMonthSales, branch.bid, previousMonthStart);
    const cumulativeProfit = await calculateProfit(cumulativeSales, branch.bid, new Date(0));

    const months = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    for (let i = 7; i >= 1; i--) {
      const date = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      months.push({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        name: `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`
      });
    }

    res.json({
      cumulativeProfit: cumulativeProfit.toFixed(2),
      previousMonthProfit: previousMonthProfit.toFixed(2),
      branch_name: branch.b_name,
      previousMonthName: monthNames[previousMonthDate.getUTCMonth()],
      months
    });
  } catch (error) {
    console.error('[Error] Failed to fetch salesmanager home data:', error);
    res.status(500).json({
      error: "Internal Server Error",
      cumulativeProfit: null,
      previousMonthProfit: null,
      branch_name: "N/A",
      previousMonthName: "",
      months: []
    });
  }
});

// Profit by month endpoint (unchanged)
router.get("/profit-by-month", async (req, res) => {
  try {
    const emp_id = req.user?.emp_id;
    if (!emp_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const employee = await Employee.findOne({ e_id: emp_id, status: "active" });
    if (!employee) {
      return res.status(401).json({ error: "Employee not found" });
    }

    const branch = await Branch.findOne({ manager_id: employee._id, active: "active" });
    if (!branch) {
      return res.status(404).json({ error: "No branch assigned" });
    }

    const [year, month] = req.query.month.split('-').map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }
    const monthIndex = month - 1;
    const startDate = new Date(Date.UTC(year, monthIndex, 1));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));

    const sales = await Sale.find({
      branch_id: branch.bid,
      sales_date: { $gte: startDate, $lte: endDate }
    });
    console.log(`[Debug] Sales for ${month}/${year}: ${sales.length}`);

    const profit = await calculateProfit(sales, branch.bid, startDate);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = `${monthNames[monthIndex]} ${year}`;

    res.json({ profit: profit.toFixed(2), monthName });
  } catch (error) {
    console.error('[Error] Failed to fetch profit by month:', error);
    res.status(500).json({ error: "Failed to calculate profit" });
  }
});

const { inventory_display, getInventoryData } = require("../controllers/salesmanager/inventory_display");
router.get("/stocks", (req, res) => {
  console.log('[Route] Accessing /salesmanager/stocks');
  inventory_display(req, res);
});
router.get("/stocks/data", (req, res) => {
  console.log('[Route] Accessing /salesmanager/stocks/data');
  getInventoryData(req, res);
});

const { customers_display, getCustomersData } = require("../controllers/salesmanager/admin_customers_display");
router.get("/customers", (req, res) => {
  console.log('[Route] Accessing /salesmanager/customers');
  customers_display(req, res);
});
router.get("/customers/data", (req, res) => {
  console.log('[Route] Accessing /salesmanager/customers/data');
  getCustomersData(req, res);
});

const { renderAddSaleForm, sales_display, getSalesData, sales_details, getSaleById, addsale_post, getSalesmen, getCompanies } = require('../controllers/salesmanager/sales');
router.get('/sales', (req, res) => {
  console.log('[Route] Accessing /salesmanager/sales');
  sales_display(req, res);
});
router.get('/sales/data', (req, res) => {
  console.log('[Route] Accessing /salesmanager/sales/data');
  getSalesData(req, res);
});
router.get('/sales/data/:id', (req, res) => {
  console.log('[Route] Accessing /salesmanager/sales/data/:id');
  getSaleById(req, res);
});
router.get('/sales/:id', (req, res) => {
  console.log('[Route] Accessing /salesmanager/sales/:id');
  sales_details(req, res);
});
router.get('/add-sale', (req, res) => {
  console.log('[Route] Accessing /salesmanager/add-sale');
  renderAddSaleForm(req, res);
});
router.post('/add-sale', (req, res) => {
  console.log('[Route] Posting to /salesmanager/add-sale');
  addsale_post(req, res);
});
router.get('/salesmen', (req, res) => {
  console.log('[Route] Accessing /salesmanager/salesmen');
  getSalesmen(req, res);
});
router.get('/companies', (req, res) => {
  console.log('[Route] Accessing /salesmanager/companies');
  getCompanies(req, res);
});

const { orders_display, getOrdersData, getOrderById, order_details, order_edit, order_update, addorder_post, renderAddOrderForm } = require('../controllers/salesmanager/orders');
router.get('/orders', (req, res) => {
  console.log('[Route] Accessing /salesmanager/orders');
  orders_display(req, res);
});
router.get('/orders/data', (req, res) => {
  console.log('[Route] Accessing /salesmanager/orders/data');
  getOrdersData(req, res);
});
router.get('/orders/data/:id', (req, res) => {
  console.log('[Route] Accessing /salesmanager/orders/data/:id');
  getOrderById(req, res);
});
router.get('/orders/:id', (req, res) => {
  console.log('[Route] Accessing /salesmanager/orders/:id');
  order_details(req, res);
});
router.get('/orders/edit/:id', (req, res) => {
  console.log('[Route] Accessing /salesmanager/orders/edit/:id');
  order_edit(req, res);
});
router.post('/orders/update/:id', (req, res) => {
  console.log('[Route] Posting to /salesmanager/orders/update/:id');
  order_update(req, res);
});
router.get('/add-order', (req, res) => {
  console.log('[Route] Accessing /salesmanager/add-order');
  renderAddOrderForm(req, res);
});
router.post('/add-order', (req, res) => {
  console.log('[Route] Posting to /salesmanager/add-order');
  addorder_post(req, res);
});

const { getProductsByCompany } = require("../controllers/salesmanager/products");
router.get("/products-by-company/:companyId", (req, res) => {
  console.log('[Route] Accessing /salesmanager/products-by-company/:companyId');
  getProductsByCompany(req, res);
});

const { salary_display, getSalaryData } = require("../controllers/salesmanager/salary");
router.get("/salaries", (req, res) => {
  console.log('[Route] Accessing /salesmanager/salaries');
  salary_display(req, res);
});
router.get("/salaries/data", (req, res) => {
  console.log('[Route] Accessing /salesmanager/salaries/data');
  getSalaryData(req, res);
});

const { salesmanager_messages_display, render_compose_message_form, compose_message, view_sent_messages, view_message } = require("../controllers/salesmanager/salesmanager_messages_display");
router.get("/messages", salesmanager_messages_display);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);
router.get("/messages/sent", view_sent_messages);

const { employeeDisplay, getSelfData, getEmployeesData, employeeDetail, getEmployeeById, fireEmployee, updateSalesmanSalary, editSalesManager, updateSalesManager, renderAddEmployeeForm, addEmployee } = require("../controllers/salesmanager/salesmanager_employee");
router.get("/employees", (req, res) => {
  console.log('[Route] Accessing /salesmanager/employees');
  employeeDisplay(req, res);
});
router.get("/self/data", (req, res) => {
  console.log('[Route] Accessing /salesmanager/self/data');
  getSelfData(req, res);
});
router.get("/employees/data", (req, res) => {
  console.log('[Route] Accessing /salesmanager/employees/data');
  getEmployeesData(req, res);
});
router.get("/employees/data/:e_id", (req, res) => {
  console.log('[Route] Accessing /salesmanager/employees/data/:e_id');
  getEmployeeById(req, res);
});
router.get("/employee-details/:e_id", (req, res) => {
  console.log('[Route] Accessing /salesmanager/employee-details/:e_id');
  employeeDetail(req, res);
});
router.post("/employee/fire/:e_id", (req, res) => {
  console.log('[Route] Posting to /salesmanager/employee/fire/:e_id');
  fireEmployee(req, res);
});
router.post("/employee/update-salary/:e_id", (req, res) => {
  console.log('[Route] Posting to /salesmanager/employee/update-salary/:e_id');
  updateSalesmanSalary(req, res);
});
router.get("/edit-salesmanager", (req, res) => {
  console.log('[Route] Accessing /salesmanager/edit-salesmanager');
  editSalesManager(req, res);
});
router.post("/update-salesmanager", (req, res) => {
  console.log('[Route] Posting to /salesmanager/update-salesmanager');
  updateSalesManager(req, res);
});
router.get("/add-employee", (req, res) => {
  console.log('[Route] Accessing /salesmanager/add-employee');
  renderAddEmployeeForm(req, res);
});
router.post("/add-employee", (req, res) => {
  console.log('[Route] Posting to /salesmanager/add-employee');
  addEmployee(req, res);
});

module.exports = router;