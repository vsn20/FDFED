const Branch = require("../models/branches");

async function branches_display(req, res) {
  try {
    const activeBranches = await Branch.find({ active: "active" });
    res.render("owner/branch_feature/branch_admin", {
      branches: activeBranches,
      activePage: "employee",
      activeRoute: "branches",
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_add_branch_form(req, res) {
  try {
    res.render("owner/branch_feature/add_branch", {
      activePage: "employee",
      activeRoute: "branches",
    });
  } catch (error) {
    console.error("Error rendering add branch form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function add_branch(req, res) {
  try {
    const { b_name, address } = req.body;

    // Generate unique branch ID
    const lastBranch = await Branch.findOne().sort({ bid: -1 });
    const newBid = lastBranch
      ? `B${String(parseInt(lastBranch.bid.slice(1)) + 1).padStart(3, "0")}`
      : "B001";

    const newBranch = new Branch({
      bid: newBid,
      b_name,
      location: address,
      manager_id: null,
      manager_name: 'Not Assigned',
      manager_email: 'N/A',
      manager_ph_no: 'N/A',
      manager_assigned: false,
      active: "active",
    });

    await newBranch.save();
    res.redirect("/admin/branches");
  } catch (error) {
    console.error("Error adding branch:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_edit_branch_form(req, res) {
  try {
    const branchId = req.params.bid;
    const branch = await Branch.findOne({ bid: branchId });
    if (!branch) {
      return res.status(404).send("Branch not found");
    }
    res.render("owner/branch_feature/edit_branch", {
      branch,
      activePage: "employee",
      activeRoute: "branches",
    });
  } catch (error) {
    console.error("Error rendering edit branch form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function update_branch(req, res) {
  try {
    const branchId = req.params.bid;
    const { b_name, address } = req.body;

    const branch = await Branch.findOneAndUpdate(
      { bid: branchId },
      { b_name, location: address },
      { new: true }
    );

    if (!branch) {
      return res.status(404).send("Branch not found");
    }
    res.redirect("/admin/branches");
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).send(" Server Error");
  }
}

module.exports = {
  branches_display,
  render_add_branch_form,
  add_branch,
  render_edit_branch_form,
  update_branch,
};


//controllers/owner/addemployee.js
//controllers/owner/addemployee.js
//controllers/owner/addemployee.js
//controllers/owner/addemployee.js
//controllers/owner/addemployee.js