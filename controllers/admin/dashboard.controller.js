const Order = require('../../models/order.model');
const Product = require('../../models/product.model');

module.exports.dashboard = async (req, res) => {
  res.render('admin/dashboard/index', {
    pageTitle: 'Dashboard',
    currentPage: 'dashboard'
  });
}

module.exports.analyticsData = async (req, res) => {
  const data = await generateAnalytics();
  console.log(data);
  res.json(data);
}

function getLast12Months() {
  const months = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      label: month.toLocaleString('en-US', { month: 'short' }),
      year: month.getFullYear(),
      month: month.getMonth() + 1,
    });
  }
  return months.reverse();
}

async function generateAnalytics() {
  try {
    const last12Months = getLast12Months();
    const labels = last12Months.map(m => m.label);

    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const revenueData = new Array(12).fill(0);
    const ordersData = new Array(12).fill(0);

    last12Months.forEach((month, index) => {
      const order = orders.find(
          o => o._id.year === month.year && o._id.month === month.month
      );
      if (order) {
        revenueData[index] = order.totalRevenue;
        ordersData[index] = order.totalOrders;
      }
    });

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    const topProductsLabels = [];
    const topProductsData = [];

    for (const product of topProducts) {
      const productDetails = await Product.findById(product._id);
      if (productDetails) {
        topProductsLabels.push(productDetails.name);
        topProductsData.push(product.totalQuantity);
      }
    }

    const profitData = revenueData.map(revenue => revenue * 0.1);

    return {
      labels,
      revenueData,
      profitData,
      ordersLabels: labels,
      ordersData,
      topProductsLabels,
      topProductsData,
    }

  } catch (error) {
    console.error("Error generating analytics:", error);
  }
}