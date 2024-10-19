const Product = require('../../models/product.model');
const ProductHelpers = require('../../helpers/product');
const searchHelper = require('../../helpers/search');


// [GET] /admin/products
module.exports.index = async (req, res) => {
  const find = {
    deleted: false
  };

  const objectSearch = searchHelper(req.query);
  if(objectSearch.regex) {
    find.name = objectSearch.regex
  }

  const products = await Product.find(find).lean();
  for (const product of products) {
    product.minPrice = ProductHelpers.getMinPrice(product.variants);
    product.maxPrice = ProductHelpers.getMaxPrice(product.variants);
  }

  res.render('admin/products/index', {
    pageTitle: 'Quản lý sản phẩm',
    currentPage: 'products',
    products: products,
    searchKeyword: objectSearch.keyword
  });
}

// [DELETE] /admin/products/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await Product.updateOne({ _id: id}, { deleted: true }).lean();

  res.redirect('back');
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const id = req.params.id;
  const status = req.params.status;

  await Product.updateOne({ _id: id }, { status: status }).lean();

  res.redirect('back');
}

// [GET] /admin/products/create
module.exports.create = async (req, res) => {
  res.send('ok');
}