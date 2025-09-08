const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");

async function blogs(req, res) {
  try {
    // Fetch messages where to is "all_customers"
    const messages = await Message.find({ to: "all_customers" })
      .sort({ timestamp: -1 })
      .lean();

    // Enrich messages with sender details
    for (let message of messages) {
      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.fromDisplay = employee
          ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}`
          : message.emp_id;
      } else if (message.c_id) {
        const company = await Company.findOne({ c_id: message.c_id }).lean();
        message.fromDisplay = company ? `${message.c_id} - ${company.cname}` : message.c_id;
      } else {
        message.fromDisplay = message.from;
      }
      // Truncate message for display (first 50 characters)
      message.messagePreview =
        message.message.length > 50
          ? message.message.substring(0, 50) + "..."
          : message.message;
      // Format timestamp
      message.formattedTimestamp = new Date(message.timestamp).toLocaleString();
      // Set toDisplay
      message.toDisplay = "All Customers";
    }

    res.render("customer/blogs/blogs", {
      messages,
      activePage: "customer",
      activeRoute: "blogs"
    });
  } catch (error) {
    console.error("Error rendering customer messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_message(req, res) {
  try {
    const { from, to, msg } = req.query;

    // Enrich 'from' with sender details
    let fromDisplay = from;
    if (from.match(/EMP\d+/)) {
      const employee = await Employee.findOne({ e_id: from }).lean();
      fromDisplay = employee
        ? `${from} - ${employee.f_name} ${employee.last_name}`
        : from;
    } else if (from.match(/C\d+/)) {
      const company = await Company.findOne({ c_id: from }).lean();
      fromDisplay = company ? `${from} - ${company.cname}` : from;
    }

    const toDisplay = to === "all_customers" ? "All Customers" : to;

    res.render("customer/blogs/view_message", {
      from: fromDisplay,
      to: toDisplay,
      messages: msg,
      activePage: "customer",
      activeRoute: "blogs"
    });
  } catch (error) {
    console.error("Error rendering message details:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  blogs,
  view_message
};