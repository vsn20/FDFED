const Sale = require("../../models/sale");

async function getSalesmanDashboardData(req, res) {
  try {
    const user = res.locals.user; // From middleware, based on cookie
    const salesmanId = user.emp_id; // e.g., "EMP5"

    if (!salesmanId) {
      console.log('[Error] No authenticated user found');
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Determine the current month (October 2025 as of now)
    const currentDate = new Date(); // October 14, 2025
    const currentMonth = currentDate.getMonth(); // 9 (October)
    const currentYear = currentDate.getFullYear(); // 2025

    // Set the start and end dates for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1); // October 1, 2025
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // October 31, 2025
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch sales for the salesman for the current month
    const sales = await Sale.find({
      salesman_id: salesmanId,
      sales_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // Process data: calculate totals per day
    const daysInMonth = endOfMonth.getDate(); // 31 days in October 2025
    const days = [];
    const saleCounts = [];
    const profitTotals = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayLabel = date.getDate(); // e.g., 1, 2, ..., 31

      days.push(dayLabel);

      // Count sales for this day
      const saleCount = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return (
          saleDate.getDate() === day &&
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        );
      }).length;
      saleCounts.push(saleCount);

      // Calculate total profit for this day
      const profit = sales
        .filter(sale => {
          const saleDate = new Date(sale.sales_date);
          return (
            saleDate.getDate() === day &&
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitTotals.push(profit);
    }

    console.log('[getSalesmanDashboardData] Processed data:', { days, saleCounts, profitTotals });

    // Return JSON data
    res.json({
      days,
      saleCounts,
      profitTotals
    });
  } catch (error) {
    console.error("[getSalesmanDashboardData] Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getSalesmanDashboardData };