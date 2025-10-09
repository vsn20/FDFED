const Message = require("../models/message");
const Employee = require("../models/employees");
const Company = require("../models/company");
const Branch = require("../models/branches");

async function admin_messages_display(req, res) {
  try {
    const user = res.locals.user; // Get logged-in user from JWT
    const emp_id = user.emp_id || "unknown"; // Logged-in employee's emp_id
    const messages = await Message.find({
      $or: [
        { to: emp_id }, // Messages addressed to the logged-in employee
        { to: "admin" } // Messages addressed to admin
      ]
    }).sort({ timestamp: -1 }).lean();
    res.render("owner/messages_feature/messages_admin", {
      messages,
      activePage: "employee",
      activeRoute: "messages",
      isSentMessages: false // Explicitly define isSentMessages
    });
  } catch (error) {
    console.error("Error rendering messages:", error);
    res.status(500).send("Server Error");
  }
}

async function admin_sent_messages(req, res) {
  try {
    const user = res.locals.user; // Get logged-in user from JWT
    const emp_id = user.emp_id || "unknown"; // Logged-in employee's emp_id
    const messages = await Message.find({
      from: emp_id // Messages sent by the logged-in employee
    }).sort({ timestamp: -1 }).lean();

    // Enrich messages with company and employee names
    for (let message of messages) {
      if (message.c_id) {
        const company = await Company.findOne({ c_id: message.c_id }).lean();
        message.cname = company ? company.cname : "Unknown";
      }
      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.employeeName = employee ? `${employee.f_name} ${employee.last_name}` : "Unknown";
      }
    }

    res.render("owner/messages_feature/messages_admin", {
      messages,
      activePage: "employee",
      activeRoute: "messages",
      isSentMessages: true // Flag to indicate sent messages view
    });
  } catch (error) {
    console.error("Error rendering sent messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_compose_message_form(req, res) {
  try {
    const companies = await Company.find({ active: "active" }).lean();
    const salesManagers = await Employee.find({ role: "Sales Manager", status: "active" }).lean();
    const branches = await Branch.find({ active: "active" }).lean();
    const user = res.locals.user;
    const from = user.emp_id || "unknown"; // Use emp_id from JWT
    res.render("owner/messages_feature/admin_compose_messages", {
      from,
      companies,
      salesManagers,
      branches,
      category: "all_salesman",
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering compose form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function compose_message(req, res) {
  try {
    const { from, category, to, message, branch_id } = req.body;
    let newMessage = {
      from,
      message,
      timestamp: new Date()
    };
    if (category === "all_salesman") {
      newMessage.to = "all_salesman";
      newMessage.category = "salesman";
      if (branch_id) {
        newMessage.branch_id = branch_id; // Optional branch_id
      }
    } else if (category === "all_sales_manager") {
      newMessage.to = "all_sales_manager";
      newMessage.category = "sales_manager";
    } else if (category === "all_customers") {
      newMessage.to = "all_customers";
      newMessage.category = "customer";
    } else if (category === "all_companies") {
      newMessage.to = "all_companies";
      newMessage.category = "company";
    } else if (category === "specific_company") {
      newMessage.to = to;
      newMessage.category = "company";
      newMessage.c_id = to;
    } else if (category === "specific_sales_manager") {
      newMessage.to = to; // Use emp_id as to
      newMessage.category = "sales_manager";
      newMessage.emp_id = to; // Store emp_id
    }
    const savedMessage = await Message.create(newMessage);
    req.io.emit("newMessage", savedMessage);
    res.redirect("/admin/messages");
  } catch (error) {
    console.error("Error composing message:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_message(req, res) {
  try {
    const { from, to, category, msg, timestamp } = req.query;
    res.render("owner/messages_feature/view_messages", {
      from,
      to,
      category,
      message: msg,
      timestamp,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering message details:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { admin_messages_display, admin_sent_messages, render_compose_message_form, compose_message, view_message };