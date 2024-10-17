const Product = require('../../models/product.model');

// [GET] /admin/products
module.exports.index = async (req, res) => {
  const find = {
    deleted: false
  };

  const products = await Product.find(find);

  console.log(products);

  res.render('admin/products/index', {
    pageTitle: 'Quản lý sản phẩm',
    currentPage: 'products',
    products: products
  });
}