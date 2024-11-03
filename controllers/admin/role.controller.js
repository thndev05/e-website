const Role = require('../../models/role.model');
const {prefixAdmin} = require("../../config/system");

// [GET] /admin/roles
module.exports.index = async(req, res) => {
  const find = {
    deleted: false
  }

  const roles = await Role.find(find).lean();

  res.render('admin/roles/index', {
    pageTitle: 'Roles Management',
    currentPage: 'roles',
    roles: roles,
  })
}
