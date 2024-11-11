const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const ProductHelpers = require("../../helpers/product");

module.exports.index = async (req, res) => {
  const limit = 10;

  const { keyword, category, color, price, size, page = 1 } = req.query;

  const query = { deleted: false };

  if (keyword) {
    const regex = new RegExp(keyword, 'i');
    filter.$or = [
      { name: { $regex: regex } },
      { description: { $regex: regex } }
    ];
  }

  if (price) {
    const [minPrice, maxPrice] = price.split('-').map(Number);
    query["variants.price"] = { $gte: minPrice, $lte: maxPrice };
  }

  if (size) {
    query["variants.size"] = size;
  }

  if (category) {
    const categoryObj = await Category.findOne({name: category});
    if (categoryObj) {
      query.category = categoryObj._id;
    } else {
      throw new Error('Category not found');
    }
  }

  if (color) {
    query["variants"] = {
      $elemMatch: {
        color: {
          $regex: color,
          $options: "i",
        }
      }
    };
  }

  const totalMatchingProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
  for (const product of products) {
    product.minPrice = ProductHelpers.getMinPrice(product.variants);
    product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
  }

  const totalPages = Math.ceil(totalMatchingProducts / limit);

  console.log(products);
  console.log(totalMatchingProducts);
  console.log(totalPages);

  res.render('client/shop/index', {
    title: 'Shop',
    isHome: false,
    products: products,
    totalPages: totalPages,
    totalMatchingProducts: totalMatchingProducts,
    page: page,
    startIndex: totalMatchingProducts !== 0 ? (page - 1) * limit + 1 : 0,
    endIndex: Math.min(page * limit + limit, totalMatchingProducts),
  })
}