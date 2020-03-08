export const minimistOptions = {
  string: ["config"],
  boolean: ["help", "version", "force"],
  alias: {
    h: "help",
    v: "version",
    f: "force"
  },
  default: {
    config: "skaf.config.js"
  }
};
