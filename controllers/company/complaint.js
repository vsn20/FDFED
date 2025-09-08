const Complaint = require("../../models/complaint");
const Company = require("../../models/company");

// Function to display all complaints for the company
async function displayComplaints(req, res) {
  try {
    const user = res.locals.user;

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[displayComplaints] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
    }

    // Fetch all complaints for this company
    const complaints = await Complaint.find({ company_id: company.c_id }).lean();

    console.log('[displayComplaints] Complaints data:', complaints);

    res.render("company/complaints", {
      complaints,
      activePage: 'company',
      activeRoute: 'complaints',
    });
  } catch (error) {
    console.error("[displayComplaints] Error rendering complaints:", error);
    res.status(500).send("Internal server error");
  }
}

// Function to update complaint status
async function updateComplaintStatus(req, res) {
  try {
    const user = res.locals.user;
    const complaintId = req.params.complaint_id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Open', 'Closed'];
    if (!validStatuses.includes(status)) {
      console.log('[updateComplaintStatus] Invalid status:', status);
      return res.status(400).send("Invalid status");
    }

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[updateComplaintStatus] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
    }

    // Fetch the complaint and ensure it belongs to this company
    const complaint = await Complaint.findOne({ complaint_id: complaintId, company_id: company.c_id });
    if (!complaint) {
      console.log('[updateComplaintStatus] Complaint not found for complaint_id:', complaintId);
      return res.status(404).send("Complaint not found");
    }

    // Update the status
    complaint.status = status;
    await complaint.save();

    console.log('[updateComplaintStatus] Updated complaint:', complaint);

    // Redirect back to the complaints page
    res.redirect("/company/complaints");
  } catch (error) {
    console.error("[updateComplaintStatus] Error updating complaint status:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { displayComplaints, updateComplaintStatus };