const Sale = require("../../models/sale");
const Product = require("../../models/products");
const Complaint = require("../../models/complaint");

async function complaint_data(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;

    // Fetch all complaints for the customer
    const complaints = await Complaint.find({ phone_number }).lean();

    // Fetch sale and product details for each complaint
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
          status: complaint.status
        };
      })
    );

    res.render("customer/complaints_customer/complaints", {
      data: mappedComplaints,
      activePage: "customer",
      activeRoute: "complaints"
    });
  } catch (error) {
    console.error("[complaint_data] Error rendering data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function complaint_datadetails(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const saleid = req.params.saleid;

    const sale = await Sale.findOne({ sales_id: saleid, phone_number })
      .select("-purchased_price -profit_or_loss")
      .lean();

    if (!sale) {
      return res.status(404).render("customer/complaints_customer/complaintdetails", {
        sale: null,
        activePage: "customer",
        activeRoute: "complaints"
      });
    }

    const product = await Product.findOne({ prod_id: sale.product_id }).lean();
    const saleData = {
      sale_id: sale.sales_id,
      prod_id: sale.product_id,
      Prod_name: product ? product.Prod_name : "Unknown Product",
      Com_id: product ? product.Com_id : "N/A",
      Model_no: product ? product.Model_no : "N/A",
      com_name: product ? product.com_name : "Unknown Company",
      warrantyperiod: product ? product.warrantyperiod : "N/A",
      purchasedate: sale.sales_date.toISOString().split("T")[0],
      prod_description: product ? product.prod_description : "N/A",
      installation: sale.installation,
      price: sale.sold_price
    };

    res.render("customer/complaints_customer/complaintdetails", {
      sale: saleData,
      activePage: "customer",
      activeRoute: "complaints"
    });
  } catch (error) {
    console.error("[complaint_datadetails] Error rendering data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function complaint_add(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;

    // Fetch all sales for the customer
    const sales = await Sale.find({ phone_number })
      .select("-purchased_price -profit_or_loss")
      .lean();

    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        return {
          sale_id: sale.sales_id,
          prod_id: sale.product_id,
          Prod_name: product ? product.Prod_name : "Unknown Product",
          com_name: product ? product.com_name : "Unknown Company",
          purchasedate: sale.sales_date.toISOString().split("T")[0]
        };
      })
    );

    res.render("customer/complaints_customer/add_complaint", {
      sales: mappedSales,
      activePage: "customer",
      activeRoute: "complaints"
    });
  } catch (error) {
    console.error("[complaint_add] Error rendering add complaint page:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function complaint_submit(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const { sale_id, complaint_info } = req.body;

    console.log("[complaint_submit] Received data:", { sale_id, complaint_info, phone_number });

    // Validate input
    if (!sale_id || !complaint_info) {
      console.log("[complaint_submit] Validation failed: Missing sale_id or complaint_info");
      return res.status(400).json({ success: false, message: "Sale ID and complaint description are required" });
    }

    // Verify the sale belongs to the customer
    const sale = await Sale.findOne({ sales_id: sale_id, phone_number }).lean();
    if (!sale) {
      console.log("[complaint_submit] Sale not found or unauthorized:", { sale_id, phone_number });
      return res.status(404).json({ success: false, message: "Sale not found or you are not authorized to file a complaint for this sale" });
    }

    // Generate complaint_id by counting existing complaints
    const count = await Complaint.countDocuments() + 1;
    const complaint_id = `C${String(count).padStart(3, '0')}`;

    console.log("[complaint_submit] Generated complaint_id:", complaint_id);

    // Create new complaint
    const newComplaint = new Complaint({
      complaint_id,
      sale_id,
      product_id: sale.product_id,
      company_id: sale.company_id,
      complaint_info,
      phone_number,
      status: "Open"
    });

    await newComplaint.save();
    console.log("[complaint_submit] Complaint saved successfully:", newComplaint);

    res.json({ success: true, redirect: "/customer/complaints" });
  } catch (error) {
    console.error("[complaint_submit] Error submitting complaint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  complaint_data,
  complaint_datadetails,
  complaint_add,
  complaint_submit
};