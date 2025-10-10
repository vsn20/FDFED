const Company = require("../models/company");

async function company_display(req, res) {
    try {
        // Render empty page; data loaded via API
        res.render("owner/company_feature/displaycomapny", {
            activePage: "employee",
            activeRoute: "company",
        });
    } catch (error) {
        console.error("Error rendering companies page:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function getCompaniesData(req, res) {
    try {
        const companies = await Company.find({ active: "active" }).lean();
        res.json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getCompanyById(req, res) {
    try {
        const { cid } = req.params;
        const company = await Company.findOne({ c_id: cid, active: "active" }).lean();
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.json(company);
    } catch (error) {
        console.error("Error fetching company:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
            return res.status(400).json({ error: "All fields are required" });
        }

        const lastCompany = await Company.findOne().sort({ c_id: -1 });
        let newCId = "C001";
        if (lastCompany && lastCompany.c_id && lastCompany.c_id.startsWith("C")) {
            const lastNum = parseInt(lastCompany.c_id.slice(1)) || 0;
            newCId = `C${String(lastNum + 1).padStart(3, "0")}`;
        }

        const newCompany = new Company({
            c_id: newCId,
            cname,
            email,
            phone,
            address,
            active: "active",
        });

        await newCompany.save();
        res.json({ success: true, message: 'Company added successfully!', c_id: newCId });
    } catch (error) {
        console.error("Error adding company:", error.message);
        res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
}

async function render_edit_company_form(req, res) {
    try {
        // Render empty page; data loaded via API
        res.render("owner/company_feature/editcompany", {
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
        const { cid } = req.params;
        const { cname, address, email, phone } = req.body;

        const company = await Company.findOneAndUpdate(
            { c_id: cid, active: "active" },
            { cname, email, phone, address },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.json({ success: true, message: 'Company updated successfully!' });
    } catch (error) {
        console.error("Error updating company:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    company_display,
    getCompaniesData,
    getCompanyById,
    render_add_company_form,
    add_company,
    render_edit_company_form,
    update_company,
};