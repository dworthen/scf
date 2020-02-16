type FileType = "file" | "directory" | "unknown";

type FileObj = {
  from: string;
  to: string;
  name: string;
  type: FileType;
  contents?: string;
  [key: string]: any;
};

// type plugin = (next: plugin, file: FileObj): FileObj;
type Plugin = (next: PluginPipeline, file: FileObj) => Promise<FileObj>;

type PluginPipeline = (file: FileObj) => Promise<FileObj>;
