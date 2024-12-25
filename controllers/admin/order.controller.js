const User = require('../../models/user.model');
const Order = require('../../models/order.model');
const Product = require('../../models/product.model');


const { prefixAdmin } = require("../../config/system");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: "desc" }).lean();

    for (const order of orders) {
        const userID = order.userID;
        const user = await User.findById(userID).lean();

        if(user) {
            for (const item of order.products) {
                const product = await Product.findById({ _id: item.product });

                item.name = product.name;
                item.image = product.thumbnail;
            }

            order.customerName = user.fullName;
        }
    }


    res.render('admin/orders/index', {
        pageTitle: 'Orders Management',
        currentPage: 'orders',
        orders: orders
    });
}

// [PATCH] /admin/orders/change-status/:id/:status
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;

        await Order.updateOne({ _id: id }, { status: status });
        res.redirect(`${prefixAdmin}/orders`);
    } catch (e) {
        console.log(e);
        res.redirect(`${prefixAdmin}/orders`);
    }
}