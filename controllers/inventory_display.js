const Inventory = require("../models/inventory");

async function inventory_display(req, res) {
  try {
    res.render("owner/inventory_feature/display_inventory", {
      activePage: 'employee',
      activeRoute: 'stocks'
    });
  } catch (error) {
    console.error("Error rendering inventory:", error);
    res.status(500).send("Internal server error");
  }
}

async function getInventoryData(req, res) {
  try {
    const stocks = await Inventory.find().lean();
    // Map to match EJS template field names
    const formattedStocks = stocks.map(stock => ({
      bid: stock.branch_id,
      bname: stock.branch_name,
      pid: stock.product_id,
      pname: stock.product_name,
      cname: stock.company_name,
      modelno: stock.model_no,
      quantity: stock.quantity
    }));

    res.json(formattedStocks);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { inventory_display, getInventoryData };