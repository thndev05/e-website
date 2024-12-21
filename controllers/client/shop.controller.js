const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const ProductHelpers = require("../../helpers/product");

module.exports.index = async (req, res, next) => {
  try {
    const limit = 10;

    const { keyword, category, color, price, size, sortBy } = req.query;
    let page = Number(req.query.page) || 1;

    const query = { deleted: false };

    let minPrice = 0;
    let maxPrice = 20000;

    const categories = await Category.find({
      deleted: false,
    }).lean();

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }

    if (price) {
      [minPrice, maxPrice] = price.split('-').map(Number);
      query["variants.price"] = { $gte: minPrice, $lte: maxPrice };
    }

    if (size) {
      const sizes = Array.isArray(size) ? size : [size];
      query["variants.size"] = { $in: sizes };
    }

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      const categoryObjects = await Category.find({ name: { $in: categories } });
      const categoryIds = categoryObjects.map(cat => cat._id);

      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        throw new Error('Category not found');
      }
    }

    if (color) {
      if (Array.isArray(color)) {
        query["variants"] = {
          $elemMatch: {
            color: {
              $in: color.map(col => new RegExp(col, "i")),
            }
          }
        };
      } else {
        query["variants"] = {
          $elemMatch: {
            color: {
              $regex: color,
              $options: "i",
            }
          }
        };
      }
    }

    const totalMatchingProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    for (const product of products) {
      product.minPrice = ProductHelpers.getMinPrice(product.variants);
      product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
      product.sales = await ProductHelpers.calculateProductSales(product._id);
    }

    const totalPages = Math.ceil(totalMatchingProducts / limit);

    res.render('client/shop/index', {
      title: 'Shop',
      isHome: false,
      breadcrumbTitle: 'Our Shop',
      breadcrumb: 'Shop',
      categories: categories,
      products: products,
      totalPages: totalPages,
      totalMatchingProducts: totalMatchingProducts,
      page: page,
      startIndex: totalMatchingProducts !== 0 ? (page - 1) * limit + 1 : 0,
      endIndex: Math.min(page * limit, totalMatchingProducts),
      minPrice: minPrice,
      maxPrice: maxPrice,
    })
  } catch (error) {
    res.redirectPage = "/shop";
    next(error);
    console.error(error);
  }
}