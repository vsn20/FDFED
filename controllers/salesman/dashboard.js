const Sale = require("../../models/sale");

// Function to fetch dashboard data for the salesman (sales and profit per day for the current month)
async function getSalesmanDashboardData(req, res) {
  try {
    const user = res.locals.user; // From middleware, based on cookie
    const salesmanId = user.emp_id; // "EMP5"

    // Step 1: Determine the current month (May 2025)
    const currentDate = new Date(); // May 7, 2025
    const currentMonth = currentDate.getMonth(); // 4 (May)
    const currentYear = currentDate.getFullYear(); // 2025

    // Set the start and end dates for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1); // May 1, 2025
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // May 31, 2025
    endOfMonth.setHours(23, 59, 59, 999);

    // Step 2: Fetch sales for the salesman for the current month
    const sales = await Sale.find({
      salesman_id: salesmanId,
      sales_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // Step 3: Process data: calculate totals per day
    const daysInMonth = endOfMonth.getDate(); // 31 days in May 2025
    const days = [];
    const saleCounts = [];
    const profitTotals = [];

    // Loop through each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayLabel = date.getDate(); // e.g., 1, 2, ..., 31

      // Add the day to the labels
      days.push(dayLabel);

      // Count sales for this day
      const saleCount = sales.filter(sale => {
        const saleDate = new Date(sale.sales_date);
        return saleDate.getDate() === day &&
               saleDate.getMonth() === currentMonth &&
               saleDate.getFullYear() === currentYear;
      }).length;
      saleCounts.push(saleCount);

      // Calculate total profit for this day
      const profit = sales
        .filter(sale => {
          const saleDate = new Date(sale.sales_date);
          return saleDate.getDate() === day &&
                 saleDate.getMonth() === currentMonth &&
                 saleDate.getFullYear() === currentYear;
        })
        .reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitTotals.push(profit);
    }

    console.log('[getSalesmanDashboardData] Processed data:', { days, saleCounts, profitTotals });

    // Step 4: Render the home page with the data
    res.render("salesman/home", {
      activePage: 'employee',
      activeRoute: '',
      days: JSON.stringify(days),
      saleCounts: JSON.stringify(saleCounts),
      profitTotals: JSON.stringify(profitTotals)
    });
  } catch (error) {
    console.error("[getSalesmanDashboardData] Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getSalesmanDashboardData };