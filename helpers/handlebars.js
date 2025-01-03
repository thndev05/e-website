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

const parseDateTime = function (date, format = 'DD/MM/YYYY hh:mm:ss') {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY hh:mm:ss':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'YYYY-MM-DD hh:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'MM/DD/YYYY hh:mm:ss':
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
};


const range = function (start, end) {
  const result = [];
  for (let i = Number(start); i <= Number(end); i++) {
    result.push(i);
  }
  return result;
}

const greaterThan = function (a, b) {
  return Number(a) > Number(b);
}

const multiplier = function (a, b) {
  return Number(a) * Number(b);
}


const currency = function (value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0; // Chuyển sang số nếu không phải số
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

const currencyUSD = function (value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

const getLast5Chars = function (str) {
    if (typeof str !== 'string')
        return '';

    return str.slice(-5);
};

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
  parseDate,
  parseDateTime,
  range,
  greaterThan,
  multiplier,
  currency,
  currencyUSD,
  getLast5Chars
};
