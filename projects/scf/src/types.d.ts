import type { Stats } from "fs";

declare global {  
  type FileObj = {
    from: string;
    to: string;
    relativePath: string;
    stats: Stats;
    contents?: string;
    [key: string]: any;
  };
  
  // type plugin = (next: plugin, file: FileObj): FileObj;
  type Plugin = (next: PluginPipeline, file: FileObj) => Promise<FileObj>;
  
  type PluginPipeline = (file: FileObj) => Promise<FileObj>;
}
