const Order = require("../../models/orders");
const Sale = require("../../models/sale");

// Function to fetch dashboard data for the admin homepage (orders, sales, and profit/loss per day for the current month)
async function getAdminDashboardData(req, res) {
  try {
    // Step 1: Determine the current month (May 2025)
    const currentDate = new Date(); // May 7, 2025
    const currentMonth = currentDate.getMonth(); // 4 (May)
    const currentYear = currentDate.getFullYear(); // 2025

    // Set the start and end dates for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1); // May 1, 2025
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // May 31, 2025
    endOfMonth.setHours(23, 59, 59, 999);

    // Step 2: Fetch all orders for the current month (across all branches)
    const orders = await Order.find({
      ordered_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // Step 3: Fetch all sales for the current month (across all branches)
    const sales = await Sale.find({
      sales_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // Step 4: Process data: calculate totals per day
    const daysInMonth = endOfMonth.getDate(); // 31 days in May 2025
    const days = [];
    const orderCounts = [];
    const saleCounts = [];
    const profitLossTotals = [];

    // Loop through each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayLabel = date.getDate(); // e.g., 1, 2, ..., 31

      // Add the day to the labels
      days.push(dayLabel);

      // Count orders for this day
      const orderCount = orders.filter(order => {
        const orderDate = new Date(order.ordered_date);
        return orderDate.getDate() === day &&
               orderDate.getMonth() === currentMonth &&
               orderDate.getFullYear() === currentYear;
      }).length;
      orderCounts.push(orderCount);

      // Count sales for this day
      const saleCount = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return saleDate.getDate() === day &&
               saleDate.getMonth() === currentMonth &&
               saleDate.getFullYear() === currentYear;
      }).length;
      saleCounts.push(saleCount);

      // Calculate total profit/loss for this day
      const profitLoss = sales
        .filter(sale => {
          const saleDate = new Date(sale.sales_date);
          return saleDate.getDate() === day &&
                 saleDate.getMonth() === currentMonth &&
                 saleDate.getFullYear() === currentYear;
        })
        .reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitLossTotals.push(profitLoss);
    }

    console.log('[getAdminDashboardData] Processed data:', { days, orderCounts, saleCounts, profitLossTotals });

    // Step 5: Render the homepage with the data
    res.render("owner/homepage", {
      activePage: "employee",
      activeRoute: "",
      days: JSON.stringify(days),
      orderCounts: JSON.stringify(orderCounts),
      saleCounts: JSON.stringify(saleCounts),
      profitLossTotals: JSON.stringify(profitLossTotals)
    });
  } catch (error) {
    console.error("[getAdminDashboardData] Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getAdminDashboardData };