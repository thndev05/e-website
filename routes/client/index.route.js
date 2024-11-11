const homeRoutes = require('./home.route');
const shopRouter = require('./shop.route');
const authRoutes = require('./auth.route');

const categoryMiddleware = require('../../middlewares/client/category.middleware');

module.exports = (app) => {
    app.use(categoryMiddleware.category)

    app.use('/', homeRoutes);
    app.use('/auth', authRoutes);
    app.use('/shop', shopRouter);
}