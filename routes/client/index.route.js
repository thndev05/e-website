const homeRoutes = require('./home.route');
const shopRouter = require('./shop.route');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const contactRoutes = require('./contact.route');
const productRoutes = require('./product.route');
const wishlistRoutes = require('./wishlist.route');


const authMiddleware = require('../../middlewares/client/auth.middleware');
const categoryMiddleware = require('../../middlewares/client/category.middleware');

module.exports = (app) => {
    app.use(authMiddleware.checkAuth);
    app.use(categoryMiddleware.category)

    app.use('/auth', authRoutes);

    app.use('/', authMiddleware.requireAuth, homeRoutes);
    app.use('/shop', authMiddleware.requireAuth, shopRouter);
    app.use('/user', authMiddleware.requireAuth, userRoutes);
    app.use('/contact', authMiddleware.requireAuth, contactRoutes);
    app.use('/wishlist',
      authMiddleware.requireAuth,
      wishlistRoutes
    );
    app.use('/product', authMiddleware.requireAuth, productRoutes);
}