import shell from "shelljs";
import { loadSkafTemplate } from "./loadSkafTemplate";
import * as path from "path";

jest.mock("shelljs");

describe("loadSkafTemplate", () => {
  test("should throw when called with unsupported arguments", () => {
    expect(loadSkafTemplate).toThrow();
    expect(() => {
      loadSkafTemplate(5);
    }).toThrow();
    expect(() => {
      loadSkafTemplate("", 5);
    }).toThrow();
  });

  test("should return list of files and directory items.", async () => {
    // Arrange
    let from = "./currentDirectory";
    let to = "../../newDirectory";
    let lsStub = jest.fn();
    lsStub.mockReturnValue(["dir1/", "dir1/file1", "file2", ".hidden"]);

    let testStub = jest.fn();
    testStub.mockImplementation((type, path) => {
      let reg = /dir\d*(\\|\/)?$/gi;
      let result = reg.test(path);
      return type === "-d" ? result : !result;
    });

    let cat = jest.fn();
    cat.mockReturnValue("Hello");

    shell.ls = lsStub;
    shell.test = testStub;
    shell.cat = cat;

    // Act
    let files = loadSkafTemplate(from, to);

    // Assert
    let expectedPaths = {
      from: path.normalize(from),
      to: path.normalize(to)
    };
    expect(files).toEqual([
      {
        ...expectedPaths,
        type: "directory",
        name: "dir1"
      },
      {
        ...expectedPaths,
        name: path.normalize("dir1/file1"),
        type: "file",
        contents: "Hello"
      },
      {
        ...expectedPaths,
        name: "file2",
        type: "file",
        contents: "Hello"
      },
      {
        ...expectedPaths,
        name: ".hidden",
        type: "file",
        contents: "Hello"
      }
    ]);
  });
});
