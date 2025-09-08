const Sale = require("../../models/sale");
const Product = require("../../models/products");

async function review_display(req, res) {
  try {
    const user = req.user; // From JWT middleware
    const phone_number = user.user_id; // e.g., "8125345317"

    // Check if customer has at least one sale record
    const saleCount = await Sale.countDocuments({ phone_number });
    if (saleCount === 0) {
      return res.status(403).json({ success: false, message: "No purchase records found for this customer" });
    }

    // Fetch all sales for the customer, excluding sensitive fields
    const sales = await Sale.find({ phone_number })
      .select("-purchased_price -profit_or_loss")
      .lean();

    // Map sales to include product details and format rating
    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        const productName = product ? product.Prod_name : "Unknown Product";
        const companyName = product ? product.com_name : "Unknown Company";

        // Format rating as stars or "None"
        let ratingDisplay = "None";
        if (sale.rating !== null) {
          ratingDisplay = "★".repeat(sale.rating) + "☆".repeat(5 - sale.rating);
        }

        return {
          sale_id: sale.sales_id,
          prod_id: sale.product_id,
          Prod_name: productName,
          com_name: companyName,
          purchasedate: sale.sales_date.toISOString().split("T")[0],
          rating: ratingDisplay
        };
      })
    );

    res.render("customer/review_feature/review", {
      data: mappedSales,
      activePage: "customer",
      activeRoute: "review"
    });
  } catch (error) {
    console.error("[review_display] Error rendering data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function review_datadetails(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const saleid = req.params.saleid;

    // Fetch the specific sale, excluding sensitive fields
    const sale = await Sale.findOne({ sales_id: saleid, phone_number })
      .select("-purchased_price -profit_or_loss")
      .lean();

    if (!sale) {
      return res.status(404).render("customer/review_feature/reviewdetails", {
        sale: null,
        activePage: "customer",
        activeRoute: "review"
      });
    }

    // Fetch product details
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
      price: sale.sold_price,
      rating: sale.rating || null,
      review: sale.review || ""
    };

    res.render("customer/review_feature/reviewdetails", {
      sale: saleData,
      activePage: "customer",
      activeRoute: "review"
    });
  } catch (error) {
    console.error("[review_datadetails] Error rendering data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function review_update(req, res) {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const { sale_id, rating, review } = req.body;

    // Validate input
    if (!sale_id || !rating || !review) {
      return res.status(400).json({ success: false, message: "Sale ID, rating, and review are required" });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Find and update the sale
    const sale = await Sale.findOneAndUpdate(
      { sales_id: sale_id, phone_number },
      { rating: ratingNum, review },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found or you are not authorized to update this review" });
    }

    res.json({ success: true, redirect: "/customer/review" });
  } catch (error) {
    console.error("[review_update] Error updating review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  review_display,
  review_datadetails,
  review_update
};