const Product = require('../models/products');

async function products_display(req, res) {
  try {
    res.render("owner/products_feature/products_admin", {
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getProductsData(req, res) {
  try {
    const products = await Product.find({ Status: 'Accepted' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function rejected_products_display(req, res) {
  try {
    res.render("owner/products_feature/rejected_products", {
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering rejected products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getRejectedProductsData(req, res) {
  try {
    const products = await Product.find({ Status: 'Rejected' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching rejected products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function new_products_display(req, res) {
  try {
    res.render("owner/products_feature/new_products", {
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering new products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getNewProductsData(req, res) {
  try {
    const products = await Product.find({ Status: 'Hold' }).lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function render_product_details(req, res) {
  try {
    res.render("owner/products_feature/products_details", {
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering product details:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function getProductData(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const product = await Product.findOne({ prod_id }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function render_add_product_form(req, res) {
  try {
    res.send("Add product form page (not implemented in this minimal setup)");
  } catch (error) {
    console.error("Error rendering add product form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_edit_product_form(req, res) {
  try {
    res.render("owner/products_feature/edit_products", {
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering edit product form:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function update_product(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const { status } = req.body;
    const product = await Product.findOne({ prod_id });
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    product.Status = status;
    let redirect = '/admin/products';
    if (status === 'Accepted') {
      product.approvedAt = new Date();
      redirect = '/admin/products';
    } else if (status === 'Rejected') {
      product.approvedAt = null;
      redirect = '/admin/products/rejected';
    } else {
      product.approvedAt = null;
      redirect = '/admin/products/new';
    }
    await product.save();
    res.json({ success: true, redirect });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

module.exports = {
  products_display,
  getProductsData,
  rejected_products_display,
  getRejectedProductsData,
  new_products_display,
  getNewProductsData,
  render_product_details,
  getProductData,
  render_add_product_form,
  render_edit_product_form,
  update_product
};