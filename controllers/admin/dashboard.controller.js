const Order = require('../../models/order.model');
const Product = require('../../models/product.model');
const User = require('../../models/user.model');

module.exports.dashboard = async (req, res) => {
  res.render('admin/dashboard/index', {
    pageTitle: 'Dashboard',
    currentPage: 'dashboard'
  });
}

module.exports.analyticsData = async (req, res) => {
  const data = await generateAnalytics();
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

    const costs = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $addFields: {
          matchedVariant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$productDetails.variants",
                  as: "variant",
                  cond: { $eq: ["$$variant.sku", "$products.variantSKU"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          productCost: {
            $multiply: ["$matchedVariant.costPrice", "$products.quantity"],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalCost: { $sum: "$productCost" },
        },
      },
    ]);

    const costData = new Array(12).fill(0);

    last12Months.forEach((month, index) => {
      const cost = costs.find(
          c => c._id.year === month.year && c._id.month === month.month
      );
      if (cost) {
        costData[index] = cost.totalCost;
      }
    });

    const profitData = revenueData.map((revenue, index) => revenue - costData[index]);

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

    const totalRevenue = await calculateTotalRevenue();
    const totalProfit = totalRevenue - await calculateTotalCost();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    return {
      labels,
      revenueData,
      profitData,
      ordersLabels: labels,
      ordersData,
      costData,
      topProductsLabels,
      topProductsData,
      totalRevenue: totalRevenue,
      totalProfit: totalProfit,
      totalUsers: totalUsers,
      totalOrders: totalOrders
    };

  } catch (error) {
    console.error("Error generating analytics:", error);
  }
}

async function calculateTotalRevenue() {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1
        }
      }
    ]);

    return result.length > 0 ? result[0].totalRevenue : 0;
  } catch (error) {
    console.error("Error calculating total revenue:", error);
  }
}

async function calculateTotalCost() {
  try {
    const result = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $addFields: {
          matchedVariant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$productDetails.variants",
                  as: "variant",
                  cond: { $eq: ["$$variant.sku", "$products.variantSKU"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          productCost: {
            $multiply: ["$matchedVariant.costPrice", "$products.quantity"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$productCost" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalCost : 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}