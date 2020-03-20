import * as os from "os";
import * as path from "path";

export const homeOrTemp = os.homedir() || os.tmpdir();

export const globalSkafDirectory = path.join(homeOrTemp, ".skaf");
