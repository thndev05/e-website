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
module.exports.createPost = (req, res) => {
    console.log(req.body); // Problem: nhan object rong
    res.send('ok');
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