const Category = require('../../models/category.model');

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
module.exports.store = (req, res) => {
    res.json("POSTING")
}