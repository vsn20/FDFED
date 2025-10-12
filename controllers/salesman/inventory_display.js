const Inventory = require("../../models/inventory");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function inventory_display(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render("salesman/inventory_feature/display_inventory", {
      activePage: 'employee',
      activeRoute: 'stocks',
      successMessage: req.query.success ? 'Inventory data loaded successfully!' : undefined
    });
  } catch (error) {
    console.error("[InventoryDisplay] Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function get_inventory_data(req, res) {
  try {
    console.log("[GetInventoryData] Session user:", res.locals.user);
    const employee = await Employee.findOne({ e_id: res.locals.user.emp_id, role: "Salesman", status: "active" }).lean();
    if (!employee) {
      console.log("[GetInventoryData] Salesman not found:", res.locals.user.emp_id);
      return res.status(403).json({ error: `No employee found for emp_id: ${res.locals.user.emp_id}.` });
    }

    if (!employee.bid) {
      console.log("[GetInventoryData] No bid assigned:", { e_id: employee.e_id });
      return res.status(403).json({ error: `No branch assigned to employee (e_id: ${employee.e_id}).` });
    }

    const branch = await Branch.findOne({ bid: employee.bid, active: "active" }).lean();
    if (!branch) {
      console.log("[GetInventoryData] Active branch not found:", employee.bid);
      return res.status(404).json({ error: "Active branch not found" });
    }

    const stocks = await Inventory.find({ branch_id: branch.bid }).lean();
    // Map to match expected field names
    const formattedStocks = stocks.map(stock => ({
      pid: stock.product_id,
      pname: stock.product_name,
      cname: stock.company_name,
      modelno: stock.model_no,
      quantity: stock.quantity
    }));

    res.json({
      stocks: formattedStocks,
      branchid: branch.bid,
      branchname: branch.b_name
    });
  } catch (error) {
    console.error("[GetInventoryData] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { inventory_display, get_inventory_data };