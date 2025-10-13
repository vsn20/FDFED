const express = require("express");
const app = express();
const portnumber = 8000;
const path = require("path");
const cookieParser = require("cookie-parser");
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const { restrictlogedinuser, restrict } = require("./middlewares/auth");
const staticrouter = require("./routes/staticrouter");
const loginrouter = require("./routes/login");
const signuprouter = require("./routes/signup");
const adminroutes = require("./routes/admin");
const companyroutes = require("./routes/comapany");
const salesmanagerroutes = require("./routes/salesmanager");
const customerlogin = require("./routes/customerlogin");
const customer = require("./routes/customer");
const companyauth = require("./routes/companyauth");
const salesmanroutes = require("./routes/salesman");
const { submitContact } = require("./routes/contact");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const connectmongodb = require("./connection");
const { getuser } = require("./service/auth");

connectmongodb()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection failed:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(upload.array('prod_photos'));

app.use((req, res, next) => {
  const token = req.cookies && req.cookies.uid ? req.cookies.uid : null;
  res.locals.user = getuser(token) || {};
  res.locals.activePage = res.locals.activePage || '';
  req.io = io; // Pass io to request for WebSocket use
  next();
});

app.get('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect("/");
});

app.post("/contact/submit", submitContact);

// Public routes (no authentication required)
app.use("/", staticrouter);
app.use("/loginvalidation", loginrouter);
app.use("/signupvalidation", signuprouter);
app.use("/", companyauth);  // This handles /company-loginvalidation and /company-signupvalidation
app.use("/", customerlogin); // FIXED: Changed from "/customer-login" to "/"
                              // This now correctly handles /customer-send-otp and /customer-login

// Protected routes (authentication required)
app.use(restrictlogedinuser);

app.use("/admin", restrict("owner"), adminroutes);
app.use("/company", restrict("company"), companyroutes);
app.use("/salesmanager", restrict("sales manager"), salesmanagerroutes);
app.use("/customer", restrict("customer"), customer);
app.use("/salesman", restrict("salesman"), salesmanroutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(portnumber, () =>
  console.log(`Server started at port ${portnumber}`)
);