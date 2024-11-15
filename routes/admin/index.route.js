const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashboard.route');
const productRoutes = require('./product.route');
const categoryRoutes = require('./category.route');
const roleRoutes = require('./role.route');
const accountRoutes = require('./account.route');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');

const authMiddleware = require('../../middlewares/admin/auth.middleware');


module.exports = (app) => {
  const prefixAdmin = systemConfig.prefixAdmin;

  app.use(prefixAdmin + '/dashboard',
    authMiddleware.requireAuth,
    dashboardRoutes
  );

  app.use(prefixAdmin + '/products',
    authMiddleware.requireAuth,
    productRoutes
  );

  app.use(prefixAdmin + '/categories',
    authMiddleware.requireAuth,
    categoryRoutes
  );

  app.use(prefixAdmin + '/roles',
    authMiddleware.requireAuth,
    roleRoutes
  );

  app.use(prefixAdmin + '/accounts',
    authMiddleware.requireAuth,
    accountRoutes
  );

  app.use(prefixAdmin + '/users',
    authMiddleware.requireAuth,
    userRoutes
  );

  app.use(prefixAdmin + '/auth', authRoutes);
}