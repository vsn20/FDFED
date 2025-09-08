const mongoose = require("mongoose");
const Sale = require("../../models/sale");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Branch = require("../../models/branches");
const Inventory = require("../../models/inventory");

const renderAddSaleForm = async (req, res) => {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id, role: "Sales Manager", status: "active" });
    if (!employee) {
      return res.status(404).send("Sales Manager not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid, active: "active" }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    res.render("salesmanager/sales_feature/addsale", {
      branchName: branchName,
      activePage: 'employee',
      activeRoute: 'sales',
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("[renderAddSaleForm] Error rendering add sale form:", error);
    res.status(500).send("Internal server error");
  }
};

const sales_display = async (req, res) => {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).send("Sales Manager not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    const sales = await Sale.find({ branch_id: employee.bid }).lean();

    const mappedSales = await Promise.all(
      sales.map(async (sale) => {
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

        return {
          ...sale,
          salesman_name: salesmanName,
          total_amount: sale.amount,
          saledate: sale.sales_date,
        };
      })
    );

    res.render('salesmanager/sales_feature/salesdisplay', {
      activePage: 'employee',
      activeRoute: 'sales',
      sales: mappedSales,
      branchid: employee.bid,
      branchname: branchName
    });
  } catch (error) {
    console.error("error rendering sales", error);
    res.status(500).send('Internal Server Error');
  }
};

const sales_details = async (req, res) => {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id });
    if (!employee) {
      return res.status(404).send("Sales Manager not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid }).lean();
    const branchName = branch ? branch.b_name : "Unknown Branch";

    const salesId = req.params.id;
    const sale = await Sale.findOne({ sales_id: salesId, branch_id: employee.bid }).lean();

    if (!sale) {
      return res.status(404).send('Sale not found');
    }

    let salesmanName = "Unknown Salesman";
    if (typeof sale.salesman_id === "string") {
      const salesman = await Employee.findOne({ e_id: sale.salesman_id }).lean();
      if (salesman) {
        salesmanName = `${salesman.f_name} ${salesman.last_name}`;
      }
    }

    let companyName = "Unknown Company";
    if (typeof sale.company_id === "string") {
      const company = await Company.findOne({ c_id: sale.company_id }).lean();
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
    }

    res.render('salesmanager/sales_feature/salesdetails', {
      activePage: 'employee',
      activeRoute: 'sales',
      sale: {
        ...sale,
        salesman_name: salesmanName,
        company_name: companyName,
        product_name: productName,
        model_number: modelNumber,
        branch_name: branchName,
        total_amount: sale.amount,
        saledate: sale.sales_date,
        price: sale.sold_price,
        phone_number: sale.phone_number || "N/A",
      }
    });
  } catch (error) {
    console.error("error rendering sale details", error);
    res.status(500).send('Internal Server Error');
  }
};

const addsale_post = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id }).lean();
    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Sales Manager not found" });
    }

    const {
      customer_name,
      saledate,
      unique_code,
      company_id,
      product_id,
      purchased_price,
      sold_price,
      quantity,
      salesman_name,
      phone_number,
      address,
      installation,
      installationType,
      installationcharge
    } = req.body;

    if (parseInt(quantity) <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
    }

    const existingSale = await Sale.findOne({ unique_code }).session(session);
    if (existingSale) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Unique code ${unique_code} already exists. Please use a different code.`,
      });
    }

    const salesman = await Employee.findOne({
      f_name: salesman_name.split(" ")[0],
      last_name: salesman_name.split(" ")[1],
      role: "Salesman",
      status: "active"
    }).lean();
    if (!salesman) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Salesman not found" });
    }

    const company = await Company.findOne({ c_id: company_id }).lean();
    if (!company) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const product = await Product.findOne({ prod_id: product_id }).lean();
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const inventory = await Inventory.findOne({
      branch_id: employee.bid,
      product_id: product_id,
      company_id: company_id
    }).session(session);
    if (!inventory || inventory.quantity < parseInt(quantity)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product '${product.Prod_name}' at branch. Available: ${inventory ? inventory.quantity : 0}, Requested: ${quantity}`
      });
    }

    if (installation && !['Required', 'Not Required'].includes(installation)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid installation value" });
    }

    if (installationType && !['Paid', 'Free'].includes(installationType)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid installation type" });
    }

    inventory.quantity -= parseInt(quantity);
    inventory.updatedAt = new Date();
    await inventory.save({ session });

    const count = await Sale.countDocuments().session(session) + 1;
    const sales_id = `S${String(count).padStart(3, '0')}`;

    const amount = parseFloat(sold_price) * parseInt(quantity);
    const profit_or_loss = (parseFloat(sold_price) - parseFloat(purchased_price)) * parseInt(quantity);

    const installation_status = installation === 'Required' ? 'Pending' : null;

    const newSale = new Sale({
      sales_id,
      branch_id: employee.bid,
      salesman_id: salesman.e_id,
      company_id: company.c_id,
      product_id: product.prod_id,
      customer_name,
      sales_date: saledate,
      unique_code: unique_code || `UC${String(count).padStart(3, '0')}`,
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

    await newSale.save({ session });
    await session.commitTransaction();
    res.json({ success: true, redirect: '/salesmanager/sales' });
  } catch (error) {
    await session.abortTransaction();
    console.error("[AddSale] Error:", error);
    res.status(500).json({ success: false, message: 'Error adding sale' });
  } finally {
    session.endSession();
  }
};

const getSalesmen = async (req, res) => {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id, role: "Sales Manager", status: "active" });
    if (!employee) {
      return res.status(404).json({ error: "Sales Manager not found" });
    }

    const salesmen = await Employee.find({ bid: employee.bid, role: "Salesman", status: "active" }).lean();
    res.json(salesmen);
  } catch (error) {
    console.error("[getSalesmen] Error fetching salesmen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ active: "active" }).lean();
    res.json(companies);
  } catch (error) {
    console.error("error fetching companies", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  renderAddSaleForm,
  sales_display,
  sales_details,
  addsale_post,
  getSalesmen,
  getCompanies
};