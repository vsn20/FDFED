const Branch = require("../models/branches");

async function branches_display(req, res) {
  try {
    // Render empty page; data loaded via API
    res.render("owner/branch_feature/branch_admin", {
      activePage: "employee",
      activeRoute: "branches",
    });
  } catch (error) {
    console.error("Error rendering branches page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getBranchesData(req, res) {
  try {
    const branches = await Branch.find({ active: "active" }).lean();
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getBranchById(req, res) {
  try {
    const { bid } = req.params;
    const branch = await Branch.findOne({ bid, active: "active" }).lean();
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    res.json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    res.json({ success: true, message: 'Branch added successfully!', bid: newBid });
  } catch (error) {
    console.error("Error adding branch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function render_edit_branch_form(req, res) {
  try {
    const { bid } = req.params;
    // Render empty page; data loaded via API, pass bid for URL parsing
    res.render("owner/branch_feature/edit_branch", {
      bid,
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
    const { bid } = req.params;
    const { b_name, address } = req.body;

    const branch = await Branch.findOneAndUpdate(
      { bid, active: "active" },
      { b_name, location: address },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    res.json({ success: true, message: 'Branch updated successfully!' });
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ error: "Server Error" });
  }
}

module.exports = {
  branches_display,
  getBranchesData,
  getBranchById,
  render_add_branch_form,
  add_branch,
  render_edit_branch_form,
  update_branch,
};