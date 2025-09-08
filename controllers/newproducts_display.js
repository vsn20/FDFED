const Product = require("../models/products");

async function newproducts_display(req, res) {
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

        // Render the page with the fetched products
        res.render("newproducts", {
            newproductData: acceptedProducts,
            activePage: 'new-products',
            activeRoute: '',
            error: acceptedProducts.length === 0 ? "No new products available" : null
        });
    } catch (error) {
        console.error("Error fetching new products:", error);
        res.status(500).render("newproducts", {
            newproductData: [],
            activePage: 'new-products',
            activeRoute: '',
            error: "Internal Server Error"
        });
    }
}

module.exports = { newproducts_display };