const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const ProductHelpers = require('../../helpers/product');
const searchHelper = require('../../helpers/search');
const {prefixAdmin} = require("../../config/system");


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
  const categoryFilter = {
    deleted: false,
  }

  Category.find(categoryFilter)
      .lean()
      .then(categories => {
        res.render('admin/products/create', {
          pageTitle: 'Add Product',
          currentPage: 'products',
          categories: categories,
        });
      })
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  const { name, description, category, status } = req.body;
  const data = { name, description, category, status };

  const variants = [];

  Object.keys(req.body).forEach(key => {
    const variantRegex = /^variants\[(\d+)\]\.(.*)$/;
    const match = key.match(variantRegex);

    if (match) {
      const index = match[1];
      const field = match[2];

      if (!variants[index]) {
        variants[index] = {};
      }

      variants[index][field] = req.body[key];
    }
  });


  req.body.files.forEach(file => {
    const { fieldName, image } = file;

    const variantRegex = /^variants\[(\d+)\]\.image$/;
    const match = fieldName.match(variantRegex);

    if (match) {
      const index = match[1];
      if (variants[index]) {
        variants[index].image = image;
      }
    }
  });


  const findCategory = await Category.findOne({ name: data.category });
  data.variants = variants;
  data.category = findCategory._id;
  data.images = req.body.files.filter(obj => obj.fieldName === 'productImages').map(obj => obj.image);
  data.thumbnail = data.images[0];

  const product = new Product(data);
  await product.save();

  res.redirect(`${prefixAdmin}/products`);
}

// [GET] /admin/products/edit
module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id).lean();
  const productCategory = await Category.findById(product.category);
  const listCategory = await Category.find({});


  res.render('admin/products/edit', {
    product: product,
    productCategory: productCategory,
    categories: listCategory,
    pageTitle: 'Update Product',
    currentPage: 'products'
  });
}