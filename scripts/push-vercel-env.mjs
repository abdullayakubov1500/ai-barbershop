import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { resolve } from "path";

const keys = process.argv.slice(2);
const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    })
);

for (const key of keys) {
  const value = String(env[key] || "").trim();
  if (!value) {
    console.log(`skip empty ${key}`);
    continue;
  }
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "vercel",
      "env",
      "add",
      key,
      "--environment",
      "production,preview,development",
      `--value=${value}`,
      "--yes",
      "--force",
      "--sensitive",
    ],
    { stdio: "inherit", shell: true }
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
