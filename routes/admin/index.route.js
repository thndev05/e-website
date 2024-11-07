const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashboard.route');
const productRoutes = require('./product.route');
const categoryRoutes = require('./category.route');
const roleRoutes = require('./role.route');
const accountRoutes = require('./account.route');
const authRoutes = require('./auth.route');



module.exports = (app) => {
  const prefixAdmin = systemConfig.prefixAdmin;

  app.use(prefixAdmin + '/', dashboardRoutes);

  app.use(prefixAdmin + '/products', productRoutes);

  app.use(prefixAdmin + '/categories', categoryRoutes);

  app.use(prefixAdmin + '/roles', roleRoutes);

  app.use(prefixAdmin + '/accounts', accountRoutes);

  app.use(prefixAdmin + '/auth', authRoutes);
}