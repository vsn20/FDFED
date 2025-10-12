const Complaint = require("../../models/complaint");
const Sale = require("../../models/sale");
const Product = require("../../models/products");

async function complaints_display(req, res) {
  try {
    res.render("customer/complaints_customer/complaints", {
      activePage: "customer",
      activeRoute: "complaints",
    });
  } catch (error) {
    console.error("[complaints_display] Error rendering complaints page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getComplaintsData(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;

    const complaints = await Complaint.find({ phone_number }).lean();

    const mappedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        const sale = await Sale.findOne({ sales_id: complaint.sale_id }).lean();
        const product = await Product.findOne({ prod_id: complaint.product_id }).lean();

        return {
          complaint_id: complaint.complaint_id,
          sale_id: complaint.sale_id,
          prod_id: complaint.product_id,
          Prod_name: product ? product.Prod_name : "Unknown Product",
          com_name: product ? product.com_name : "Unknown Company",
          purchasedate: sale ? sale.sales_date.toISOString().split("T")[0] : "N/A",
          complaint_info: complaint.complaint_info,
          complaint_date: complaint.complaint_date.toISOString().split("T")[0],
          status: complaint.status,
        };
      })
    );

    res.json(mappedComplaints);
  } catch (error) {
    console.error("[getComplaintsData] Error fetching complaints:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getComplaintById(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const { complaint_id } = req.params;

    const complaint = await Complaint.findOne({ complaint_id, phone_number }).lean();
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const sale = await Sale.findOne({ sales_id: complaint.sale_id }).lean();
    const product = await Product.findOne({ prod_id: complaint.product_id }).lean();

    const complaintData = {
      complaint_id: complaint.complaint_id,
      sale_id: complaint.sale_id,
      prod_id: complaint.product_id,
      Prod_name: product ? product.Prod_name : "Unknown Product",
      com_name: product ? product.com_name : "Unknown Company",
      purchasedate: sale ? sale.sales_date.toISOString().split("T")[0] : "N/A",
      complaint_info: complaint.complaint_info,
      complaint_date: complaint.complaint_date.toISOString().split("T")[0],
      status: complaint.status,
    };

    res.json(complaintData);
  } catch (error) {
    console.error("[getComplaintById] Error fetching complaint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getEligibleSales(req, res) {
  try {
    const user = req.user;
    console.log("[getEligibleSales] req.user:", JSON.stringify(user, null, 2));
    const phone_number = String(user.user_id).replace(/^\+91/, '').trim();
    console.log("[getEligibleSales] Normalized phone_number:", phone_number);

    // Support multiple phone number formats
    const phoneVariations = [phone_number, `+91${phone_number}`, `+91 ${phone_number}`];
    console.log("[getEligibleSales] Phone variations:", phoneVariations);

    // Log all sales for debugging
    const allSales = await Sale.find({ phone_number: { $in: phoneVariations } }).lean();
    console.log("[getEligibleSales] All sales for user:", JSON.stringify(allSales, null, 2));

    // Log unique installation_status values
    const statuses = await Sale.distinct("installation_status", { phone_number: { $in: phoneVariations } });
    console.log("[getEligibleSales] Unique installation_status values:", statuses);

    // Find eligible sales
    const sales = await Sale.find({
      phone_number: { $in: phoneVariations },
      installation_status: { $regex: "^Completed$", $options: "i" },
    }).lean();
    console.log("[getEligibleSales] Sales with installation_status 'Completed':", JSON.stringify(sales, null, 2));

    const eligibleSales = await Promise.all(
      sales.map(async (sale) => {
        const existingComplaint = await Complaint.findOne({ sale_id: sale.sales_id }).lean();
        console.log(`[getEligibleSales] Sale ${sale.sales_id}, has complaint:`, !!existingComplaint);
        if (existingComplaint) return null;

        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        console.log(`[getEligibleSales] Product for prod_id ${sale.product_id}:`, JSON.stringify(product, null, 2));
        return {
          sales_id: sale.sales_id,
          Prod_name: product ? product.Prod_name : "Unknown Product",
          com_name: product ? product.com_name : "Unknown Company",
          sales_date: sale.sales_date ? sale.sales_date.toISOString().split("T")[0] : "N/A",
        };
      })
    );

    const filteredSales = eligibleSales.filter(sale => sale !== null);
    console.log("[getEligibleSales] Eligible sales:", JSON.stringify(filteredSales, null, 2));
    if (filteredSales.length === 0) {
      console.log("[getEligibleSales] No eligible sales found. Possible reasons: No sales with installation_status 'Completed' or all have complaints.");
    }
    res.json(filteredSales);
  } catch (error) {
    console.error("[getEligibleSales] Error fetching eligible sales:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}

async function render_add_complaint_form(req, res) {
  try {
    res.render("customer/complaints_customer/add_complaint", {
      activePage: "customer",
      activeRoute: "complaints",
    });
  } catch (error) {
    console.error("[render_add_complaint_form] Error rendering add complaint form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function add_complaint(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const { sale_id, complaint_info } = req.body;

    if (!sale_id || !complaint_info) {
      return res.status(400).json({ success: false, message: "Sale ID and complaint description are required" });
    }

    const sale = await Sale.findOne({ sales_id: sale_id, phone_number }).lean();
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or you are not authorized to file a complaint for this sale" });
    }

    const existingComplaint = await Complaint.findOne({ sale_id }).lean();
    if (existingComplaint) {
      return res.status(400).json({ success: false, message: "A complaint already exists for this sale" });
    }

    const count = await Complaint.countDocuments() + 1;
    const complaint_id = `C${String(count).padStart(3, "0")}`;

    const newComplaint = new Complaint({
      complaint_id,
      sale_id,
      product_id: sale.product_id,
      company_id: sale.company_id,
      complaint_info,
      phone_number,
      status: "Open",
    });

    await newComplaint.save();
    res.json({ success: true, message: "Complaint added successfully!", complaint_id });
  } catch (error) {
    console.error("[add_complaint] Error adding complaint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function render_edit_complaint_form(req, res) {
  try {
    const { complaint_id } = req.params;
    res.render("customer/complaints_customer/edit_complaint", {
      complaint_id,
      activePage: "customer",
      activeRoute: "complaints",
    });
  } catch (error) {
    console.error("[render_edit_complaint_form] Error rendering edit complaint form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function update_complaint(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const { complaint_id } = req.params;
    const { complaint_info } = req.body;

    const complaint = await Complaint.findOneAndUpdate(
      { complaint_id, phone_number, status: "Open" },
      { complaint_info },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found or cannot be updated" });
    }
    res.json({ success: true, message: "Complaint updated successfully!" });
  } catch (error) {
    console.error("[update_complaint] Error updating complaint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  complaints_display,
  getComplaintsData,
  getComplaintById,
  getEligibleSales,
  render_add_complaint_form,
  add_complaint,
  render_edit_complaint_form,
  update_complaint,
};