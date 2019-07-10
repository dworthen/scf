import path from "path";
import {
  localTemplatePath,
  getTemplatesPath,
  globalScfPath,
  globalTemplatePath
} from "../src/utils";
import shell from "shelljs";

describe("Utils", () => {
  describe("localTempPath", () => {
    test("should return the path for the local templates director", async () => {
      let localTempPath = await localTemplatePath(
        path.join(__dirname, "assets/utils/.scf"),
        "create-app"
      );
      expect(localTempPath).toMatch(/\.scf(\/|\\)create-app(\/|\\)?$/);
    });
    test("should return undefined if no local templates path", async () => {
      const [p1, p2] = [
        path.join(__dirname, "assets/utils/.scf"),
        path.join(__dirname, "assests/utils/.404")
      ];
      let [r1, r2] = await Promise.all([
        localTemplatePath(p1, "404"),
        localTemplatePath(p2, "create-app")
      ]);
      expect(r1).toBeUndefined();
      expect(r2).toBeUndefined();
    });
  });

  describe("getTemplatesPath", () => {
    test("should return local templates path if found.", async () => {
      let localTempPath = await getTemplatesPath(
        path.join(__dirname, "assets/utils/.scf"),
        "create-app"
      );
      expect(localTempPath).toMatch(/\.scf(\\|\/)create-app(\\|\/)?$/);
    });
    test("should return globalTemplatesPath if local path is not found", async () => {
      const [globalPath1, globalPath2] = [
        globalTemplatePath("404"),
        globalTemplatePath("create-app")
      ];
      const [p1, p2] = [
        path.join(__dirname, "assets/utils/.scf"),
        path.join(__dirname, "assests/utils/.404")
      ];
      let [r1, r2] = await Promise.all([
        getTemplatesPath(p1, "404"),
        getTemplatesPath(p2, "create-app")
      ]);
      expect(r1).toBe(globalPath1);
      expect(r2).toBe(globalPath2);
    });
  });
});
