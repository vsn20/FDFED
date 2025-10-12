const mongoose = require("mongoose");
const Sale = require("../../models/sale");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory");

async function sales_display(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).send("Salesman not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    res.render("salesman/sales_features/sales", {
      branchName: branchName,
      activePage: 'employee',
      activeRoute: 'sales'
    });
  } catch (error) {
    console.error("Error rendering sales:", error);
    res.status(500).send("Internal server error");
  }
}

async function get_sales_data(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).json({ error: "Salesman not found" });
    }

    const sales = await Sale.find({ salesman_id: employee.e_id }).lean();

    const realsales = await Promise.all(
      sales.map(async (sale) => {
        let companyName = "Unknown Company";
        let productName = "Unknown Product";
        let modelNumber = "N/A";

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

        return {
          sales_id: sale.sales_id,
          company_name: companyName,
          product_name: productName,
          model_number: modelNumber,
          total_amount: sale.amount,
          profit_or_loss: sale.profit_or_loss,
          saledate: sale.sales_date
        };
      })
    );

    res.json(realsales);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function salesdetaildisplay(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).send("Salesman not found");
    }

    const id = req.params.sales_id;
    const sale = await Sale.findOne({ sales_id: id, salesman_id: employee.e_id }).lean();

    if (!sale) {
      return res.status(404).send("Sale not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    let companyName = "Unknown Company";
    let productName = "Unknown Product";
    let modelNumber = "N/A";

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

    res.render("salesman/sales_features/sales_details", {
      sale: {
        ...sale,
        company_name: companyName,
        product_name: productName,
        model_number: modelNumber,
        salesman_name: `${employee.f_name} ${employee.last_name}`,
        branch_name: branchName,
        total_amount: sale.amount,
        saledate: sale.sales_date,
        price: sale.sold_price
      },
      activePage: 'employee',
      activeRoute: 'sales',
      showForm: req.query.add === 'true'
    });
  } catch (error) {
    console.error("Error rendering sales details:", error);
    res.status(500).send("Internal server error");
  }
}

async function renderAddSaleForm(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).send("Salesman not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    res.render("salesman/sales_features/addsale", {
      branchName: branchName,
      activePage: 'employee',
      activeRoute: 'sales'
    });
  } catch (error) {
    console.error("Error rendering add sale form:", error);
    res.status(500).send("Internal server error");
  }
}

async function addSale(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Salesman not found" });
    }

    const {
      customer_name,
      sales_date,
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      phone_number,
      address
    } = req.body;

    // Validate unique_code
    const existingSale = await Sale.findOne({ unique_code }).session(session);
    if (existingSale) {
      await session.abortTransaction();
      return res.status(400).json({ error: `Unique code ${unique_code} already exists. Please use a different code.` });
    }

    // Validate company
    const company = await Company.findOne({ c_id: company_id }).lean();
    if (!company) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Company not found" });
    }

    // Validate product
    const product = await Product.findOne({ prod_id: product_id }).lean();
    if (!product) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Product not found" });
    }

    // Validate inventory
    const inventory = await Inventory.findOne({
      branch_id: employee.bid,
      product_id,
      company_id
    }).session(session);
    if (!inventory || inventory.quantity < parseInt(quantity)) {
      await session.abortTransaction();
      return res.status(400).json({ error: `Insufficient inventory for ${product.Prod_name} (Available: ${inventory ? inventory.quantity : 0})` });
    }

    // Generate sales_id
    const count = await Sale.countDocuments().session(session) + 1;
    const sales_id = `S${String(count).padStart(3, '0')}`;

    // Calculate amount and profit/loss
    const amount = parseFloat(sold_price) * parseInt(quantity);
    const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * parseInt(quantity);

    // Set installation-related fields from product
    const installation = product.installation || 'Not Required';
    const installationType = product.installationType || null;
    const installationcharge = product.installationcharge || null;
    const installation_status = installation === 'Required' ? 'Pending' : null;

    // Create sale
    const newSale = new Sale({
      sales_id,
      branch_id: employee.bid,
      salesman_id: employee.e_id,
      company_id: company.c_id,
      product_id: product.prod_id,
      customer_name,
      sales_date: new Date(sales_date),
      unique_code,
      purchased_price: parseFloat(purchased_price),
      sold_price: parseFloat(sold_price),
      quantity: parseInt(quantity),
      amount,
      profit_or_loss,
      phone_number,
      address,
      installation,
      installationType,
      installationcharge,
      installation_status
    });

    // Update inventory
    inventory.quantity -= parseInt(quantity);
    inventory.updatedAt = new Date();
    await inventory.save({ session });

    await newSale.save({ session });
    await session.commitTransaction();
    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding sale:", error);
    res.status(500).json({ error: `Failed to add sale: ${error.message}` });
  } finally {
    session.endSession();
  }
}

async function get_companies(req, res) {
  try {
    const companies = await Company.find({ active: "active" }).lean();
    res.json(companies.map(company => ({
      c_id: company.c_id,
      cname: company.cname
    })));
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function check_unique_code(req, res) {
  try {
    const { unique_code } = req.body;
    const existingSale = await Sale.findOne({ unique_code }).lean();
    res.json({ isUnique: !existingSale });
  } catch (error) {
    console.error("Error checking unique code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function check_inventory(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).json({ error: "Salesman not found" });
    }

    const { product_id, company_id, quantity } = req.body;
    const inventory = await Inventory.findOne({
      branch_id: employee.bid,
      product_id,
      company_id
    }).lean();

    if (!inventory || inventory.quantity < parseInt(quantity)) {
      return res.json({
        isAvailable: false,
        availableQuantity: inventory ? inventory.quantity : 0
      });
    }

    res.json({ isAvailable: true, availableQuantity: inventory.quantity });
  } catch (error) {
    console.error("Error checking inventory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Placeholder for get_sale_details (to be provided if needed)
async function get_sale_details(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).json({ error: "Salesman not found" });
    }

    const id = req.params.sales_id;
    const sale = await Sale.findOne({ sales_id: id, salesman_id: employee.e_id }).lean();

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    let companyName = "Unknown Company";
    let productName = "Unknown Product";
    let modelNumber = "N/A";

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

    res.json({
      ...sale,
      company_name: companyName,
      product_name: productName,
      model_number: modelNumber,
      salesman_name: `${employee.f_name} ${employee.last_name}`,
      total_amount: sale.amount,
      saledate: sale.sales_date,
      price: sale.sold_price
    });
  } catch (error) {
    console.error("Error fetching sale details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Placeholder for updateInstallationStatus (to be provided if needed)
async function updateInstallationStatus(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).json({ error: "Salesman not found" });
    }

    const { sales_id, installation_status } = req.body;
    const sale = await Sale.findOneAndUpdate(
      { sales_id, salesman_id: employee.e_id },
      { installation_status },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating installation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  sales_display,
  get_sales_data,
  salesdetaildisplay,
  renderAddSaleForm,
  addSale,
  get_companies,
  check_unique_code,
  check_inventory,
  get_sale_details,
  updateInstallationStatus
};