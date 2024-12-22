const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const ProductHelpers = require('../../helpers/product');
const searchHelper = require('../../helpers/search');
const {prefixAdmin} = require("../../config/system");
const {generateSKU} = require("../../helpers/product");
const FormError = require("../../error/FormError");


// [GET] /admin/products
module.exports.index = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.redirectPage = 'back';
    next(error);
  }
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
      });
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res, next) => {
  const { name, description, category, status, brand, tags, gender, subcategory } = req.body;

  try {
    const data = { name, description, category, status, brand, gender, subcategory};

    if (!name) {
      throw new FormError("Product name is empty!");
    }

    if (!brand) {
      throw new FormError("Product brand is empty!");
    }

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

    if (variants.length === 0) {
      throw new FormError("Product variants is empty!")
    }

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

    if (!findCategory) {
      throw new FormError("Please select category!")
    }

    data.variants = variants;
    data.category = findCategory._id;
    data.images = req.body.files.filter(obj => obj.fieldName === 'productImages').map(obj => obj.image);
    data.thumbnail = data.images[0];

    data.tags = tags ? JSON.parse(tags).map(item => item.value) : [];

    const product = new Product(data);
    await product.save();

    res.redirect(`${prefixAdmin}/products`);

  } catch (error) {
    console.error(error);
    next(error);
  }
}

// [GET] /admin/products/edit
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).lean();
    const productCategory = await Category.findById(product.category).lean();
    const listCategory = await Category.find({}).lean();

    res.render('admin/products/edit', {
      product: product,
      productCategory: productCategory,
      categories: listCategory,
      pageTitle: 'Update Product',
      currentPage: 'products',
      normalizedTags: product.tags ? product.tags.join(',') : "",
    });
  } catch (e) {
    console.log(e);
    res.redirect(`${prefixAdmin}/products`);
  }
}

// [PATCH] /admin/product/edit
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const oldProduct = await Product.findById(id).lean();

    const { name, description, category, status, isProductImagesChanged, brand, tags, gender, subcategory} = req.body;
    const data = { name, description, category, status, brand, gender, subcategory };

    const variants = ProductHelpers.extractVariantsFromReqBody(req.body);

    console.log("Origin variants: " + JSON.stringify(oldProduct.variants));
    console.log("Received variants: " + JSON.stringify(variants));

    for (let oldVariant of oldProduct.variants) {
      for (let newVariant of variants) {
        if (!newVariant) {
          continue;
        }

        if (newVariant.originalSKU === oldVariant.sku) {
          if (newVariant.isImageChanged === 'false') {
            newVariant.image = oldVariant.image;
          }

          const {oldName, oldColor, oldSize} = oldVariant;
          const {newName, newColor, newSize} = newVariant;

          if (oldName === newName && oldColor === newColor && oldSize === newSize) {
            newVariant.sku = oldVariant.sku;
          } else {
            newVariant.sku = ProductHelpers.generateSKU(newName, newColor, newSize);
          }
        }
      }
    }

    const findCategory = await Category.findOne({ name: data.category });
    data.category = findCategory._id;

    if (isProductImagesChanged === 'true') {
      data.images = req.body.files.filter(obj => obj.fieldName === 'productImages').map(obj => obj.image);
    } else {
      data.images = oldProduct.images;
    }

    data.variants = variants;

    data.thumbnail = data.images[0];

    data.tags = tags ? JSON.parse(tags).map(item => item.value) : [];

    await Product.updateOne({ _id: id }, data);

    console.log("Result variants: " + JSON.stringify(data.variants));

    res.redirect(`${prefixAdmin}/products`);
  } catch(e) {
    console.log(e);
    res.redirect(`${prefixAdmin}/products`);
  }
}