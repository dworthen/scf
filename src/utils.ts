import fs from "fs";
import { promisify } from "util";

export const readFileAsync = promisify(fs.readFile);
export const writeFileAsync = promisify(fs.writeFile);

export interface Parameter {
  name: string;
  value: any;
}

export class FunctionParameter implements Parameter {
  public name: string;
  public value: any;
  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }
}
