module.exports.getMinPrice = (items) => {
  if (!items || items.length === 0) {
    return null;
  }

  const price = Math.min(...items.map(item => item.salePrice ? item.salePrice : item.price ));

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