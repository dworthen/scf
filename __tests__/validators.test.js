import {
  notNull,
  instanceOf,
  typeOf,
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  isError
} from "../src/validators";
import { FunctionParameter } from "../src/utils";

describe("Validators", () => {
  describe("notNull", () => {
    test("should return true when not null", () => {
      const param = new FunctionParameter("name", "Derek");
      expect(notNull(param)).toBe(true);
    });
    test("should return error string when null", () => {
      const param = new FunctionParameter("name", null);
      const res = notNull(param);
      expect(typeof res).toBe("string");
      const [isErr, err] = isError(res);
      expect(isErr).toBe(true);
      expect(err instanceof Error).toBe(true);
    });
  });
});
