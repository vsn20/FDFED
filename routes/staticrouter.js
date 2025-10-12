const express = require("express");

const router = express.Router();

const {products_display, getProductsData}=require("../controllers/ourproducts_display")
const { newproducts_display, getNewProductsData}=require("../controllers/newproducts_display");
const {topproducts_display, getTopProductsData}=require("../controllers/topproducts_display");

const { branches_display, getBranchesData } = require("../controllers/branches_display");
const { sendOtp, resetPassword } = require("../controllers/forgotPassword");

router.get("/",(req,res)=>res.render("home.ejs",{ activePage: 'home' }));


router.get('/employeelogin', (req, res) => {
  if (res.locals.user) {
      const userType = res.locals.user.type;
      switch (userType) {
          case "owner":
              return res.redirect('admin/home');
          case "sales manager":
              return res.redirect('salesmanager/home');
          case "salesman":
              return res.redirect('salesman/home');
          default:
              // If not an employee type, show the login page
              return res.render('employeelogin', { activePage: 'employee', loginError: null, signupError: null });
      }
  }
  res.render('employeelogin', { activePage: 'employee', loginError: null, signupError: null });
});

router.get('/customerlogin', (req, res) => {
  if (res.locals.user) {
      const userType = res.locals.user.type;
      if (userType === "customer") {
          return res.redirect('/customer/home');
      }
      // If not "customer", show the login page
      return res.render('customerlogin', { activePage: 'customer', error: null });
  }
  res.render('customerlogin', { activePage: 'customer', error: null });
});
router.get('/companylogin', (req, res) => {
    if (res.locals.user) {
        const userType = res.locals.user.type;
        if (userType === "company") {
            return res.redirect('/company/home');
        }
        // If not "company", show the login page
        return res.render('companylogin', { activePage: 'company', loginError: null, signupError: null });
    }
    res.render('companylogin', { activePage: 'company', loginError: null, signupError: null });
});

router.get("/about-us",(req,res)=>res.render("aboutus.ejs",{ activePage: 'about-us' }));
router.get("/signup",(req,res)=>res.render("signup.ejs",{ activePage: 'employee' }));


router.get("/forgot-password", (req, res) => res.render("forget_password.ejs", { activePage: 'employee' }));
router.post("/forgot-password/send-otp", sendOtp);
router.post("/forgot-password/reset", resetPassword);
router.get("/contact-us", (req, res) => res.render("contactus.ejs", { activePage: 'contact-us' }));


// Main routes - render empty views
router.get("/topproducts",topproducts_display);
router.get("/ourproducts",products_display);
router.get("/newproducts",newproducts_display);

// Data API routes
router.get("/topproducts/data", getTopProductsData);
router.get("/ourproducts/data", getProductsData);
router.get("/newproducts/data", getNewProductsData);

router.get("/our-branches", branches_display);
router.get("/our-branches/data", getBranchesData);

module.exports= router;