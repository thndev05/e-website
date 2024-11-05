const Account = require('../../models/account.model');
const Role = require('../../models/role.model');
const { prefixAdmin } = require("../../config/system");

const bcrypt = require('bcrypt');

// [GET] /admin/accounts
module.exports.index = async (req, res) => {
  const filter = {
    deleted: false,
  }

  const accounts = await Account.find(filter).lean();
  for (const account of accounts) {
    const role = await Role.findById({ _id: account.role });

    if (!role) {
      account.roleName = 'null';
    } else {
      account.roleName = role.name;
    }
  }

  res.render('admin/accounts/index', {
    pageTitle: 'Accounts Management',
    currentPage: 'accounts',
    accounts: accounts,
  });
}

// [PATCH] /admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const id = req.params.id;
  const status = req.params.status;

  await Account.updateOne({ _id: id }, { status: status });

  res.redirect(`${prefixAdmin}/accounts`);
}

// [DELETE] /admin/accounts/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await Account.updateOne({ _id: id }, { deleted: true });

  res.redirect(`${prefixAdmin}/accounts`);
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {

  const roles = await Role.find({
    deleted: false,
    status: 'active'
  }).lean();

  res.render('admin/accounts/create', {
    pageTitle: 'Create Account',
    currentPage: 'accounts',
    roles: roles,
  })
}

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  try {
    const { name, email, password, role, status, files } = req.body;
    const data = { name, email, password, role, status };

    data.password = await bcrypt.hash(data.password, 12);
    if(files) {
      data.avatar = files[0].image;
    }

    const account = new Account(data);
    await account.save();

    res.redirect(`${prefixAdmin}/accounts`);
  } catch (err) {
    console.log(err);
    res.redirect(`${prefixAdmin}/accounts`);
  }
}

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const account = await Account.findOne({ _id: id }).select('-password').lean();

    const roles = await Role.find({
      deleted: false,
      status: 'active'
    }).lean();

    res.render('admin/accounts/edit', {
      pageTitle: 'Update Account',
      currentPage: 'accounts',
      roles: roles,
      account: account
    })
  } catch(err) {
    console.log(err);
    res.redirect(`${prefixAdmin}/accounts`);
  }
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  try {

    console.log(req.body);

    const id = req.params.id;
    const { name, email, password, role, status, files } = req.body;
    const data = { name, email, password, role, status };

    if(req.body.password !== '') {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }

    if(files) {
      data.avatar = files[0].image;
    }

    console.log(data)

    await Account.updateOne({ _id: id }, data);

    res.redirect(`${prefixAdmin}/accounts`);
  } catch (err) {
    console.log(err);
    res.redirect(`${prefixAdmin}/accounts`);
  }
}