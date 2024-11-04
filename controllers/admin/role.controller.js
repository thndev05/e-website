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

// [PATCH] /admin/roles/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const id = req.params.id;
  const status = req.params.status;

  await Role.updateOne({ _id: id }, { status: status });

  res.redirect(`${prefixAdmin}/roles`);
}

// [DELETE] /admin/roles/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await Role.updateOne({ _id: id }, { deleted: true });

  res.redirect(`${prefixAdmin}/roles`);
}

// [GET] /admin/roles/create
module.exports.create = (req, res) => {
  res.render('admin/roles/create', {
    pageTitle: 'Create Role',
    currentPage: 'roles',
  });
}

// [POST] /admin/roles/create
module.exports.createPost = async(req, res) => {
  const { name, description, status } = req.body;
  const data = { name, description, status };

  const role = new Role(data);
  await role.save();

  res.redirect(`${prefixAdmin}/roles`);
}

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id }).lean();

    res.render('admin/roles/edit', {
      pageTitle: 'Update Role',
      currentPage: 'roles',
      role: role,
    });
  } catch (error) {
    console.log(error);
  }
}

// [PATCH] /admin/roles/edit/:id
module.exports.editPost = async(req, res) => {
  const id = req.params.id;
  const { name, description, status } = req.body;
  const data = { name, description, status };

  await Role.updateOne({ _id: id }, data);

  res.redirect(`${prefixAdmin}/roles`);
}

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  const documents = await Role.find({ deleted: false, status: 'active'}).lean();

  res.render('admin/roles/permissions', {
    pageTitle: 'Decentralize Permissions',
    currentPage: 'roles',
    documents: documents
  });
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  const data = JSON.parse(req.body.permissions);

  for (const item of data) {
    await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
  }

  res.redirect('back');
}