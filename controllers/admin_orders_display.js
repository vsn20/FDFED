const Order = require("../models/orders");

async function orders_display(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render("owner/order_feature/order_admin", {
      activePage: "employee",
      activeRoute: "orders",
    });
  } catch (error) {
    console.error("Error rendering orders:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getOrdersData(req, res) {
  try {
    const orders = await Order.find().lean();
    // Format delivery_date for frontend if needed, but keep as is for simplicity
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  orders_display,
  getOrdersData,
};