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
  ordersedit_display,
  pendingorders_display,
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
  get_sales_data = null,  // Default to null if not exported
  get_sale_details = null  // Default to null if not exported
} = saleControllers;
const { displayComplaints, updateComplaintStatus } = require("../controllers/company/complaint");
const { company_messages_display, render_compose_message_form, compose_message, view_message, view_sent_messages } = require("../controllers/company/company_messages_display");
const { getDashboardData } = require("../controllers/company/dashboard");

router.get("/home", getDashboardData);
router.get("/products", companyproducts_display);
router.get("/products/details/:prod_id", getProductById);
router.get("/products/add", renderAddProductForm);
router.post("/products/add", addProduct);
router.post("/products/update-stockavailability/:prod_id", updateStockAvailability);
router.get("/stocks", getinventory);
router.get("/stocks/:orderid", ordersedit_display);
router.get('/orders', orders_display);
router.get('/orders/edit/:oid', ordersedit_display);
router.get('/orders/pending', pendingorders_display);
router.get('/orders/pending/edit/:oid', pendingedit_display);
router.post('/orders/update/:oid', updateOrderStatus);
router.post('/orders/update-delivery', updateDeliveryDate);
router.get("/messages", company_messages_display);
router.get("/messages/compose", render_compose_message_form);
router.post("/messages/compose", compose_message);
router.get("/messages/view", view_message);
router.get("/messages/sent", view_sent_messages);
router.get("/sales", sales_display);

// Guard the routes that might use undefined handlers
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
router.get("/complaints", displayComplaints);
router.post("/complaints/update-status/:complaint_id", updateComplaintStatus);

module.exports = router;