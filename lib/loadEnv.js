import { config } from "dotenv";
import { resolve } from "path";

let loaded = false;

export function loadEnv() {
  if (loaded) {
    return;
  }
  config({ path: resolve(process.cwd(), ".env.local") });
  config({ path: resolve(process.cwd(), ".env") });
  loaded = true;
}
