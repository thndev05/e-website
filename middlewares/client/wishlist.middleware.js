const User = require('../../models/user.model');

module.exports.getWishlist = async (req, res, next) => {
  try {
    const userId = res.locals.user._id;
    let wishlistIds = [];

    if (userId) {
        const user = await User.findById(userId).populate('wishlist').lean();
        wishlistIds = user.wishlist.map(item => item._id.toString());
    }

    res.locals.wishlist = wishlistIds;

    console.log(wishlist);

  } catch (error) {
    console.error('Lỗi khi lấy wishlist:', error);
  }

  next();
};
