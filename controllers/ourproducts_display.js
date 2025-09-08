const Product = require("../models/products");

async function products_display(req, res) {
    try {
        // Fetch all products with Status: "Accepted"
        const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();

        // Check if any products were found
        if (!acceptedProducts || acceptedProducts.length === 0) {
            return res.render("ourproducts", {
                productData: [],
                activePage: 'our-products',
                activeRoute: '',
                error: "No products available"
            });
        }

        // Render the page with the fetched products
        res.render("ourproducts", {
            productData: acceptedProducts,
            activePage: 'our-products',
            activeRoute: '',
            error: null
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).render("ourproducts", {
            productData: [],
            activePage: 'our-products',
            activeRoute: '',
            error: "Internal Server Error"
        });
    }
}

module.exports = { products_display };