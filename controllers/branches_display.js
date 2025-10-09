const Branch = require("../models/branches");

async function branches_display(req, res) {
    try {
        // Fetch active branches from the database
        const activeBranches = await Branch.find({ active: "active" }).lean();
        
        // Check if any branches were found
        if (!activeBranches || activeBranches.length === 0) {
            return res.render("ourbranches", { 
                branches: [], 
                activePage: 'our-branches',
                error: "No active branches found"
            });
        }

        // Render the page with the fetched branches
        res.render("ourbranches", { 
            branches: activeBranches, 
            activePage: 'our-branches',
            error: null 
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).render("ourbranches", { 
            branches: [], 
            activePage: 'our-branches',
            error: " Server Error"
        });
    }
}

module.exports = { branches_display };