const mongoose = require("mongoose");
const Company = require("../../models/company");
const Product = require("../../models/products");
const Order = require("../../models/orders");
const Branch = require("../../models/branches");
const Employee = require("../../models/employees");
const Inventory = require("../../models/inventory");
const { v4: uuidv4 } = require('uuid');

async function renderAddOrderForm(req, res) {
  try {
    const allEmployees = await Employee.find().lean();
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).send(`No employee found for emp_id: ${req.user.emp_id}. Verify your login credentials or contact the administrator.`);
    }

    if (employee.status !== "active") {
      return res.status(403).send(`Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}). Contact the administrator to activate your account.`);
    }

    if (!employee.bid) {
      return res.status(403).send(`No branch assigned to this employee (e_id: ${employee.e_id}). Contact the administrator to assign a branch.`);
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).send(`No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}). Contact the administrator to verify branch assignment.`);
    }

    const companies = await Company.find({ active: "active" }).lean();
    res.render("salesmanager/orders_feature/addorder", {
      activePage: "employee",
      activeRoute: "orders",
      companies,
      branchname: branch.b_name,
      branchid: branch.bid
    });
  } catch (error) {
    console.error("Error rendering add order form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getProductsByCompany(req, res) {
  try {
    const companyId = req.params.companyId;
    const products = await Product.find({ 
      Com_id: companyId, 
      Status: { $ne: new RegExp('^Rejected$', 'i') }
    }).lean();

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by company:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function orders_display(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).send(`No employee found for emp_id: ${req.user.emp_id}. Verify your login credentials or contact the administrator.`);
    }

    if (employee.status !== "active") {
      return res.status(403).send(`Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}). Contact the administrator to activate your account.`);
    }

    if (!employee.bid) {
      return res.status(403).send(`No branch assigned to this employee (e_id: ${employee.e_id}). Contact the administrator to assign a branch.`);
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).send(`No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}). Contact the administrator to verify branch assignment.`);
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/orders_feature/ordersdisplay', {
      activePage: 'employee',
      activeRoute: 'orders',
      branchid: branch.bid,
      branchname: branch.b_name
    });
  } catch (error) {
    console.error("Error rendering orders page:", error);
    res.status(500).send('Internal Server Error');
  }
}

async function getOrdersData(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).json({ error: `No employee found for emp_id: ${req.user.emp_id}.` });
    }

    if (employee.status !== "active") {
      return res.status(403).json({ error: `Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}).` });
    }

    if (!employee.bid) {
      return res.status(403).json({ error: `No branch assigned to this employee (e_id: ${employee.e_id}).` });
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).json({ error: `No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}).` });
    }

    const orders = await Order.find({ branch_name: branch.b_name }).lean();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function order_details(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).send(`No employee found for emp_id: ${req.user.emp_id}. Verify your login credentials.`);
    }

    if (employee.status !== "active") {
      return res.status(403).send(`Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}). Contact the administrator.`);
    }

    if (!employee.bid) {
      return res.status(403).send(`No branch assigned to this employee (e_id: ${employee.e_id}).`);
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).send(`No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}).`);
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/orders_feature/orderdetails', {
      activePage: 'employee',
      activeRoute: 'orders',
      order_id: req.params.id
    });
  } catch (error) {
    console.error("Error rendering order details page:", error);
    res.status(500).send('Internal Server Error');
  }
}

async function getOrderById(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).json({ error: `No employee found for emp_id: ${req.user.emp_id}.` });
    }

    if (employee.status !== "active") {
      return res.status(403).json({ error: `Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}).` });
    }

    if (!employee.bid) {
      return res.status(403).json({ error: `No branch assigned to this employee (e_id: ${employee.e_id}).` });
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).json({ error: `No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}).` });
    }

    const order = await Order.findOne({ 
      order_id: req.params.id, 
      branch_name: branch.b_name 
    }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not accessible' });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function order_edit(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).send(`No employee found for emp_id: ${req.user.emp_id}. Verify your login credentials.`);
    }

    if (employee.status !== "active") {
      return res.status(403).send(`Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}). Contact the administrator.`);
    }

    if (!employee.bid) {
      return res.status(403).send(`No branch assigned to this employee (e_id: ${employee.e_id}).`);
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).send(`No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}).`);
    }

    // Render empty page; data loaded via API
    res.render('salesmanager/orders_feature/orderedit', {
      activePage: 'employee',
      activeRoute: 'orders',
      order_id: req.params.id
    });
  } catch (error) {
    console.error("Error rendering order edit page:", error);
    res.status(500).send('Internal Server Error');
  }
}

async function updateInventoryForOrder(order, branch) {
  try {
    const company = await Company.findOne({ c_id: order.company_id }).lean();
    if (!company) {
      return { success: false, message: `Company not found for c_id: ${order.company_id}` };
    }

    const product = await Product.findOne({ prod_id: order.product_id }).lean();
    if (!product) {
      return { success: false, message: `Product not found for prod_id: ${order.product_id}` };
    }

    let inventory = await Inventory.findOne({
      branch_id: branch.bid,
      product_id: order.product_id,
      company_id: order.company_id
    });

    if (inventory) {
      inventory.quantity += parseInt(order.quantity);
      inventory.updatedAt = new Date();
      await inventory.save();
    } else {
      inventory = new Inventory({
        branch_id: branch.bid,
        branch_name: branch.b_name,
        product_id: order.product_id,
        product_name: product.Prod_name,
        company_id: order.company_id,
        company_name: company.cname,
        model_no: product.Model_no,
        quantity: parseInt(order.quantity)
      });
      await inventory.save();
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function order_update(req, res) {
  try {
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).json({ success: false, message: `No employee found for emp_id: ${req.user.emp_id}.` });
    }

    if (employee.status !== "active") {
      return res.status(403).json({ success: false, message: `Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}).` });
    }

    if (!employee.bid) {
      return res.status(403).json({ success: false, message: `No branch assigned to this employee (e_id: ${employee.e_id}).` });
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).json({ success: false, message: `No active branch found for bid: ${employee.bid} (e_id: ${employee.e_id}).` });
    }

    const { status } = req.body;
    const order = await Order.findOne({ order_id: req.params.id, branch_name: branch.b_name });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not accessible' });
    }

    if (status && status.toLowerCase() === "accepted" && order.status.toLowerCase() !== "accepted") {
      const inventoryResult = await updateInventoryForOrder(order, branch);
      if (!inventoryResult.success) {
        return res.status(400).json({ success: false, message: `Failed to update inventory: ${inventoryResult.message}` });
      }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, redirect: '/salesmanager/orders' });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function addorder_post(req, res) {
  try {
    const { branch_name, company_id, product_id, quantity, ordered_date } = req.body;
    const employee = await Employee.findOne({ e_id: req.user.emp_id }).lean();

    if (!employee) {
      return res.status(403).json({ success: false, message: `No employee found for emp_id: ${req.user.emp_id}.` });
    }

    if (employee.status !== "active") {
      return res.status(403).json({ success: false, message: `Employee (e_id: ${employee.e_id}) is not active (status: ${employee.status}).` });
    }

    if (!employee.bid) {
      return res.status(403).json({ success: false, message: `No branch assigned to this employee (e_id: ${employee.e_id}).` });
    }

    const branch = await Branch.findOne({ 
      bid: employee.bid, 
      b_name: branch_name, 
      active: "active" 
    }).lean();

    if (!branch) {
      return res.status(403).json({ success: false, message: `No active branch found for bid: ${employee.bid}, branch_name: ${branch_name} (e_id: ${employee.e_id}).` });
    }

    const company = await Company.findOne({ c_id: company_id }).lean();
    const product = await Product.findOne({ prod_id: product_id }).lean();

    if (!company || !product) {
      return res.status(400).json({ success: false, message: "Invalid company or product" });
    }

    const order = new Order({
      order_id: `ORD-${uuidv4().slice(0, 8)}`,
      branch_id: branch.bid,
      branch_name,
      company_id,
      company_name: company.cname,
      product_id,
      product_name: product.Prod_name,
      quantity: parseInt(quantity),
      ordered_date: new Date(ordered_date),
      status: "Pending",
      installation_type: product.installationType || "None"
    });

    await order.save();
    res.json({ success: true, redirect: "/salesmanager/orders" });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function updateDeliveryDate(req, res) {
  try {
    const { order_id, delivery_date, status } = req.body;
    const company = await Company.findOne({ c_id: req.user.c_id }).lean();
    if (!company) {
      return res.status(403).json({ success: false, message: `No company found for c_id: ${req.user.c_id}.` });
    }

    const order = await Order.findOne({ order_id, company_id: company.c_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not accessible' });
    }

    const branch = await Branch.findOne({ bid: order.branch_id, active: "active" }).lean();
    if (!branch) {
      return res.status(403).json({ success: false, message: `No active branch found for order: ${order_id}` });
    }

    if (status) {
      if (status.toLowerCase() === "accepted" && order.status.toLowerCase() !== "accepted") {
        const inventoryResult = await updateInventoryForOrder(order, branch);
        if (!inventoryResult.success) {
          return res.status(400).json({ success: false, message: `Failed to update inventory: ${inventoryResult.message}` });
        }
      }
      order.status = status;
    }

    if (delivery_date) {
      order.delivery_date = new Date(delivery_date);
    }

    await order.save();
    res.json({ success: true, redirect: '/company/orders' });
  } catch (error) {
    console.error("Error updating delivery date:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = {
  orders_display,
  getOrdersData,
  order_details,
  getOrderById,
  order_edit,
  order_update,
  addorder_post,
  renderAddOrderForm,
  getProductsByCompany,
  updateDeliveryDate
};