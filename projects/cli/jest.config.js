// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: "node",
  preset: "ts-jest/presets/js-with-babel",
  globals: {
    "ts-jest": {
      packageJson: "package.json"
    }
  }
};
