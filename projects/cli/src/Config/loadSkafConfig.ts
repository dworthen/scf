import type { ParsedArgs } from "minimist"
import * as path from 'path';

export interface SkafConfig {
  ignore: string[];
}

export type SkafConfigFunction = (argv: ParsedArgs) => SkafConfig;

export async function loadSkafConfig(argv: ParsedArgs, configFile: string = path.join(__dirname, "default.skaf.config.js")): Promise<SkafConfig> {
  let config: SkafConfig | null = null;
  let defaultConfig: SkafConfigFunction | SkafConfig = await require(configFile);
  if(configIsFunction(defaultConfig)) {
    config = defaultConfig(argv);
  } else {
    config = defaultConfig;
  }
  return config;
}

function configIsFunction(config: SkafConfigFunction | SkafConfig): config is SkafConfigFunction {
  return typeof config === "function";
}