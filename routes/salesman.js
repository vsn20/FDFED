const express = require("express");
const router = express.Router();
const Company = require("../models/company");
const { getProductsByCompany } = require("../controllers/salesmanager/products");
const { getSalesmanDashboardData } = require("../controllers/salesman/dashboard");

// Salesman home
router.get("/", getSalesmanDashboardData);

router.get("/home", getSalesmanDashboardData);

// Salesman inventory
const { inventory_display, get_inventory_data } = require("../controllers/salesman/inventory_display");
router.get("/stocks", inventory_display);
router.get("/stocks/data", get_inventory_data);

// Salesman salary
const { salary_display, get_salary_data } = require("../controllers/salesman/salary");
router.get("/salaries", salary_display);
router.get("/salaries/data", get_salary_data);

// Salesman profile
const { getSalesmanDetails, updateSalesmanDetails } = require("../controllers/salesman/profile");
router.get("/employees", getSalesmanDetails);
router.post("/employees/update", updateSalesmanDetails);

// Salesman sales
const { sales_display, salesdetaildisplay, addSale, renderAddSaleForm } = require("../controllers/salesman/sales");
router.get("/sales", sales_display);
router.get("/sales/:sales_id", salesdetaildisplay);
router.get("/add-sale", renderAddSaleForm);
router.post("/add-sale", addSale);
router.get("/products-by-company/:companyId", getProductsByCompany);

// Salesman messages
const { salesman_messages_display, render_compose_message_form, compose_message, view_message, view_sent_messages } = require("../controllers/salesman/salesman_messages_display");
router.get("/messages", salesman_messages_display);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);
router.get("/messages/sent", view_sent_messages);

module.exports = router;