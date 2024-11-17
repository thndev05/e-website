const User = require('../../models/user.model');
const productHelper = require('../../helpers/product');

// [GET] /wishlist/
module.exports.wishlist = async (req, res) => {
    let wishlists = [];
    if (res.locals.user) {
        const id = res.locals.user.id;
        const user = await User.findOne({ _id: id }).populate('wishlist').lean();
        wishlists = user.wishlist;
    }

    for (const item of wishlists) {
      item.minPrice = productHelper.getMinPrice(item.variants);
    }

    res.render('client/wishlist/index', {
        pageTitle: 'Wishlist',
        breadcrumbTitle: 'Wishlist',
        breadcrumb: 'Wishlist',
        wishlists: wishlists
    });
}

// [POST] /wishlist/add
module.exports.addToWishlist = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const { productId } = req.body;

        const user = await User.findById(userId);

        const isProductInWishlist = user.wishlist.includes(productId);

        if (isProductInWishlist) {
            return res.json({ success: false, message: 'Product was exist in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'An error has occurred, please try again!' });
    }
};