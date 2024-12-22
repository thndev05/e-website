const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Order = require('../../models/order.model');

module.exports.index = async (req, res, next) => {
  try {
    const limit = 10;
    let page = Number(req.query.page) || 1;
    let sortBy = req.query.sortBy || "name_asc";
    const { keyword, category, color, price, size } = req.query;

    let minPrice = 0;
    let maxPrice = 20000;

    const categories = await Category.find({
      deleted: false,
    }).lean();

    const pipeline = [];

    pipeline.push({ $match: { deleted: false } });

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
            { subcategory: { $regex: regex } },
          ]
        }
      });
    }

    if (price) {
      [minPrice, maxPrice] = price.split('-').map(Number);
      pipeline.push({
        $match: {
          "variants.price": { $gte: minPrice, $lte: maxPrice }
        }
      });
    }

    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      pipeline.push({
        $match: {
          "variants.size": { $in: sizes }
        }
      });
    }

    if (category) {
      const categories1 = Array.isArray(category) ? category : [category];
      const categoryObjects = await Category.find({ name: { $in: categories1 } });
      const categoryIds = categoryObjects.map(cat => cat._id);

      if (categoryIds.length > 0) {
        pipeline.push({
          $match: {
            category: { $in: categoryIds }
          }
        });
      } else {
        throw new Error('Category not found');
      }
    }

    if (color) {
      const colorMatch = Array.isArray(color)
          ? { $in: color.map(col => new RegExp(col, 'i')) }
          : { $regex: color, $options: 'i' };

      pipeline.push({
        $match: {
          "variants.color": colorMatch
        }
      });
    }

    // Calculate min price
    pipeline.push({
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: "$variants",
              as: "variant",
              in: {
                $cond: {
                  if: { $ifNull: ["$$variant.salePrice", false] },
                  then: "$$variant.salePrice",
                  else: "$$variant.price"
                }
              }
            }
          }
        },
        maxPrice: {
          $max: {
            $map: {
              input: "$variants",
              as: "variant",
              in: {
                $cond: {
                  if: { $ifNull: ["$$variant.salePrice", false] },
                  then: "$$variant.salePrice",
                  else: "$$variant.price"
                }
              }
            }
          }
        }
      }
    });

    // Calculate sales
    if (['top_sales'].includes(sortBy)) {
      const salesData = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.product',
            totalSales: { $sum: '$products.quantity' }
          }
        }
      ]);

      const salesMap = salesData.reduce((acc, sale) => {
        acc[sale._id.toString()] = sale.totalSales;
        return acc;
      }, {});

      pipeline.push({
        $addFields: {
          totalSales: {
            $ifNull: [{ $toDouble: { $getField: { input: salesMap, field: { $toString: '$_id' } } } }, 0]
          }
        }
      });
    }


    const sortOptions = {
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      price_asc: { minPrice: 1 },
      price_desc: { minPrice: -1 },
      top_sales: { totalSales: -1 },
      new_product: { createdAt: -1 }
    };

    if (sortOptions[sortBy]) {
      pipeline.push({ $sort: sortOptions[sortBy] });
    }

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Calculate total page
    const totalProductsPipeline = [...pipeline];
    totalProductsPipeline.pop(); // Pop $limit
    totalProductsPipeline.pop(); // Pop $skip

    const totalMatchingProducts = await Product.aggregate([
      ...totalProductsPipeline,
      { $count: "total" }
    ]);

    const total = totalMatchingProducts.length > 0 ? totalMatchingProducts[0].total : 0;

    const products = await Product.aggregate(pipeline);

    const totalPages = Math.ceil(total / limit);

    res.render('client/shop/index', {
      title: 'Shop',
      isHome: false,
      breadcrumbTitle: 'Our Shop',
      breadcrumb: 'Shop',
      categories: categories,
      products: products,
      totalPages: totalPages,
      totalMatchingProducts: total,
      page: page,
      startIndex: total !== 0 ? (page - 1) * limit + 1 : 0,
      endIndex: Math.min(page * limit, total),
      minPrice: minPrice,
      maxPrice: maxPrice,
    })

  } catch (error) {
    res.redirectPage = "/shop";
    next(error);
    console.error(error);
  }
}