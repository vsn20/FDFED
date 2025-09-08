const Message = require("../../models/message");
const Employee = require("../../models/employees");
const Branch = require("../../models/branches");

async function salesman_messages_display(req, res) {
  try {
    const user = res.locals.user; // Get logged-in user from JWT
    const emp_id = user.emp_id || "unknown"; // Logged-in salesman's emp_id

    // Fetch the employee's branch ID
    const employee = await Employee.findOne({ e_id: emp_id }).lean();
    if (!employee) {
      console.error(`Employee with emp_id ${emp_id} not found`);
      return res.status(404).send("Employee not found");
    }
    const branch_id = employee.bid;

    // Fetch messages where:
    // 1. to matches the logged-in employee's emp_id
    // 2. to is "all_salesman" and branch_id matches the employee's branch
    const messages = await Message.find({
      $or: [
        { to: emp_id }, // Specific messages to this salesman
        { to: "all_salesman", branch_id: branch_id } // Messages to all salesmen in the same branch
      ]
    })
      .sort({ timestamp: -1 })
      .lean();

    // Enrich messages with sender details
    for (let message of messages) {
      if (message.emp_id && message.emp_id !== emp_id) {
        const sender = await Employee.findOne({ e_id: message.emp_id }).lean();
        message.fromDisplay = sender
          ? `${message.emp_id} - ${sender.f_name} ${sender.last_name}`
          : message.emp_id;
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
      message.toDisplay = message.to === emp_id ? "You" : message.to;
      if (message.to === "all_salesman" && message.branch_id) {
        message.toDisplay = `${message.to} (${message.branch_id})`;
      }
    }

    res.render("salesman/messages_feature/messages_salesman", {
      messages,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering salesman messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_compose_message_form(req, res) {
  try {
    const user = res.locals.user;
    const emp_id = user.emp_id || "unknown";

    // Fetch the employee's branch ID
    const employee = await Employee.findOne({ e_id: emp_id }).lean();
    if (!employee) {
      console.error(`Employee with emp_id ${emp_id} not found`);
      return res.status(404).send("Employee not found");
    }
    const branch_id = employee.bid;

    // Fetch the sales manager of the same branch
    const salesManager = await Employee.findOne({
      role: "Sales Manager",
      bid: branch_id,
      status: "active"
    }).lean();

    if (!salesManager) {
      console.error(`No active sales manager found for branch ${branch_id}`);
      return res.status(403).send("No sales manager assigned to your branch");
    }

    res.render("salesman/messages_feature/salesman_compose_messages", {
      from: emp_id,
      salesManager: salesManager
        ? { emp_id: salesManager.e_id, name: `${salesManager.f_name} ${salesManager.last_name}` }
        : null,
      branch_id,
      activePage: "employee",
      activeRoute: "messages"
    });
  } catch (error) {
    console.error("Error rendering salesman compose form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function compose_message(req, res) {
  try {
    const { from, to, messages: messageContent, branch_id } = req.body;

    // Validate that the recipient is the sales manager of the same branch
    const employee = await Employee.findOne({ e_id: from }).lean();
    if (!employee) {
      console.error(`Employee with emp_id ${from} not found`);
      return res.status(404).send("Employee not found");
    }
    const branch_id_employee = employee.bid;

    const salesManager = await Employee.findOne({
      e_id: to,
      role: "Sales Manager",
      bid: branch_id_employee,
      status: "active"
    }).lean();

    if (!salesManager) {
      console.error(`Invalid recipient: ${to} is not the sales manager of branch ${branch_id_employee}`);
      return res.status(403).send("You can only send messages to the sales manager of your branch");
    }

    const newMessage = {
      from,
      to,
      category: "specific_salesman",
      message: messageContent,
      emp_id: to,
      branch_id: branch_id_employee,
      timestamp: new Date()
    };

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

    res.redirect("/salesman/messages");
  } catch (error) {
    console.error("Error composing salesman message:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function view_message(req, res) {
  try {
    const user = res.locals.user;
    const emp_id = user.emp_id || "unknown";
    const { from, to, msg } = req.query;

    // Enrich 'from' with sender details
    let fromDisplay = from;
    if (from.match(/EMP\d+/)) {
      const employee = await Employee.findOne({ e_id: from }).lean();
      fromDisplay = employee
        ? `${from} - ${employee.f_name} ${employee.last_name}`
        : from;
    }

    let toDisplay = to === emp_id ? "You" : to;
    if (to === "all_salesman") {
      toDisplay = `${to} (${req.query.branch_id || "Unknown Branch"})`;
    }

    res.render("salesman/messages_feature/view_message", {
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

async function view_sent_messages(req, res) {
  try {
    const user = res.locals.user;
    const emp_id = user.emp_id || "unknown";

    // Fetch messages sent by the logged-in salesman
    const sentMessages = await Message.find({ from: emp_id })
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
        message.toDisplay = message.to;
      }
      message.fromDisplay = emp_id; // Sender is the logged-in user
      // Truncate message for display
      message.messagePreview =
        message.message.length > 50
          ? message.message.substring(0, 50) + "..."
          : message.message;
      // Format timestamp
      message.formattedTimestamp = new Date(message.timestamp).toLocaleString();
    }

    res.render("salesman/messages_feature/sent_messages", {
      messages: sentMessages,
      activePage: "employee",
      activeRoute: "sent_messages"
    });
  } catch (error) {
    console.error("Error rendering sent messages:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  salesman_messages_display,
  render_compose_message_form,
  compose_message,
  view_message,
  view_sent_messages
};