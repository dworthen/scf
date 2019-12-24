const shell = jest.genMockFromModule("shelljs");

shell.ls = jest
  .fn(() => {
    return [
      "dir1/",
      "dir1/file1",
      "dir1/file2",
      "./dir1/dir2/",
      "dir1/dir2/file3",
      "file4",
      ".hidden",
      ".ignore",
      ".ignore/file1",
      ".git"
    ];
  })
  .mockName("shell.ls");
shell.test = jest
  .fn((opts, filePath) => {
    const isFile = /file\d+$/i.test(filePath);
    console.log(filePath);
    if (/d/.test(opts)) {
      return !isFile;
    } else if (/f/.test(opts)) {
      return isFile;
    } else if (/e/.test(opts)) {
      return false;
    }
  })
  .mockName("shell.test");
shell.cat = jest
  .fn(fullPath => {
    return `Contents for ${fullPath}`;
  })
  .mockName("shell.cat");
shell.mkdir = jest.fn().mockName("shell.mkdir");
shell.ShellString = jest
  .fn(contents => {
    return {
      to: jest
        .fn(path => {
          return {
            destination: path,
            contents
          };
        })
        .mockName("shell.ShellString.to")
    };
  })
  .mockName("shell.ShellString");

module.exports = shell;
