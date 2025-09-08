const Inventory = require("../../models/inventory");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function inventory_display(req, res) {
  try {
    const user = res.locals.user;
    const employee = await Employee.findOne({ e_id: user.emp_id }).lean();
    if (!employee) {
      return res.status(404).send("Salesman not found");
    }

    const branch = await Branch.findOne({ bid: employee.bid, active: "active" }).lean();
    if (!branch) {
      return res.status(404).send("Active branch not found");
    }

    const stocks = await Inventory.find({ branch_id: branch.bid }).lean();
    // Map to match EJS template field names
    const formattedStocks = stocks.map(stock => ({
      pid: stock.product_id,
      pname: stock.product_name,
      cname: stock.company_name,
      modelno: stock.model_no,
      quantity: stock.quantity
    }));

    res.render("salesman/inventory_feature/display_inventory", {
      stocks: formattedStocks,
      branchid: branch.bid,
      branchname: branch.b_name,
      activePage: 'employee',
      activeRoute: 'stocks'
    });
  } catch (error) {
    console.error("Error rendering inventory:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { inventory_display };