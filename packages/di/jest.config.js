module.exports = {
  displayName: "core",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  coverageDirectory: "../../coverage/packages/core",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
};
