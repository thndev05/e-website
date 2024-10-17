const Product = require('../../models/product.model');
const ProductHelpers = require('../../helpers/product');

// [GET] /admin/products
module.exports.index = async (req, res) => {
  const find = {
    deleted: false
  };

  const products = await Product.find(find).lean();
  for (const product of products) {
    product.minPrice = ProductHelpers.getMinPrice(product.variants);
    product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
  }

  res.render('admin/products/index', {
    pageTitle: 'Quản lý sản phẩm',
    currentPage: 'products',
    products: products
  });
}