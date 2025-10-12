const express = require("express");
const router = express.Router();
const { addemployee } = require("../controllers/owner/addemployee");
const { 
  loademployeedata, 
  getEmployeesData,
  getEmployeeById,
  getEmployeeDetails, 
  getEditEmployee, 
  updateEmployee, 
  syncEmployeeBranchData 
} = require("../controllers/owner/load_employee_data");
const Branch = require("../models/branches");
const Employee = require("../models/employees");
const { 
  products_display, 
  rejected_products_display, 
  new_products_display, 
  render_product_details, 
  render_add_product_form, 
  render_edit_product_form, 
  update_product,
  getProductsData,
  getRejectedProductsData,
  getNewProductsData,
  getProductData
} = require("../controllers/admin_products_display");
const { getAdminDashboardData } = require("../controllers/owner/dashboard");

router.get("/employees", loademployeedata);
router.get("/employees/data", getEmployeesData);
router.get("/employee/data/:e_id", getEmployeeById);
router.get("/employee/:e_id", getEmployeeDetails);
router.get("/employee/edit/:e_id", getEditEmployee);
router.post("/employee/update/:e_id", updateEmployee);
router.get("/sync-employee-branch-data", syncEmployeeBranchData);
router.get("/addemployee", (req, res) => {
  // Render empty page; data loaded via API
  res.render("owner/employee_feature/addemployee", {
    activePage: "employee",
    activeRoute: "employees",
  });
});
router.post("/addemployee", addemployee);

router.get("/products", products_display);
router.get("/products/data", getProductsData);
router.get("/products/rejected", rejected_products_display);
router.get("/products/rejected/data", getRejectedProductsData);
router.get("/products/new", new_products_display);
router.get("/products/new/data", getNewProductsData);
router.get("/products/details/:prod_id", render_product_details);
router.get("/products/data/:prod_id", getProductData);
router.get("/products/add", render_add_product_form);
router.get("/products/edit/:prod_id", render_edit_product_form);
router.post("/products/edit/:prod_id", update_product);
router.get("/products/:prod_id", render_product_details);

router.get("/home", getAdminDashboardData);

const { 
  company_display, 
  getCompaniesData, 
  getCompanyById,
  render_add_company_form, 
  add_company, 
  render_edit_company_form, 
  update_company 
} = require("../controllers/company_display");
router.get("/company", company_display);
router.get("/company/data", getCompaniesData);
router.get("/company/data/:cid", getCompanyById);
router.get("/addcompanie", render_add_company_form);
router.post("/company/add", add_company);
router.get("/company/edit/:cid", render_edit_company_form);
router.post("/company/edit/:cid", update_company);

const { 
  branches_display, 
  getBranchesData: getBranchesDataBranch, 
  getBranchById,
  render_add_branch_form, 
  add_branch, 
  render_edit_branch_form, 
  update_branch 
} = require("../controllers/admin_branches_display");
router.get("/branches", branches_display);
router.get("/branches/data", getBranchesDataBranch);
router.get("/branches/data/:bid", getBranchById);
router.get("/branches/add", render_add_branch_form);
router.post("/branches/add", add_branch);
router.get("/branches/edit/:bid", render_edit_branch_form);
router.post("/branches/edit/:bid", update_branch);

const { customers_display } = require("../controllers/admin_customers_display");
router.get("/customers", customers_display);

const { inventory_display, getInventoryData } = require("../controllers/inventory_display");
router.get("/stocks", inventory_display);
router.get("/stocks/data", getInventoryData);

const { 
  sales_display, 
  salesdetaildisplay,
  getSalesData,
  getSaleDetail 
} = require("../controllers/sales_display");
router.get("/sales", sales_display);
router.get("/sales/data", getSalesData);
router.get("/sales/data/:sales_id", getSaleDetail);
router.get("/sales/:sales_id", salesdetaildisplay);

const { profits_display, profitByMonth } = require("../controllers/profits_display");
router.get("/profits", profits_display);
router.get("/profit-by-month", profitByMonth);

const { salary_display, getSalaryData } = require("../controllers/salaries_display");
router.get("/salaries", salary_display);
router.get("/salaries/data", getSalaryData);

const { orders_display, getOrdersData } = require("../controllers/admin_orders_display");
router.get("/orders", orders_display);
router.get("/orders/data", getOrdersData);

const { admin_messages_display, admin_sent_messages, render_compose_message_form, compose_message, view_message } = require("../controllers/admin_messages_display");
router.get("/messages", admin_messages_display);
router.get("/sent-messages", admin_sent_messages);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);

module.exports = router;