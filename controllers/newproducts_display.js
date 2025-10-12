const Product = require("../models/products");

async function newproducts_display(req, res) {
    res.render("newproducts", {
        activePage: 'new-products',
        activeRoute: '',
    });
}

async function getNewProductsData(req, res) {
    try {
        // Get the current date dynamically
        const currentDate = new Date();
        
        // Calculate the date 15 days ago
        const fifteenDaysAgo = new Date(currentDate);
        fifteenDaysAgo.setDate(currentDate.getDate() - 15);

        // Fetch products that are accepted and approved within the last 15 days
        const acceptedProducts = await Product.find({
            Status: "Accepted",
            approvedAt: { $gte: fifteenDaysAgo, $lte: currentDate }
        }).lean();

        // Send JSON response
        res.json({
            newproductData: acceptedProducts,
            error: acceptedProducts.length === 0 ? "No new products available" : null
        });
    } catch (error) {
        console.error("Error fetching new products:", error);
        res.status(500).json({
            newproductData: [],
            error: "Internal Server Error"
        });
    }
}

module.exports = { newproducts_display, getNewProductsData };