const Order = require("../../models/orders");
const Sale = require("../../models/sale");
const Company = require("../../models/company");

// Function to fetch dashboard data (orders and sales for the past 6 months)
async function getDashboardData(req, res) {
  try {
    const user = res.locals.user;

    // Fetch the company associated with the logged-in user
    const company = await Company.findOne({ c_id: user.c_id }).lean();
    if (!company) {
      console.log('[getDashboardData] Company not found for c_id:', user.c_id);
      return res.status(404).send("Company not found");
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
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "May 2024"
      months.push(monthYear);

      // Count orders for this month
      const orderCount = orders.filter(order => {
        const orderMonth = new Date(order.ordered_date).getMonth();
        const orderYear = new Date(order.ordered_date).getFullYear();
        return orderMonth === date.getMonth() && orderYear === date.getFullYear();
      }).length;
      orderCounts.push(orderCount);

      // Count sales for this month
      const saleCount = sales.filter(sale => {
        const saleMonth = new Date(sale.sales_date).getMonth();
        const saleYear = new Date(sale.sales_date).getFullYear();
        return saleMonth === date.getMonth() && saleYear === date.getFullYear();
      }).length;
      saleCounts.push(saleCount);
    }

    console.log('[getDashboardData] Processed data:', { months, orderCounts, saleCounts });

    // Render the home page with the data
    res.render("company/home", {
      activePage: 'company',
      activeRoute: '',
      months: JSON.stringify(months), // Pass as JSON string for JavaScript usage
      orderCounts: JSON.stringify(orderCounts),
      saleCounts: JSON.stringify(saleCounts)
    });
  } catch (error) {
    console.error("[getDashboardData] Error fetching dashboard data:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { getDashboardData };