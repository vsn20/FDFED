const Branch = require("../models/branches");

async function branches_display(req, res) {
  try {
    res.render("ourbranches", { 
      activePage: 'our-branches'
    });
  } catch (error) {
    console.error("Error rendering branches:", error);
    res.status(500).render("ourbranches", { 
      activePage: 'our-branches',
      error: "Server Error"
    });
  }
}

async function getBranchesData(req, res) {
  try {
    // Fetch active branches from the database
    const activeBranches = await Branch.find({ active: "active" }).lean();
    
    // Check if any branches were found
    if (!activeBranches || activeBranches.length === 0) {
      return res.json({ branches: [], error: "No active branches found" });
    }

    res.json({ branches: activeBranches, error: null });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ branches: [], error: "Server Error" });
  }
}

module.exports = { branches_display, getBranchesData };