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


module.exports = {
  ifEqual,
  add,
  setVar,
  JSONstringify,
  includes,
  getFirstImage,
  getSecondImage
};
