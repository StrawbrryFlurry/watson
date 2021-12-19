const { readdirSync } = require("fs");

const packagesRoot = "./packages/";
const packages = readdirSync(packagesRoot).map(
  (package) => `${packagesRoot}/${package}/src/index.ts`
);

module.exports = {
  tsconfig: "./tsconfig.json",
  entryPoints: ["./packages/common/src/index.ts"],
  excludeExternals: true,
  json: "./docs.json",
};
