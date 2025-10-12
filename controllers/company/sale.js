const Sale = require("../../models/sale");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");

// Function to render the empty sales page
async function sales_display(req, res) {
  try {
    res.render("company/sales_feature/sales", {
      activePage: 'company',
      activeRoute: 'sales',
      successMessage: req.query.success ? 'Sales data loaded successfully!' : undefined
    });
  } catch (error) {
    console.error("[sales_display] Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Function to get all sales data for the logged-in company
async function get_sales_data(req, res) {
  try {
    const user = res.locals.user;
    console.log('[get_sales_data] Logged-in company user:', user);

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[get_sales_data] Company not found for c_id:', user.c_id);
      return res.status(404).json({ error: "Company not found" });
    }

    // Fetch sales for this company
    const sales = await Sale.find({ company_id: company.c_id }).lean();
    console.log('[get_sales_data] Raw sales data:', sales);

    // Map sales data to include additional details
    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        // Fetch product details
        let productName = "Unknown Product";
        let modelNumber = "N/A";
        if (typeof sale.product_id === "string") {
          const product = await Product.findOne({ prod_id: sale.product_id }).lean();
          if (product) {
            productName = product.Prod_name;
            modelNumber = product.Model_no;
          }
        }

        // Fetch branch details
        let branchName = "Unknown Branch";
        if (typeof sale.branch_id === "string") {
          const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
          if (branch) {
            branchName = branch.b_name;
          }
        }

        return {
          sales_id: sale.sales_id,
          branch_name: branchName,
          product_name: productName,
          model_number: modelNumber,
          company_name: company.cname,
          amount: sale.amount ?? 0,
          sales_date: sale.sales_date ? new Date(sale.sales_date).toISOString().split('T')[0] : "N/A"
        };
      })
    );

    console.log('[get_sales_data] Mapped sales data:', mappedSales);

    res.json({
      sales: mappedSales,
      company_name: company.cname
    });
  } catch (error) {
    console.error("[get_sales_data] Error fetching sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to render the empty sale details page
async function salesdetaildisplay(req, res) {
  try {
    res.render("company/sales_feature/salesdetails", {
      activePage: 'company',
      activeRoute: 'sales',
      successMessage: req.query.success ? 'Sale details loaded successfully!' : undefined
    });
  } catch (error) {
    console.error("[salesdetaildisplay] Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Function to get specific sale data
async function get_sale_details(req, res) {
  try {
    const user = res.locals.user;
    const id = req.params.salesid;

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[get_sale_details] Company not found for c_id:', user.c_id);
      return res.status(404).json({ error: "Company not found" });
    }

    // Fetch the sale by sales_id and ensure it belongs to this company
    const sale = await Sale.findOne({ sales_id: id, company_id: company.c_id }).lean();
    if (!sale) {
      console.log('[get_sale_details] Sale not found for sales_id:', id);
      return res.status(404).json({ error: "Sale not found" });
    }

    // Fetch product details
    let productName = "Unknown Product";
    let modelNumber = "N/A";
    if (typeof sale.product_id === "string") {
      const product = await Product.findOne({ prod_id: sale.product_id }).lean();
      if (product) {
        productName = product.Prod_name;
        modelNumber = product.Model_no;
      }
    }

    // Fetch branch details
    let branchName = "Unknown Branch";
    if (typeof sale.branch_id === "string") {
      const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
      if (branch) {
        branchName = branch.b_name;
      }
    }

    // Prepare the sale object for the response
    const saleDetails = {
      sales_id: sale.sales_id,
      unique_code: sale.unique_code,
      sales_date: sale.sales_date ? new Date(sale.sales_date).toISOString().split('T')[0] : "N/A",
      branch_name: branchName,
      product_name: productName,
      model_number: modelNumber,
      company_name: company.cname,
      customer_name: sale.customer_name,
      phone_number: sale.phone_number,
      address: sale.address || 'N/A',
      installation: sale.installation,
      installationType: sale.installationType || 'N/A',
      installationcharge: sale.installationcharge || 'N/A',
      installation_status: sale.installation_status || '',
      review: sale.review || 'N/A',
      rating: sale.rating || 'N/A',
      amount: sale.amount ?? 0,
      profit_or_loss: sale.profit_or_loss ?? 0,
      purchased_price: sale.purchased_price ?? 0,
      sold_price: sale.sold_price ?? 0,
      quantity: sale.quantity ?? 0
    };

    console.log('[get_sale_details] Sale details:', saleDetails);

    res.json({ sale: saleDetails });
  } catch (error) {
    console.error("[get_sale_details] Error fetching sale details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to update installation status
async function updateInstallationStatus(req, res) {
  try {
    const user = res.locals.user;
    const salesId = req.params.salesid;
    const { installation_status } = req.body;

    // Validate installation status
    const validStatuses = ['Pending', 'Completed', null];
    if (!validStatuses.includes(installation_status || null)) {
      console.log('[updateInstallationStatus] Invalid installation status:', installation_status);
      return res.status(400).json({ error: "Invalid installation status" });
    }

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[updateInstallationStatus] Company not found for c_id:', user.c_id);
      return res.status(404).json({ error: "Company not found" });
    }

    // Update the sale's installation status
    const sale = await Sale.findOneAndUpdate(
      { sales_id: salesId, company_id: company.c_id },
      { installation_status: installation_status || null },
      { new: true }
    );

    if (!sale) {
      console.log('[updateInstallationStatus] Sale not found for sales_id:', salesId);
      return res.status(404).json({ error: "Sale not found" });
    }

    console.log('[updateInstallationStatus] Updated sale:', sale);

    res.json({ success: true, message: "Installation status updated successfully" });
  } catch (error) {
    console.error("[updateInstallationStatus] Error updating installation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

console.log('sale.js loaded');
module.exports = { sales_display, get_sales_data, salesdetaildisplay, get_sale_details, updateInstallationStatus };