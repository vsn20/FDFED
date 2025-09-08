const Message = require("../models/message");

async function submitContact(req, res) {
  try {
    const { phone, email, message } = req.body;

    // Server-side validation
    if (!phone || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const phonePattern = /^\+?([0-9]{1,3})?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phonePattern.test(phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (message.length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters long." });
    }

    // Encapsulate phone, email, and message in the message field
    const encapsulatedMessage = `Phone: ${phone}\nEmail: ${email}\nMessage: ${message}`;

    // Create new message
    const newMessage = {
      from: "anonymous",
      to: "admin",
      category: "contact_us",
      message: encapsulatedMessage,
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

    res.json({ success: true, message: "Successfully submitted" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { submitContact };