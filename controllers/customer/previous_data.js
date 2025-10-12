const Sale = require("../../models/sale");
const Product = require("../../models/products");
const Branch = require("../../models/branches");

const previous_data_display = async (req, res) => {
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
      .select("-purchased_price -profit_or_loss") // Exclude sensitive fields
      .lean();

    // Map sales to include product and branch details
    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        // Fetch product details
        const product = await Product.findOne({ prod_id: sale.product_id }).lean();
        const productName = product ? product.Prod_name : "Unknown Product";
        const companyName = product ? product.com_name : "Unknown Company";
        const warrantyPeriod = product ? product.warrantyperiod : "N/A";

        // Fetch branch details
        const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
        const branchName = branch ? branch.b_name : "Unknown Branch";

        return {
          sale_id: sale.sales_id,
          prod_id: sale.product_id,
          Prod_name: productName,
          com_name: companyName,
          purchasedate: sale.sales_date.toISOString().split("T")[0], // Format date
          branch_name: branchName,
          warrantyperiod: warrantyPeriod,
          installation: sale.installation,
          installationType: sale.installationType || "N/A",
          installationcharge: sale.installationcharge || "N/A",
          installation_status: sale.installation_status || "N/A"
        };
      })
    );

    res.render("customer/previousdata_feature/previousdata", {
      data: mappedSales,
      activePage: "customer",
      activeRoute: "previouspurchases"
    });
  } catch (error) {
    console.error("[previous_data_display] Error fetching previous purchases:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const total_previous_data_display = async (req, res) => {
  try {
    const user = req.user;
    const phone_number = user.user_id;
    const saleId = req.params.saleid;

    // Fetch the specific sale, excluding sensitive fields
    const sale = await Sale.findOne({ sales_id: saleId, phone_number })
      .select("-purchased_price -profit_or_loss")
      .lean();

    if (!sale) {
      return res.status(404).render("customer/total_previous_data_display", {
        sale: null,
        activePage: "customer",
        activeRoute: "previouspurchases"
      });
    }

    // Fetch product details
    const product = await Product.findOne({ prod_id: sale.product_id }).lean();
    const productName = product ? product.Prod_name : "Unknown Product";
    const companyId = product ? product.Com_id : "N/A";
    const modelNo = product ? product.Model_no : "N/A";
    const companyName = product ? product.com_name : "Unknown Company";
    const warrantyPeriod = product ? product.warrantyperiod : "N/A";
    const productDescription = product ? product.prod_description : "N/A";

    // Fetch branch details
    const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    // Prepare sale data for rendering
    const saleData = {
      sale_id: sale.sales_id,
      prod_id: sale.product_id,
      Prod_name: productName,
      Com_id: companyId,
      Model_no: modelNo,
      com_name: companyName,
      warrantyperiod: warrantyPeriod,
      purchasedate: sale.sales_date.toISOString().split("T")[0],
      prod_description: productDescription,
      installation: sale.installation,
      installationType: sale.installationType || "N/A",
      installationcharge: sale.installationcharge || "N/A",
      installation_status: sale.installation_status || "N/A",
      price: sale.sold_price,
      quantity: sale.quantity,
      amount: sale.amount,
      customer_name: sale.customer_name,
      phone_number: sale.phone_number,
      address: sale.address || "N/A",
      branch_name: branchName,
      unique_code: sale.unique_code,
      salesman_id: sale.salesman_id,
      company_id: sale.company_id
    };

    res.render("customer/previousdata_feature/total_previous_data_display", {
      sale: saleData,
      activePage: "customer",
      activeRoute: "previouspurchases"
    });
  } catch (error) {
    console.error("[total_previous_data_display] Error fetching sale details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  previous_data_display,
  total_previous_data_display
};