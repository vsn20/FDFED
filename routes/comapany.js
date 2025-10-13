const express = require("express");
const router = express.Router();
const { 
  companyproducts_display,
  getProductById,
  renderAddProductForm,
  addProduct,
  getinventory,
  updateStockAvailability
} = require("../controllers/company/companyproducts_display");
const { 
  orders_display,
  getOrdersData,
  ordersedit_display,
  getOrderById,
  pendingorders_display,
  getPendingOrdersData,
  pendingedit_display,
  updateOrderStatus,
  updateDeliveryDate
} = require("../controllers/company/orders_display");
const saleControllers = require("../controllers/company/sale");
console.log('Imported sale controllers:', saleControllers);
const { 
  sales_display, 
  salesdetaildisplay, 
  updateInstallationStatus,
  get_sales_data = null,
  get_sale_details = null
} = saleControllers;
const { 
  displayComplaints, 
  getComplaintsData, 
  updateComplaintStatus 
} = require("../controllers/company/complaint");
const { 
  company_messages_display, 
  render_compose_message_form, 
  compose_message, 
  view_message, 
  view_sent_messages 
} = require("../controllers/company/company_messages_display");
const { getDashboardData } = require("../controllers/company/dashboard");

// Dashboard
router.get("/home", getDashboardData);

// Products
router.get("/products", companyproducts_display);
router.get("/products/details/:prod_id", getProductById);
router.get("/products/add", renderAddProductForm);
router.post("/products/add", addProduct);
router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);

// Stocks/Inventory
router.get("/stocks", getinventory);
router.get("/stocks/:orderid", ordersedit_display);

// Orders - COMPLETE AND FIXED
router.get('/orders', orders_display);
router.get('/orders/data', getOrdersData);
router.get('/orders/data/:oid', getOrderById);                // FIXED: Changed from /orders/edit/:oid/data
router.get('/orders/edit/:oid', ordersedit_display);
router.get('/orders/pending', pendingorders_display);
router.get('/orders/pending/data', getPendingOrdersData);
router.get('/orders/pending/data/:oid', getOrderById);        // FIXED: Changed from /orders/pending/edit/:oid/data
router.get('/orders/pending/edit/:oid', pendingedit_display);
router.post('/orders/update/:oid', updateOrderStatus);
router.post('/orders/update-delivery', updateDeliveryDate);

// Messages
router.get("/messages", company_messages_display);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);
router.get("/messages/sent", view_sent_messages);

// Sales
router.get("/sales", sales_display);
if (typeof get_sales_data === 'function') {
  router.get("/sales/data", get_sales_data);
} else {
  console.warn('get_sales_data is not available; skipping /sales/data route');
}
router.get("/sales/:salesid", salesdetaildisplay);
if (typeof get_sale_details === 'function') {
  router.get("/sales/details/:salesid", get_sale_details);
} else {
  console.warn('get_sale_details is not available; skipping /sales/details/:salesid route');
}
router.post("/sales/update-installation/:salesid", updateInstallationStatus);

// Complaints
router.get("/complaints", displayComplaints);
router.get("/complaints/data", getComplaintsData);
router.post("/complaints/update-status/:complaint_id", updateComplaintStatus);

module.exports = router;