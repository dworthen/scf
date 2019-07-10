import { Parameter } from "./utils";

export const notNull = (v1: Parameter) => {
  return (
    (v1.value !== undefined && v1.value !== null) ||
    `${v1.name} is null or undefined.`
  );
};
export const instanceOf = (v1: Parameter, v2: Parameter) => {
  return (
    v1.value instanceof v2.value || `${v1.name} is not instanceof ${v2.name}`
  );
};
export const typeOf = (v1: Parameter, v2: string) => {
  return typeof v1.value === v2 || `${v1.name} is not typeof ${v2}`;
};
export const eq = (v1: Parameter, v2: Parameter) => {
  return v1 === v2 || `${v1.toString()} does not equal ${v2.toString()}`;
};
export const neq = (v1: Parameter, v2: Parameter) => {
  return v1.value !== v2.value || `${v1.name} is equal to ${v2.name}`;
};

export const gt = (v1: Parameter, v2: Parameter) => {
  return v1.value > v2.value || `${v1.name} is not greater than ${v2.name}`;
};
export const gte = (v1: Parameter, v2: Parameter) => {
  return (
    v1.value >= v2.value ||
    `${v1.name} is not greater than or equal to ${v2.name}`
  );
};
export const lt = (v1: Parameter, v2: Parameter) => {
  return v1.value < v2.value || `${v1.name} is not less than ${v2.name}`;
};
export const lte = (v1: Parameter, v2: Parameter) => {
  return (
    v1.value <= v2.value || `${v1.name} is not less than or equal to ${v2.name}`
  );
};

export const isError = (input: boolean | string): [boolean, Error?] => {
  if (typeof input === "string") {
    return [true, new Error(input)];
  }
  return [false];
};
