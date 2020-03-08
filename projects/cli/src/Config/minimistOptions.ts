export const minimistOptions = {
  string: ["config"],
  boolean: ["help", "version"],
  alias: {
    h: "help",
    v: "version"
  },
  default: {
    config: "skaf.config.js"
  }
};
