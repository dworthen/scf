import { load } from "../../Loader/load";
import { scaffold } from "../../Scaffolder/scaffold";
import shell from "shelljs";

jest.mock("path");

describe("Scaffolder", () => {
  test("Should throw when improperly called", () => {
    expect(() => {
      scaffold();
    }).toThrow();
    expect(() => {
      scaffold(5);
    }).toThrow();
    expect(() => {
      scaffold([5]);
    }).toThrow();
    expect(() => {
      scaffold(["hello"]);
    }).toThrow();
    expect(() => {
      scaffold([
        {
          name: "Derek"
        }
      ]);
    }).toThrow();
  });

  test("Should scaffold out project", () => {
    let files = load("./home/user/.scf/template1/", "./current/sub1/", [
      ".ignore",
      ".git"
    ]);

    scaffold(files);
    expect(shell.mkdir).toMatchSnapshot();
    expect(shell.ShellString).toMatchSnapshot();
    // expect(shell.ShellString.to).toMatchSnapshot();
  });
});
