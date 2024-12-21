const mongoose = require('mongoose');
const Order = require('../models/order.model');

module.exports.getMinPrice = (variants) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const price = Math.min(...variants.map(item => item.salePrice ? item.salePrice : item.price ));

  return price;
};

module.exports.getMaxPrice = (items) => {
  if (!items || items.length === 0) {
    return null;
  }

  const price = Math.max(...items.map(item => item.price));

  return price;
};

module.exports.generateSKU = (name, color, size) => {
  const namePart = name ? name.substring(0, 3).toUpperCase() : "";
  const colorPart = color ? color.substring(0, 3).toUpperCase() : "";
  const sizePart = size ? size.toUpperCase() : "";
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `${namePart}-${colorPart}-${sizePart}-${randomPart}`;
};

module.exports.extractVariantsFromReqBody = (body) => {
  const variants = [];

  Object.keys(body).forEach(key => {
    const variantRegex = /^variants\[(\d+)]\.(.*)$/;
    const match = key.match(variantRegex);

    if (match) {
      const index = match[1];
      const field = match[2];

      if (!variants[index]) {
        variants[index] = {};
      }

      variants[index][field] = body[key];
    }
  });

  if (body.files) {
    body.files.forEach(file => {
      const {fieldName, image} = file;

      const variantRegex = /^variants\[(\d+)]\.image$/;
      const match = fieldName.match(variantRegex);

      if (match) {
        const index = match[1];
        if (variants[index]) {
          variants[index].image = image;
        }
      }
    });
  }

  return variants;
}

module.exports.calculateProductSales = async (product) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$products' },
      { $match: { 'products.product': product._id } },
      {
        $group: {
          _id: '$products.product',
          totalSales: { $sum: '$products.quantity' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalSales : 0;
  } catch (error) {
    console.error('Error calculating product sales:', error);
    throw error;
  }
};
