import { load } from "../../Loader/load";

jest.mock("path");

describe("Loader", () => {
  test("should throw when improperly called", () => {
    expect(load).toThrow();
    expect(() => {
      load(5);
    }).toThrow();
    expect(() => {
      load("", 5);
    }).toThrow();
    expect(() => {
      load("", "", 5);
    }).toThrow();
    expect(() => {
      load("", "", [5]);
    }).toThrow();
  });

  test("should return list of directory items.", () => {
    let spie = jest.fn(load).mockName("Loader.load");
    spie("../home/user/", "../currentDirectory/sub1/", [".ignore", ".git"]);
    expect(spie).toMatchSnapshot();
    // let results = load("../home/user/", "../currentDirectory/sub1/", [
    //   ".ignore",
    //   ".git"
    // ]);
    // expect(results.length).toEqual(7);
    // expect(
    //   results.every(el => {
    //     return (
    //       /^\.\.\\|\/home\\|\/user$/.test(el.from) &&
    //       /^\.\.\\|\/currentDirectory\\|\/sub1$/.test(el.to)
    //     );
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return el.name === "dir1" && el.type === "directory";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^dir1\\|\/file1$/.test(el.name) && el.type === "file";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^dir1\\|\/file2$/.test(el.name) && el.type === "file";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^dir1\\|\/dir2$/.test(el.name) && el.type === "directory";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^dir1\\|\/dir2\\|\/file3$/.test(el.name) && el.type === "file";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^file4$/.test(el.name) && el.type === "file";
    //   })
    // ).toEqual(true);
    // expect(
    //   results.some(el => {
    //     return /^\.hidden$/.test(el.name) && el.type === "directory";
    //   })
    // ).toEqual(true);
  });
});
