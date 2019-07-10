// @ts-nocheck

import { scaffold } from "../src/scaffold";
import shell from "shelljs";
import path from "path";

const scaffoldPath = path.join(__dirname, "assets/scaffold/test.txt");

describe("Scaffold", () => {
  beforeAll(() => {
    shell.rm("-rf", scaffoldPath);
  });

  afterAll(() => {
    shell.rm("-rf", scaffoldPath);
  });

  test("Should throw when improperly called", async () => {
    expect(scaffold()).rejects.toThrow();
    expect(scaffold(5)).rejects.toThrow();
    expect(scaffold("cool")).rejects.toThrow();
    expect(scaffold("cool", 5)).rejects.toThrow();
  });

  test("Should create file", async () => {
    // shell.mkdir("-p", path.dirname(scaffoldPath));
    await scaffold(scaffoldPath, "Hello World!");
    let contents = shell.cat(scaffoldPath).toString();
    expect(contents).toBe("Hello World!");
  });

  test("Should overwrite file", async () => {
    expect(shell.test("-e", scaffoldPath)).toBe(true);
    await scaffold(scaffoldPath, "New Content");
    let contents = shell.cat(scaffoldPath).toString();
    expect(contents).toBe("New Content");
  });
});
