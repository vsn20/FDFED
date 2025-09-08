const Product = require("../../models/products");
const { v4: uuidv4 } = require('uuid');

async function companyproducts_display(req, res) {
  try {
    const products = await Product.find({ Com_id: req.user.c_id }).lean();
    res.render("company/company_products", {
      activePage: "company",
      activeRoute: "products",
      companyproductData: products
    });
  } catch (error) {
    console.error("Error rendering products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ prod_id: req.params.prod_id, Com_id: req.user.c_id }).lean();
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("company/company_product_details", {
      activePage: "company",
      activeRoute: "products",
      product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function renderAddProductForm(req, res) {
  res.render("company/add_product", {
    activePage: "company",
    activeRoute: "products",
    companyId: req.user.c_id,
    companyName: req.user.cname
  });
}

async function addProduct(req, res) {
  try {
    const {
      Prod_name,
      Com_id,
      Model_no,
      com_name,
      prod_year,
      stock,
      stockavailability,
      prod_description,
      Retail_price,
      warrantyperiod,
      installation,
      installationType,
      installationcharge
    } = req.body;

    const prod_photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = new Product({
      prod_id: `PROD-${uuidv4().slice(0, 8)}`,
      Prod_name,
      Com_id,
      Model_no,
      com_name,
      prod_year,
      stock,
      stockavailability,
      Status: 'Hold',
      prod_description,
      Retail_price,
      miniselling: "1",
      warrantyperiod,
      installation,
      installationType: installation === 'Required' ? installationType : null,
      installationcharge: installationType === 'Paid' ? installationcharge : null,
      prod_photos
    });

    await product.save();
    res.redirect("/company/products");
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getinventory(req, res) {
  try {
    const products = await Product.find({ Com_id: req.user.c_id }).lean();
    res.render("company/inventory", {
      activePage: "company",
      activeRoute: "stocks",
      products
    });
  } catch (error) {
    console.error("Error rendering inventory:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateStockAvailability(req, res) {
  try {
    const { stockavailability } = req.body;
    const { prod_id } = req.params;

    if (!['instock', 'outofstock'].includes(stockavailability)) {
      return res.status(400).json({ success: false, message: "Invalid stock availability value" });
    }

    const product = await Product.findOneAndUpdate(
      { prod_id, Com_id: req.user.c_id },
      { stockavailability },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or not accessible" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating stock availability:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  companyproducts_display,
  getProductById,
  renderAddProductForm,
  addProduct,
  getinventory,
  updateStockAvailability
};