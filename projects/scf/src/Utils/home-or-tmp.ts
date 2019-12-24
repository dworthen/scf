import os from "os";

export const homeOrTemp = os.homedir() || os.tmpdir();

export default homeOrTemp;
