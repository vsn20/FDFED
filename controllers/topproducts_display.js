const Product = require("../models/products");
const Sale = require("../models/sale");

async function topproducts_display(req, res) {
  res.render("topproducts", {
    activePage: 'top-products',
    activeRoute: ''
  });
}

async function getTopProductsData(req, res) {
  try {
    // Step 1: Fetch all accepted products
    const acceptedProducts = await Product.find({ Status: "Accepted" }).lean();
    if (!acceptedProducts || acceptedProducts.length === 0) {
      console.log('[getTopProductsData] No accepted products found');
      return res.json({
        topproductData: [],
        error: "No accepted products found"
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

    console.log('[getTopProductsData] Filtered top products:', topProducts);

    // Step 4: Send JSON response
    res.json({
      topproductData: topProducts,
      error: topProducts.length === 0 ? "No top products available with a rating of 4 or higher and at least 4 sales." : null
    });
  } catch (error) {
    console.error("[getTopProductsData] Error fetching top products:", error);
    res.status(500).json({
      topproductData: [],
      error: "Internal Server Error"
    });
  }
}

module.exports = {
  topproducts_display,
  getTopProductsData
};