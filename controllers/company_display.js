const Company = require("../models/company");

async function company_display(req, res) {
    try {
        const activeCompanies = await Company.find({ active: "active" });
        res.render("owner/company_feature/displaycomapny", {
            companies: activeCompanies,
            activePage: "employee",
            activeRoute: "company",
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function render_add_company_form(req, res) {
    try {
        res.render("owner/company_feature/addcompanie", {
            activePage: "employee",
            activeRoute: "company",
        });
    } catch (error) {
        console.error("Error rendering add company form:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function add_company(req, res) {
    try {
        const { cname, address, email, phone } = req.body;

        if (!cname || !address || !email || !phone) {
            return res.status(400).send("All above fields are required");
        }

        const lastCompany = await Company.findOne().sort({ c_id: -1 });
        let newCId = "C001";
        if (lastCompany && lastCompany.c_id && lastCompany.c_id.startsWith("C")) {
            const lastNum = parseInt(lastCompany.c_id.slice(1)) || 0;
            newCId = `C${String(lastNum + 1).padStart(3, "0")}`;
        }

        const newCompany = new Company({
            c_id: newCId, // Changed from cid
            cname,
            email,
            phone,
            address,
            active: "active",
        });

        await newCompany.save();
        res.redirect("/admin/company");
    } catch (error) {
        console.error("Error adding company:", error.message);
        res.status(500).send("Internal Server Error: " + error.message);
    }
}

async function render_edit_company_form(req, res) {
    try {
        const companyId = req.params.cid; // Kept as cid for route compatibility
        const company = await Company.findOne({ c_id: companyId });
        if (!company) {
            return res.status(404).send("Company not found");
        }
        res.render("owner/company_feature/editcompany", {
            company,
            activePage: "employee",
            activeRoute: "company",
        });
    } catch (error) {
        console.error("Error rendering edit company form:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function update_company(req, res) {
    try {
        const companyId = req.params.cid; // Kept as cid for route compatibility
        const { cname, address, email, phone } = req.body;

        const company = await Company.findOneAndUpdate(
            { c_id: companyId },
            { cname, email, phone, address },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).send("Company not found");
        }
        res.redirect("/admin/company");
    } catch (error) {
        console.error("Error updating company:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    company_display,
    render_add_company_form,
    add_company,
    render_edit_company_form,
    update_company,
};