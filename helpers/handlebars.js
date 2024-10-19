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

module.exports = {
  ifEqual,
  add,
  setVar
};
