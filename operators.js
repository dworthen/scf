module.exports = {
  eq: function(val1, val2) {
    return val1 === val2;
  },
  neq: function(val1, val2) {
    return val1 !== val2;
  },
  gt: function(val1, val2) {
    return val1 > val2;
  },
  gte: function(val1, val2) {
    return val1 >= val2;
  },
  lt: function(val1, val2) {
    return val1 < val2;
  },
  lte: function(val1, val2) {
    return val1 <= val2;
  }
};
