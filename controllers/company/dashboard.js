const Order = require("../../models/orders");
const Sale = require("../../models/sale");
const Company = require("../../models/company");

async function getDashboardData(req, res) {
  try {
    const user = res.locals.user;

    if (!user || !user.c_id) {
      console.log('[getDashboardData] No authenticated user or company ID found');
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[getDashboardData] Company not found for c_id:', user.c_id);
      return res.status(404).json({ error: "Company not found" });
    }

    // Calculate the date 6 months ago from today
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // Start of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch orders for the company from the past 6 months
    const orders = await Order.find({
      company_id: company.c_id,
      ordered_date: { $gte: sixMonthsAgo }
    }).lean();

    // Fetch sales for the company from the past 6 months
    const sales = await Sale.find({
      company_id: company.c_id,
      sales_date: { $gte: sixMonthsAgo }
    }).lean();

    // Process data: count orders and sales per month
    const months = [];
    const orderCounts = [];
    const saleCounts = [];

    // Generate the last 6 months (including the current month)
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      date.setDate(1); // Start of the month
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Oct 2025"
      months.push(monthYear);

      // Count orders for this month
      const orderCount = orders.filter(order => {
        const orderDate = new Date(order.ordered_date);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();
        return orderMonth === date.getMonth() && orderYear === date.getFullYear();
      }).length;
      orderCounts.push(orderCount);

      // Count sales for this month
      const saleCount = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        const saleMonth = saleDate.getMonth();
        const saleYear = saleDate.getFullYear();
        return saleMonth === date.getMonth() && saleYear === date.getFullYear();
      }).length;
      saleCounts.push(saleCount);
    }

    console.log('[getDashboardData] Processed data:', { months, orderCounts, saleCounts });

    // Return JSON data
    res.json({
      months,
      orderCounts,
      saleCounts
    });
  } catch (error) {
    console.error("[getDashboardData] Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getDashboardData };