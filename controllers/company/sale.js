const Sale = require("../../models/sale");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");

// Function to get all sales for the logged-in company
async function sales_display(req, res) {
  try {
    const user = res.locals.user;
    console.log('[sales_display] Logged-in company user:', user);

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[sales_display] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
    }

    // Fetch sales for this company
    const sales = await Sale.find({ company_id: company.c_id }).lean();
    console.log('[sales_display] Raw sales data:', sales);

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
          ...sale,
          branch_name: branchName,
          product_name: productName,
          model_number: modelNumber,
          company_name: company.cname,
          amount: sale.amount ?? 0, // Ensure amount is defined
          sales_date: sale.sales_date ? new Date(sale.sales_date).toISOString().split('T')[0] : "N/A", // Format date
        };
      })
    );

    console.log('[sales_display] Mapped sales data:', mappedSales);

    res.render("company/sales_feature/sales", {
      salers: mappedSales,
      activePage: 'company',
      activeRoute: 'sales',
    });
  } catch (error) {
    console.error("[sales_display] Error rendering sales:", error);
    res.status(500).send("Internal server error");
  }
}

// Function to get details of a specific sale
async function salesdetaildisplay(req, res) {
  try {
    const user = res.locals.user;
    const id = req.params.salesid;

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[salesdetaildisplay] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
    }

    // Fetch the sale by sales_id and ensure it belongs to this company
    const sale = await Sale.findOne({ sales_id: id, company_id: company.c_id }).lean();
    if (!sale) {
      console.log('[salesdetaildisplay] Sale not found for sales_id:', id);
      return res.status(404).send("Sale not found");
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

    // Prepare the sale object for the template
    const saleDetails = {
      ...sale,
      branch_name: branchName,
      product_name: productName,
      model_number: modelNumber,
      company_name: company.cname,
      amount: sale.amount ?? 0,
      profit_or_loss: sale.profit_or_loss ?? 0,
      sales_date: sale.sales_date ? new Date(sale.sales_date).toISOString().split('T')[0] : "N/A",
      purchased_price: sale.purchased_price ?? 0,
      sold_price: sale.sold_price ?? 0,
      quantity: sale.quantity ?? 0,
    };

    console.log('[salesdetaildisplay] Sale details:', saleDetails);

    res.render("company/sales_feature/salesdetails", {
      sale: saleDetails,
      activePage: 'company',
      activeRoute: 'sales',
    });
  } catch (error) {
    console.error("[salesdetaildisplay] Error rendering sale details:", error);
    res.status(500).send("Internal server error");
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
      return res.status(400).send("Invalid installation status");
    }

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[updateInstallationStatus] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
    }

    // Update the sale's installation status
    const sale = await Sale.findOneAndUpdate(
      { sales_id: salesId, company_id: company.c_id },
      { installation_status: installation_status || null },
      { new: true }
    );

    if (!sale) {
      console.log('[updateInstallationStatus] Sale not found for sales_id:', salesId);
      return res.status(404).send("Sale not found");
    }

    console.log('[updateInstallationStatus] Updated sale:', sale);

    // Redirect back to the sale details page
    res.redirect(`/company/sales/${salesId}`);
  } catch (error) {
    console.error("[updateInstallationStatus] Error updating installation status:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { sales_display, salesdetaildisplay, updateInstallationStatus };