const Order = require("../models/orders");

async function orders_display(req, res) {
  try {
    const orders = await Order.find().lean();
    res.render("owner/order_feature/order_admin", {
      activePage: "employee",
      activeRoute: "orders",
      orders
    });
  } catch (error) {
    console.error("Error rendering orders:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  orders_display
};