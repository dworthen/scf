export const minimistOptions = {
  string: ["config"],
  boolean: ["version", "help", "force", "global", "install"],
  alias: {
    v: "version",
    h: "help",
    f: "force",
    i: "install",
    g: "global"
  },
  default: {
    config: "skaf.config.js"
  }
};
