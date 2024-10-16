const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashboard.route');

module.exports = (app) => {
  const prefixAdmin = systemConfig.prefixAdmin;

  app.use(prefixAdmin + '/', dashboardRoutes);
}