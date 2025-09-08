const Product = require("../models/products");
const Sale = require("../models/sale");

async function topproducts_display(req, res) {
  try {
    // Step 1: Fetch all accepted products
    const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();
    if (!acceptedProducts || acceptedProducts.length === 0) {
      console.log('[topproducts_display] No accepted products found');
      return res.render("topproducts", {
        topproductData: [],
        activePage: 'top-products',
        activeRoute: ''
      });
    }

    // Step 2: Fetch sales for all products and calculate ratings and sales count
    const topProducts = [];
    for (const product of acceptedProducts) {
      // Fetch sales for this product
      const sales = await Sale.find({ product_id: product.prod_id }).lean();

      // Calculate sales count
      const salesCount = sales.length;

      // Calculate average rating (only consider sales with a rating)
      const ratings = sales
        .filter(sale => sale.rating !== null && sale.rating !== undefined)
        .map(sale => sale.rating);
      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
        : null;

      // Step 3: Filter products with at least 4 sales and average rating >= 4
      if (salesCount >= 4 && averageRating && averageRating >= 4) {
        topProducts.push({
          ...product,
          averageRating: averageRating,
          salesCount: salesCount
        });
      }
    }

    console.log('[topproducts_display] Filtered top products:', topProducts);

    // Step 4: Render the view with the filtered products
    res.render("topproducts", {
      topproductData: topProducts,
      activePage: 'top-products',
      activeRoute: ''
    });
  } catch (error) {
    console.error("[topproducts_display] Error rendering top products:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  topproducts_display
};