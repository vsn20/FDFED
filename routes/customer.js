const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => res.redirect("/customer/previouspurchases"));

// Previous purchases
const { previous_data_display, total_previous_data_display } = require("../controllers/customer/previous_data");
router.get("/previouspurchases", previous_data_display);
router.get("/previouspurchases/totaldetails/:saleid", total_previous_data_display);

// Complaints
const { complaint_data, complaint_datadetails, complaint_add, complaint_submit } = require("../controllers/customer/complaints");
router.get("/complaints", complaint_data);
router.get("/complaints/totaldetails/:saleid", complaint_datadetails);
router.get("/complaints/add", complaint_add);
router.post("/complaints/submit", complaint_submit);

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