const Category = require("../../models/category.model");

module.exports.category = async (req, res, next) => {
  const categories = await Category.find({
    deleted: false
  }).sort({ position: 'asc' }).lean();

  res.locals.categories = categories;

  next();
}