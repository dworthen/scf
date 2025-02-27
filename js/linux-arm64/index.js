import path from "node:path";

export default function run() {
  const dirname = import.meta.dirname;
  const bin = path.join(dirname, "bin", "scf");
  return bin;
}
