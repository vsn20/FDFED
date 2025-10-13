const express = require("express");
const router = express.Router();
const Company = require("../models/company");
const { getProductsByCompany } = require("../controllers/salesmanager/products");
const { getSalesmanDashboardData } = require("../controllers/salesman/dashboard");

// Salesman home
router.get("/", (req, res) => {
  console.log('[Route] Accessing /salesman/');
  res.render("salesman/home", {
    activePage: "employee",
    activeRoute: ""
  });
});

router.get("/home", (req, res) => {
  console.log('[Route] Accessing /salesman/home');
  res.render("salesman/home", {
    activePage: "employee",
    activeRoute: ""
  });
});

// API endpoint to fetch Salesman dashboard data
router.get("/home/data", getSalesmanDashboardData);

// Salesman inventory
const { inventory_display, get_inventory_data } = require("../controllers/salesman/inventory_display");
router.get("/stocks", inventory_display);
router.get("/stocks/data", get_inventory_data);

// Salesman salary
const { salary_display, get_salary_data } = require("../controllers/salesman/salary");
router.get("/salaries", salary_display);
router.get("/salaries/data", get_salary_data);

// Salesman profile
const { getSalesmanDetails, get_salesman_data, updateSalesmanDetails } = require("../controllers/salesman/profile");
router.get("/employees", getSalesmanDetails);
router.get("/employees/data", get_salesman_data);
router.post("/employees/update", updateSalesmanDetails);

// Salesman sales
const { sales_display, get_sales_data, salesdetaildisplay, addSale, renderAddSaleForm, get_companies, check_unique_code, check_inventory, get_sale_details, updateInstallationStatus } = require("../controllers/salesman/sales");
router.get("/sales", sales_display);
router.get("/sales/data", get_sales_data);
router.get("/sales/:sales_id", salesdetaildisplay);
router.get("/add-sale", renderAddSaleForm);
router.post("/add-sale", addSale);
router.get("/products-by-company/:companyId", getProductsByCompany);
router.get("/companies", get_companies);
router.post("/check-unique-code", check_unique_code);
router.post("/check-inventory", check_inventory);
router.get("/sales/details/:sales_id", get_sale_details);
router.post("/sales/update-installation", updateInstallationStatus);

// Salesman messages
const { salesman_messages_display, render_compose_message_form, compose_message, view_message, view_sent_messages } = require("../controllers/salesman/salesman_messages_display");
router.get("/messages", salesman_messages_display);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);
router.get("/messages/sent", view_sent_messages);

module.exports = router;