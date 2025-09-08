const Product = require("../../models/products");

async function getProductsByCompany(req, res) {
  try {
    console.log("Entered getProductsByCompany function");

    const companyId = req.params.companyId;
    console.log(`Received companyId: ${companyId}, type: ${typeof companyId}`);

    if (!companyId || typeof companyId !== 'string') {
      console.log("Invalid companyId:", companyId);
      return res.status(400).json({ message: "Invalid company ID" });
    }

    console.log("Fetching products for companyId:", companyId);
    const products = await Product.find({ 
      Com_id: companyId,
      Status: { $nin: ["Rejected", "Hold"] },
      stockavailability: { $regex: '^instock$', $options: 'i' } // Filter for 'instock' (case-insensitive)
    }).lean();

    console.log("Filtered products (instock, non-rejected, non-hold):", products.map(p => ({
      prod_id: p.prod_id,
      Prod_name: p.Prod_name,
      Com_id: p.Com_id,
      Status: p.Status,
      stockavailability: p.stockavailability
    })));

    if (products.length === 0) {
      console.log(`No non-rejected, non-hold, in-stock products found for companyId: ${companyId}`);
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(products);
  } catch (error) {
    console.error("Error in getProductsByCompany:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { getProductsByCompany };