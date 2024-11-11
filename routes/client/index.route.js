const homeRoutes = require('./home.route');
const shopRouter = require('./shop.route');
const categoryMiddleware = require('../../middlewares/client/category.middleware');

module.exports = (app) => {
    app.use(categoryMiddleware.category)

    app.use('/', homeRoutes);
    app.use('/shop', shopRouter);
}