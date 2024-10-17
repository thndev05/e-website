const ifEqual = (a, b, options) => {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};

const add = (a, b) => {
  return a + b;
};

module.exports = {
  ifEqual,
  add
};
