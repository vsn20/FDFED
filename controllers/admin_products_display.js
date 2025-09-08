const Product = require('../models/products');

async function products_display(req, res) {
  try {
    const activeProducts = await Product.find({ Status: 'Accepted' }).lean();
    res.render("owner/products_feature/products_admin", {
      productData: activeProducts,
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function rejected_products_display(req, res) {
  try {
    const rejectedProducts = await Product.find({ Status: 'Rejected' }).lean();
    res.render("owner/products_feature/rejected_products", {
      productData: rejectedProducts,
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering rejected products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function new_products_display(req, res) {
  try {
    const newProducts = await Product.find({ Status: 'Hold' }).lean();
    res.render("owner/products_feature/new_products", {
      productData: newProducts,
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering new products:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function render_product_details(req, res) {
  try {
    const prod_id = req.params.prod_id;
    const product = await Product.findOne({ prod_id }).lean();
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("owner/products_feature/products_details", {
      product,
      activePage: 'employee',
      activeRoute: 'products'
    });
  } catch (error) {
    console.error("Error rendering product details:", error);
    res.status(500).send("Internal Server Error");
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
    const prod_id = req.params.prod_id;
    const product = await Product.findOne({ prod_id }).lean();
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("owner/products_feature/edit_products", {
      product,
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
      return res.status(404).send("Product not found");
    }
    product.Status = status;
    if (status === 'Accepted') {
      product.approvedAt = new Date();
      res.redirect('/admin/products');
    } else if (status === 'Rejected') {
      product.approvedAt = null;
      res.redirect('/admin/products/rejected');
    } else {
      product.approvedAt = null;
      res.redirect('/admin/products/new');
    }
    await product.save();
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  products_display,
  rejected_products_display,
  new_products_display,
  render_product_details,
  render_add_product_form,
  render_edit_product_form,
  update_product
};