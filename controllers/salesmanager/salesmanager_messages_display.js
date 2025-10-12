const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");
const Branch = require("../../models/branches"); // Already added for branches

async function salesmanager_messages_display(req, res) {
  try {
    const user = res.locals.user; // Get logged-in user from JWT
    const emp_id = user.emp_id || "unknown"; // Logged-in sales manager's emp
    const messages = await Message.find({
      $or: [
        { to: emp_id }, // Messages addressed to the logged-in sales manager
        { to: "all_sales_manager" } // Messages addressed to all sales managers
      ]
    }).sort({ timestamp: -1 }).lean();

    // Enrich messages with sender details from the Message table, isolating original sender
    for (let message of messages) {
      let originalFrom = message.from; // Store original from value
      if (message.emp_id && message.emp_id !== emp_id) {
        // Only enrich if emp_id is not the logged-in user (avoid self-referential overwrite)
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.fromDisplay = employee ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}` : message.emp_id;
        originalFrom = message.emp_id; // Use emp_id as the sender
      } else if (message.c_id) {
        const company = await Company.findOne({ c_id: message.c_id }).lean();
        message.fromDisplay = company ? `${message.c_id} - ${company.cname}` : message.c_id;
        originalFrom = message.c_id; // Use c_id as the sender
      } else {
        message.fromDisplay = message.from; // Use raw 'from' if no ID
      }
      // Debug log to verify original sender vs. displayed
      console.log(`Original from: ${originalFrom}, Logged-in emp_id: ${emp_id}, Displayed as: ${message.fromDisplay}`);
      if (message.to === "all_sales_manager" && message.branch_id) {
        message.toDisplay = `${message.to} (${message.branch_id})`;
      } else if (message.to === emp_id) {
        message.toDisplay = "You";
      } else {
        message.toDisplay = message.to;
      }
    }

    res.render("salesmanager/messages_feature/messages_salesmanager", {
      messages,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering sales manager messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_compose_message_form(req, res) {
  try {
    const user = res.locals.user;
    const emp_id = user.emp_id || "unknown";
    const employees = await Employee.find({ role: { $in: ["Sales Manager"] }, status: "active" }).lean();
    const companies = await Company.find({ active: "active" }).lean();
    const branches = await Branch.find({ active: "active" }).lean();
    const from = emp_id; // Use emp_id from JWT

    // Find the sales manager's branch
    const salesManager = await Employee.findOne({ e_id: emp_id, role: "Sales Manager" }).lean();
    const managerBranchId = salesManager ? salesManager.bid : null;
    console.log(`Sales Manager ${emp_id} branch ID: ${managerBranchId}`); // Debug log

    // Filter salesmen by the sales manager's branch using 'bid' instead of 'branch_id'
    const branchSalesmen = managerBranchId ? await Employee.find({
      role: "Salesman",
      bid: managerBranchId, // Corrected to match schema field 'bid'
      status: "active"
    }).lean() : [];
    console.log(`Found ${branchSalesmen.length} salesmen for branch ${managerBranchId}:`, branchSalesmen); // Debug log

    res.render("salesmanager/messages_feature/salesmanager_compose_messages", {
      from,
      employees,
      companies,
      branches,
      branchSalesmen,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering sales manager compose form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function compose_message(req, res) {
  try {
    const { from, category, to, message, branch_id } = req.body;
    let newMessage = {
      from,
      message,
      category,
      timestamp: new Date()
    };
    if (category === "specific_salesman") {
      newMessage.to = to;
      newMessage.emp_id = to;
    } else if (category === "all_companies") {
      newMessage.to = "all_companies";
    } else if (category === "specific_company") {
      newMessage.to = to;
      newMessage.c_id = to;
    } else if (category === "admin") {
      newMessage.to = "admin";
    }
    const savedMessage = await Message.create(newMessage);

    // Emit message via WebSocket
    const io = req.io;
    io.emit("newMessage", {
      from: newMessage.from,
      to: newMessage.to,
      message: newMessage.message,
      timestamp: newMessage.timestamp
    });

    res.redirect("/salesmanager/messages");
  } catch (error) {
    console.error("Error composing sales manager message:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_sent_messages(req, res) {
  try {
    const user = res.locals.user;
    const emp_id = user.emp_id || "unknown";
    const sentMessages = await Message.find({ from: emp_id }).sort({ timestamp: -1 }).lean();

    // Enrich sent messages with recipient details
    for (let message of sentMessages) {
      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.toDisplay = employee ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}` : message.to;
      } else if (message.c_id) {
        const company = await Company.findOne({ c_id: message.c_id }).lean();
        message.toDisplay = company ? `${message.c_id} - ${company.cname}` : message.to;
      } else {
        message.toDisplay = message.to; // Use the raw 'to' value
      }
      if (message.emp_id || message.c_id) {
        message.fromDisplay = emp_id; // Sender is the logged-in user
      } else {
        message.fromDisplay = message.from;
      }
    }

    res.render("salesmanager/messages_feature/sent_messages", {
      messages: sentMessages,
      activePage: "employee",
      activeRoute: "sent_messages"
    });
  } catch (error) {
    console.error("Error rendering sent messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_message(req, res) {
  try {
    const user = res.locals.user; // Ensure user context is available
    const emp_id = user.emp_id || "unknown"; // Define emp_id from user
    const { from, to, msg } = req.query; // Get query params
    // Enrich 'from' with sender details if it contains an ID
    let fromDisplay = from;
    if (from.includes("-")) {
      fromDisplay = from; // Already enriched
    } else if (from.match(/EMP\d+/)) {
      const employee = await Employee.findOne({ e_id: from }).lean();
      fromDisplay = employee ? `${from} - ${employee.f_name} ${employee.last_name}` : from;
    } else if (from.match(/C\d+/)) {
      const company = await Company.findOne({ c_id: from }).lean();
      fromDisplay = company ? `${from} - ${company.cname}` : from;
    }
    let toDisplay = to === emp_id ? "You" : to;
    res.render("salesmanager/messages_feature/view_message", {
      from: fromDisplay,
      to: toDisplay,
      messages: msg,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering message details:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { salesmanager_messages_display, render_compose_message_form, compose_message, view_sent_messages, view_message };