const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Company = require("../../models/company");

async function company_messages_display(req, res) {
  try {
    const user = res.locals.user; // Get logged-in user from JWT
    const c_id = user.c_id || "unknown"; // Logged-in company's c_id

    // Fetch messages where:
    // 1. to matches the logged-in company's c_id
    // 2. to is "all_companies"
    const messages = await Message.find({
      $or: [
        { to: c_id }, // Specific messages to this company
        { to: "all_companies" } // Messages to all companies
      ]
    })
      .sort({ timestamp: -1 })
      .lean();

    // Enrich messages with sender details
    for (let message of messages) {
      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.fromDisplay = employee
          ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}`
          : message.emp_id;
      } else if (message.c_id && message.c_id !== c_id) {
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
      message.toDisplay = message.to === c_id ? "You" : message.to;
    }

    res.render("company/messages_feature/messages_company", {
      messages,
      activePage: "company",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering company messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_compose_message_form(req, res) {
  try {
    const user = res.locals.user;
    const c_id = user.c_id || "unknown";

    // Fetch all active sales managers
    const salesManagers = await Employee.find({
      role: "Sales Manager",
      status: "active"
    }).lean();

    res.render("company/messages_feature/company_compose_messages", {
      from: c_id,
      salesManagers,
      activePage: "company",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering company compose form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function compose_message(req, res) {
  try {
    const { from, to, category, messages: messageContent } = req.body;

    // Validate input
    if (!["admin", "specific_sales_manager", "all_sales_manager"].includes(category)) {
      return res.status(400).send("Invalid recipient category");
    }

    const newMessage = {
      from,
      to,
      category,
      message: messageContent,
      timestamp: new Date()
    };

    // Set emp_id for specific sales manager
    if (category === "specific_sales_manager") {
      const salesManager = await Employee.findOne({
        e_id: to,
        role: "Sales Manager",
        status: "active"
      }).lean();
      if (!salesManager) {
        return res.status(400).send("Invalid sales manager");
      }
      newMessage.emp_id = to;
    } else if (category === "admin") {
      newMessage.to = "admin";
    } else if (category === "all_sales_manager") {
      newMessage.to = "all_sales_manager";
    }

    // Ensure the sender is the logged-in company
    newMessage.c_id = from;

    await Message.create(newMessage);

    // Emit message via WebSocket (if applicable)
    const io = req.io;
    if (io) {
      io.emit("newMessage", {
        from: newMessage.from,
        to: newMessage.to,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      });
    }

    res.redirect("/company/messages");
  } catch (error) {
    console.error("Error composing company message:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_message(req, res) {
  try {
    const user = res.locals.user;
    const c_id = user.c_id || "unknown";
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

    let toDisplay = to === c_id ? "You" : to;
    if (to === "all_companies") {
      toDisplay = "All Companies";
    }

    res.render("company/messages_feature/views_messages", {
      from: fromDisplay,
      to: toDisplay,
      messages: msg,
      activePage: "company",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering message details:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_sent_messages(req, res) {
  try {
    const user = res.locals.user;
    const c_id = user.c_id || "unknown";

    // Fetch messages sent by the logged-in company
    const sentMessages = await Message.find({ from: c_id })
      .sort({ timestamp: -1 })
      .lean();

    // Enrich sent messages with recipient details
    for (let message of sentMessages) {
      if (message.emp_id) {
        const employee = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.toDisplay = employee
          ? `${message.emp_id} - ${employee.f_name} ${employee.last_name}`
          : message.to;
      } else {
        message.toDisplay = message.to === "all_sales_manager" ? "All Sales Managers" : message.to;
      }
      message.fromDisplay = c_id; // Sender is the logged-in company
      // Truncate message for display
      message.messagePreview =
        message.message.length > 50
          ? message.message.substring(0, 50) + "..."
          : message.message;
      // Format timestamp
      message.formattedTimestamp = new Date(message.timestamp).toLocaleString();
    }

    res.render("company/messages_feature/sent_messages", {
      messages: sentMessages,
      activePage: "company",
      activeRoute: "sent_messages"
    });
  } catch (error) {
    console.error("Error rendering sent messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  company_messages_display,
  render_compose_message_form,
  compose_message,
  view_message,
  view_sent_messages
};