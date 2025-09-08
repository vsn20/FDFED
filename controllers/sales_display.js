const Sale = require("../models/sale");
const Company = require("../models/company");
const Product = require("../models/products");
const Branch = require("../models/branches");
const Employee = require("../models/employees");

async function sales_display(req, res) {
  try {
    const sales = await Sale.find().lean();
    console.log('[sales_display] Raw sales data:', sales);

    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
        let companyName = "Unknown Company";
        if (typeof sale.company_id === "string") {
          const company = await Company.findOne({ c_id: sale.company_id }).lean();
          if (company) {
            companyName = company.cname;
          }
        } else {
          const company = await Company.findById(sale.company_id).lean();
          if (company) {
            companyName = company.cname;
          }
        }

        let productName = "Unknown Product";
        let modelNumber = "N/A";
        if (typeof sale.product_id === "string") {
          const product = await Product.findOne({ prod_id: sale.product_id }).lean();
          if (product) {
            productName = product.Prod_name;
            modelNumber = product.Model_no;
          }
        } else {
          const product = await Product.findById(sale.product_id).lean();
          if (product) {
            productName = product.Prod_name;
            modelNumber = product.Model_no;
          }
        }

        let branchName = "Unknown Branch";
        if (typeof sale.branch_id === "string") {
          const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
          if (branch) {
            branchName = branch.b_name;
          }
        } else {
          const branch = await Branch.findById(sale.branch_id).lean();
          if (branch) {
            branchName = branch.b_name;
          }
        }

        return {
          ...sale,
          branch_name: branchName,
          company_name: companyName,
          product_name: productName,
          model_number: modelNumber,
          amount: sale.amount ?? 0, // Ensure amount is defined, default to 0
          profit_or_loss: sale.profit_or_loss ?? 0, // Ensure profit_or_loss is defined
          sales_date: sale.sales_date || new Date(), // Ensure sales_date is defined
        };
      })
    );

    console.log('[sales_display] Mapped sales data:', mappedSales);

    res.render("owner/salesfeatures/sales", {
      salers: mappedSales,
      activePage: 'employee',
      activeRoute: 'sales',
    });
  } catch (error) {
    console.error("[sales_display] Error rendering sales:", error);
    res.status(500).send("Internal server error");
  }
}

async function salesdetaildisplay(req, res) {
  try {
    const id = req.params.sales_id;
    const sale = await Sale.findOne({ sales_id: id }).lean();

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    let companyName = "Unknown Company";
    if (typeof sale.company_id === "string") {
      const company = await Company.findOne({ c_id: sale.company_id }).lean();
      if (company) {
        companyName = company.cname;
      }
    } else {
      const company = await Company.findById(sale.company_id).lean();
      if (company) {
        companyName = company.cname;
      }
    }

    let productName = "Unknown Product";
    let modelNumber = "N/A";
    if (typeof sale.product_id === "string") {
      const product = await Product.findOne({ prod_id: sale.product_id }).lean();
      if (product) {
        productName = product.Prod_name;
        modelNumber = product.Model_no;
      }
    } else {
      const product = await Product.findById(sale.product_id).lean();
      if (product) {
        productName = product.Prod_name;
        modelNumber = product.Model_no;
      }
    }

    let branchName = "Unknown Branch";
    if (typeof sale.branch_id === "string") {
      const branch = await Branch.findOne({ bid: sale.branch_id }).lean();
      if (branch) {
        branchName = branch.b_name;
      }
    } else {
      const branch = await Branch.findById(sale.branch_id).lean();
      if (branch) {
        branchName = branch.b_name;
      }
    }

    let salesmanName = "Unknown Salesman";
    if (typeof sale.salesman_id === "string") {
      const salesman = await Employee.findOne({ e_id: sale.salesman_id }).lean();
      if (salesman) {
        salesmanName = `${salesman.f_name} ${salesman.last_name}`;
      }
    } else {
      const salesman = await Employee.findById(sale.salesman_id).lean();
      if (salesman) {
        salesmanName = `${salesman.f_name} ${salesman.last_name}`;
      }
    }

    res.render("owner/salesfeatures/saleDetails", {
      sale: {
        ...sale,
        branch_name: branchName,
        company_name: companyName,
        product_name: productName,
        model_number: modelNumber,
        salesman_name: salesmanName,
        amount: sale.amount ?? 0, // Ensure amount is defined
        profit_or_loss: sale.profit_or_loss ?? 0, // Ensure profit_or_loss is defined
        sales_date: sale.sales_date || new Date(), // Ensure sales_date is defined
      },
      activePage: 'employee',
      activeRoute: 'sales',
    });
  } catch (error) {
    console.error("[salesdetaildisplay] Error rendering sale details:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { sales_display, salesdetaildisplay };