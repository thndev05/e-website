const homeRoutes = require('./home.route');
const shopRouter = require('./shop.route');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const contactRoutes = require('./contact.route');
const productRoutes = require('./product.route');


const authMiddleware = require('../../middlewares/client/auth.middleware');
const categoryMiddleware = require('../../middlewares/client/category.middleware');

module.exports = (app) => {
    app.use(authMiddleware.checkAuth);
    app.use(categoryMiddleware.category)

    app.use('/', homeRoutes);
    app.use('/auth', authRoutes);
    app.use('/shop', shopRouter);
    app.use('/user', userRoutes);
    app.use('/contact', contactRoutes);
    app.use('/product', productRoutes);

}