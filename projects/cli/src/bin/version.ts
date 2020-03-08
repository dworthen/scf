import { PackageJsonLookup } from "@microsoft/node-core-library";

export function printVersion() {
  let packageJson = PackageJsonLookup.loadOwnPackageJson(__dirname);
  console.log(`Skaf Version ${packageJson.version}`);
}
