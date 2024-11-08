module.exports.dashboard = (req, res) => {
  res.render('admin/dashboard/index', {
    pageTitle: 'Dashboard',
    currentPage: 'dashboard'
  });
}