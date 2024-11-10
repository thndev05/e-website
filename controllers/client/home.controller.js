const Product = require('../../models/product.model');
const ProductHelpers = require("../../helpers/product");

module.exports.index = async (req, res) => {
  const filter = {
    deleted: false,
    status: 'active'
  };

  const products = await Product.find(filter).lean();
  for (const product of products) {
    product.minPrice = ProductHelpers.getMinPrice(product.variants);
    product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
  }

  const categories = res.locals.categories;
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category.name] = products.filter((product) => product.category.toString() === category._id.toString());
    return acc;
  }, {});


  res.render('client/home/index', {
    title: 'Home',
    isHome: true,
    products: products,
    productsByCategory: productsByCategory
  })
}