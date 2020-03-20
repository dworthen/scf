import type { Stats } from "fs";

export type FileObj = {
  from: string;
  to: string;
  relativePath: string;
  name: string;
  stats: Stats;
  contents?: string;
  format: boolean;
  [key: string]: any;
};

export interface SkafConfig {
  ignore?: string[];
  localTemplateDirectory?: string;
  plugins?: Plugin[];
  formatter?: Formatter;
  [key: string]: any;
}

export type Formatter = (file: FileObj) => Promise<string>;

export type Plugin = (next: PluginPipeline, file: FileObj) => Promise<FileObj|undefined|null>;

export type PluginPipeline = (file: FileObj) => Promise<FileObj|null|undefined>;
