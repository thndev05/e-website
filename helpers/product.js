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

module.exports.generateSKU = (name, color, size) => {
  const namePart = name.substring(0, 3).toUpperCase();
  const colorPart = color.substring(0, 3).toUpperCase();
  const sizePart = size.toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `${namePart}-${colorPart}-${sizePart}-${randomPart}`;
};
