const Category = require('../../models/category.model');
const {prefixAdmin} = require("../../config/system");

// [GET] /admin/categories
module.exports.index = (req, res) => {
    const filter = {
        deleted: false,
    }

    Category.find(filter).lean().then(categories => {
        res.render('admin/categories/index', {
            pageTitle: 'Categories Management',
            currentPage: 'categories',
            categories: categories,
        });
    })
}

// [GET] /admin/categories/create
module.exports.create = (req, res) => {
    res.render('admin/categories/create', {
        pageTitle: 'Create Category',
        currentPage: 'categories',
    });
}

// [POST] /admin/categories/create
module.exports.createPost = async (req, res) => {
    const category = new Category(req.body);
    await category.save();

    res.redirect(`${prefixAdmin}/categories`);
}

// [DELETE] /admin/products/delete/:id
module.exports.delete = async (req, res) => {
    const id = req.params.id;

    await Category.updateOne({ _id: id}, { deleted: true }).lean();

    res.redirect('back');
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const id = req.params.id;
    const status = req.params.status;

    await Category.updateOne({ _id: id }, { status: status }).lean();

    res.redirect('back');
}

// [GET] /admin/categories/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findOne({ _id: id }).lean();

        res.render('admin/categories/edit', {
            pageTitle: 'Update Category',
            currentPage: 'categories',
            category: category
        });
    } catch {
        res.redirect(`${prefixAdmin}/categories`);
    }
}

// [PATCH] /admin/categories/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    await Category.updateOne({ _id: id }, req.body);

    res.redirect(`${prefixAdmin}/categories`);
}