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

const subtract = function (a, b) {
  return a - b;
}

const max = function (a, b) {
  return Math.max(Number(a), Number(b));
}

const min = function (a, b) {
  return Math.min(Number(a), Number(b));
}

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

const range = function (start, end) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

const greaterThan = function (a, b) {
  return Number(a) > Number(b);
}


module.exports = {
  ifEqual,
  add,
  subtract,
  max,
  min,
  setVar,
  JSONstringify,
  includes,
  getFirstImage,
  getSecondImage,
  range,
  greaterThan,
};
