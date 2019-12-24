// const path = jest.genMockFromModule("path");

// const p = jest.requireActual("path");

// const replacePathSeperator = fn => {
//   return s => {
//     return fn(s).replace(/\\/g, "/");
//   };
// };

// path.normalize = jest
//   .fn(replacePathSeperator(p.normalize))
//   .mockName("path.normalize");

// path.join = jest.fn(replacePathSeperator(p.join)).mockName("path.join");

// path.resolve = jest
//   .fn(replacePathSeperator(p.resolve))
//   .mockName("path.resolve");

// module.exports = path;

// jest.mock("path", () => {
const p = jest.requireActual("path");

const replacePathSeperator = fn => {
  return s => {
    return fn(s).replace(/\\/g, "/");
  };
};

const applyFn = fn => {
  return (...args) => {
    return fn.apply(p, args).replace(/\\/g, "/");
  };
};

const normalize = jest.fn(applyFn(p.normalize)).mockName("path.normalize");

const join = jest.fn(applyFn(p.join)).mockName("path.join");

const resolve = jest.fn(applyFn(p.resolve)).mockName("path.resolve");

module.exports = {
  ...p,
  normalize,
  join,
  resolve
};
// });
