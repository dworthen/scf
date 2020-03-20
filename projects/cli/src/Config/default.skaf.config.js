module.exports = argv => {
  return {
    localTemplateDirectory: ".skaf",
    ignore: ["node_modules", ".git", "skaf.config.js"],
    formatter: async function(fileObj) {
      return fileObj.contents;
    }
  };
};
