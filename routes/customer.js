const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => res.redirect("/customer/previouspurchases"));

// Previous purchases
const { previous_data_display, getPreviousPurchasesData, getSaleById, total_previous_data_display } = require("../controllers/customer/previous_data");
router.get("/previouspurchases", previous_data_display);
router.get("/previouspurchases/data", getPreviousPurchasesData);
router.get("/previouspurchases/totaldetails/data/:saleid", getSaleById);
router.get("/previouspurchases/totaldetails/:saleid", total_previous_data_display);

// Complaints
const {
  complaints_display,
  getComplaintsData,
  getComplaintById,
  getEligibleSales,
  render_add_complaint_form,
  add_complaint,
  render_edit_complaint_form,
  update_complaint,
} = require("../controllers/customer/complaints");
router.get("/complaints", complaints_display);
router.get("/complaints/data", getComplaintsData);
router.get("/complaints/totaldetails/:complaint_id", getComplaintById);
router.get("/complaints/eligible-sales", getEligibleSales);
router.get("/complaints/add", render_add_complaint_form);
router.post("/complaints/add", add_complaint);
router.get("/complaints/edit/:complaint_id", render_edit_complaint_form);
router.post("/complaints/edit/:complaint_id", update_complaint);

// Reviews
const { review_display, review_datadetails, review_update } = require("../controllers/customer/reviews");
router.get("/review", review_display);
router.get("/review/totaldetails/:saleid", review_datadetails);
router.post("/reviews", review_update);

// Blogs
const { blogs, view_message } = require("../controllers/customer/blogs");
router.get("/blogs", blogs);
router.get("/blogs/view", view_message);

module.exports = router;