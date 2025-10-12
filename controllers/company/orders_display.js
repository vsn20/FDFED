const mongoose = require("mongoose");
const Order = require("../../models/orders");
const Inventory = require("../../models/inventory");
const Branch = require("../../models/branches");
const Company = require("../../models/company");
const Product = require("../../models/products");

async function orders_display(req, res) {
  try {
    res.render("company/orders_feature/orderdata", {
      activePage: "company",
      activeRoute: "orders",
    });
  } catch (error) {
    console.error("Error rendering orders:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
}

async function getOrdersData(req, res) {
  try {
    const orders = await Order.find({ company_id: req.user.c_id }).lean();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function ordersedit_display(req, res) {
  try {
    res.render("company/orders_feature/orderedit", {
      oid: req.params.oid,
      activePage: "company",
      activeRoute: "orders",
    });
  } catch (error) {
    console.error("Error rendering edit order form:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
}

async function getOrderById(req, res) {
  try {
    const { oid } = req.params;
    const order = await Order.findOne({ order_id: oid, company_id: req.user.c_id }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function pendingorders_display(req, res) {
  try {
    res.render("company/orders_feature/pendingorderdata", {
      activePage: "company",
      activeRoute: "orders",
    });
  } catch (error) {
    console.error("Error rendering pending orders:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
}

async function getPendingOrdersData(req, res) {
  try {
    const orders = await Order.find({ 
      company_id: req.user.c_id, 
      status: "Pending" 
    }).lean();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function pendingedit_display(req, res) {
  try {
    res.render("company/orders_feature/pendingedit", {
      oid: req.params.oid,
      activePage: "company",
      activeRoute: "orders",
    });
  } catch (error) {
    console.error("Error rendering pending edit form:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
}

async function updateInventoryForOrder(order, branch, session) {
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
    }).session(session);

    if (inventory) {
      const oldQuantity = inventory.quantity;
      inventory.quantity = oldQuantity + parseInt(order.quantity);
      inventory.updatedAt = new Date();
      await inventory.save({ session });
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
      await inventory.save({ session });
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function updateOrderStatus(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, delivery_date } = req.body;
    const order = await Order.findOne({ order_id: req.params.oid, company_id: req.user.c_id }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).send("Order not found");
    }

    const branch = await Branch.findOne({ bid: order.branch_id, active: "active" }).lean();
    if (!branch) {
      await session.abortTransaction();
      return res.status(403).send(`No active branch for order: ${req.params.oid}`);
    }

    if (status && status.toLowerCase() === "accepted" && order.status.toLowerCase() !== "accepted") {
      const inventoryResult = await updateInventoryForOrder(order, branch, session);
      if (!inventoryResult.success) {
        await session.abortTransaction();
        return res.status(400).send(`Failed to update inventory: ${inventoryResult.message}`);
      }
    }

    const updateData = { status };
    if (delivery_date) {
      updateData.delivery_date = new Date(delivery_date);
    }

    await Order.updateOne(
      { order_id: req.params.oid, company_id: req.user.c_id },
      updateData,
      { session }
    );

    await session.commitTransaction();
    res.redirect("/company/orders");
  } catch (error) {
    await session.abortTransaction();
    console.error("[UpdateOrderStatus] Error:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  } finally {
    session.endSession();
  }
}

async function updateDeliveryDate(req, res) {
  try {
    const { order_id, delivery_date } = req.body;
    const order = await Order.findOneAndUpdate(
      { order_id, company_id: req.user.c_id },
      { delivery_date: new Date(delivery_date) },
      { new: true }
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.redirect("/company/orders");
  } catch (error) {
    console.error("Error updating delivery date:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
}

module.exports = {
  orders_display,
  getOrdersData,
  ordersedit_display,
  getOrderById,
  pendingorders_display,
  getPendingOrdersData,
  pendingedit_display,
  updateOrderStatus,
  updateDeliveryDate
};