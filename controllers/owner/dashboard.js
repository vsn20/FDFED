// controllers/owner/dashboard.js
const Order = require("../../models/orders");
const Sale = require("../../models/sale");

async function getAdminDashboardData(req, res) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      ordered_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    const sales = await Sale.find({
      sales_date: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    const daysInMonth = endOfMonth.getDate();
    const days = [];
    const orderCounts = [];
    const saleCounts = [];
    const profitLossTotals = [];

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);

      const orderCount = orders.filter(order => new Date(order.ordered_date).getDate() === day).length;
      orderCounts.push(orderCount);

      const saleCount = sales.filter(sale => new Date(sale.sales_date).getDate() === day).length;
      saleCounts.push(saleCount);

      const profitLoss = sales
        .filter(sale => new Date(sale.sales_date).getDate() === day)
        .reduce((sum, sale) => sum + (sale.profit_or_loss || 0), 0);
      profitLossTotals.push(profitLoss);
    }

    res.json({
      days,
      orderCounts,
      saleCounts,
      profitLossTotals
    });
  } catch (error) {
    console.error("[getAdminDashboardData] Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getAdminDashboardData };