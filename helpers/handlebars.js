const ifEqual = function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

const add = function (a, b) {
  return a + b;
};

const setVar = function (value) {
  return value;
};

const JSONstringify = function (context) {
  return JSON.stringify(context);
};

const includes = function(array, value) {
  return array.includes(value);
};

const getFirstImage = function (images) {
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return '';
}

const getSecondImage = function (images) {
  if (Array.isArray(images) && images.length > 1) {
    return images[1];
  }
  return '';
}

const parseDate = function (date, format = 'DD/MM/YYYY') {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

module.exports = {
  ifEqual,
  add,
  setVar,
  JSONstringify,
  includes,
  getFirstImage,
  getSecondImage,
  parseDate
};
