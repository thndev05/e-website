const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
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
  // const name = req.body.name;
  // const description = req.body.description;
  // const category = req.body.category;
  // const status = req.body.status;
  // const images = req.body.productImages;
  //
  // const variants = [];
  //
  // console.log(req.body.variantName);
  //
  // if (Array.isArray(req.body.variantName)) {
  //   req.body.variantName.forEach((variantName, index) => {
  //     variants.push({
  //       name: variantName,
  //       color: req.body.variantColor[index],
  //       size: req.body.variantSize[index],
  //       price: req.body.variantPrice[index],
  //       stock: req.body.variantStock[index],
  //       image: req.body.variantImage[index],
  //     });
  //   });
  // } else {
  //   variants.push({
  //     name: req.body.variantName,
  //     color: req.body.variantColor,
  //     size: req.body.variantSize,
  //     price: req.body.variantPrice,
  //     stock: req.body.variantStock,
  //     image: req.body.variantImage,
  //   });
  // }
  //
  // res.send(`${name}, ${description}, ${category} ${status} ${images}, ` + JSON.stringify(variants));

  console.log(req.body);

  const { name, description, category, status } = req.body;


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


  console.log('Product Name:', name);
  console.log('Description:', description);
  console.log('Category:', category);
  console.log('Status:', status);


  console.log('Variants:', variants);


  res.send('Product added successfully!');
}