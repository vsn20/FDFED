const Product = require("../models/products");

async function products_display(req, res) {
    res.render("ourproducts", {
        activePage: 'our-products',
        activeRoute: '',
    });
}

async function getProductsData(req, res) {
    try {
        // Fetch all products with Status: "Accepted"
        const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();

        // Check if any products were found
        if (!acceptedProducts || acceptedProducts.length === 0) {
            return res.json({
                productData: [],
                error: "No products available"
            });
        }

        // Send JSON response
        res.json({
            productData: acceptedProducts,
            error: null
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            productData: [],
            error: "Internal Server Error"
        });
    }
}

module.exports = { products_display, getProductsData };