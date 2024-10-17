module.exports.getMinPrice = (items) => {
  if (!items || items.length === 0) {
    return null;
  }

  const price = Math.min(...items.map(item => item.price));

  return price;
};

module.exports.getMaxPrice = (items) => {
  if (!items || items.length === 0) {
    return null;
  }

  const price = Math.max(...items.map(item => item.price));

  return price;
};
