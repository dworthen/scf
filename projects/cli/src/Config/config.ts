import minimist, { ParsedArgs } from "minimist";
import findUp from "find-up";
import path from "path";
import type { SkafConfig } from "@skaf/skaf";

function _loadConfig() {
  let argv = minimist(process.argv.slice(2));

  let config: SkafConfig | null = null;

  return async (): Promise<SkafConfig> => {
    if (!config) {
      // Global config
      config = await loadSkafConfig(argv);

      // Local Config
      Object.assign(config, await loadLocalConfig(argv));
    }

    return config;
  };
}

export let loadConfig = _loadConfig();

export async function getAbsoluteProjectRootPath(argv: ParsedArgs) {
  let localConfigPath = await findUp(argv.config);
  let localPackageJsonPath = await findUp("package.json");
  return localConfigPath || localPackageJsonPath || process.cwd();
}

export type SkafConfigFunction = (argv: ParsedArgs) => SkafConfig;

async function loadSkafConfig(
  argv: ParsedArgs,
  configFile: string = path.join(__dirname, "default.skaf.config.js")
): Promise<SkafConfig> {
  let config: SkafConfig | null = null;
  let defaultConfig:
    | SkafConfigFunction
    | SkafConfig = await require(configFile);

  if (configIsFunction(defaultConfig)) {
    config = defaultConfig(argv);
  } else {
    config = defaultConfig;
  }
  return config;
}

async function loadLocalConfig(argv: ParsedArgs) {
  if (argv.config) {
    let localConfigPath = await findUp(argv.config);
    if (localConfigPath) {
      return await loadSkafConfig(argv, localConfigPath);
    }
  }
  return {};
}

function configIsFunction(
  config: SkafConfigFunction | SkafConfig
): config is SkafConfigFunction {
  return typeof config === "function";
}
