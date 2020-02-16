import { buildPluginPipeline } from "./buildPlugnPipeline";

describe("buildPluginPipeline", () => {
  test("should throw when called with unsupported arguments", () => {
    expect(buildPluginPipeline.bind(null, "")).toThrow();
    expect(buildPluginPipeline.bind(null, "Hello")).toThrow();
    expect(buildPluginPipeline.bind(null, 5)).toThrow();
    expect(buildPluginPipeline.bind(null, [""])).toThrow();
  });

  test("should return identity function when called with no plugins.", async () => {
    // Arrange
    let fileObj = {
      from: "currentDirectory",
      to: "newDirectory",
      name: "filename",
      type: "file"
    };
    let pipeline = buildPluginPipeline();

    // Act
    let newFileObj = await pipeline({ ...fileObj });

    // Assert
    expect(newFileObj).toEqual(fileObj);
  });

  test("should run a fileObj through all the plugins.", async () => {
    // Arrange
    let fileObj = {
      from: "currentDirectory",
      to: "newDirectory",
      name: "filename",
      type: "file",
      contents: "world"
    };
    let plugin1 = async (next, file) => {
      file.contents = `Hello ${file.contents}`;
      Object.assign(file, await next(file));
      file.contents += "!";
      return file;
    };
    let plugin2 = async (next, file) => {
      file.contents = `Not ${file.contents}`;
      Object.assign(file, await next(file));
      file.contents += "...";
      return file;
    };
    let pipeline = buildPluginPipeline([plugin1, plugin2]);

    // Act
    let newFileObj = await pipeline({ ...fileObj });

    // Assert
    expect(newFileObj).toEqual({ ...fileObj, contents: "Not Hello world...!" });
  });
});
