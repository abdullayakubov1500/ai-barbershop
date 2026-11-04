import { spawn } from "child_process";

const URL_RE = /https:\/\/[a-z0-9-]+\.(trycloudflare\.com|cfargotunnel\.com)/i;
const isWin = process.platform === "win32";

function spawnCmd(command, args, options = {}) {
  return spawn(command, args, {
    ...options,
    shell: isWin,
    env: { ...process.env, ...options.env },
  });
}

function startTunnel() {
  return new Promise((resolve, reject) => {
    const child = spawnCmd(isWin ? "npx.cmd" : "npx", [
      "--yes",
      "cloudflared",
      "tunnel",
      "--url",
      "http://localhost:3000",
    ]);

    let found = "";
    const onChunk = (buf) => {
      const text = buf.toString();
      process.stderr.write(text);
      const match = text.match(URL_RE);
      if (match && !found) {
        found = match[0];
        resolve({ url: found, child });
      }
    };

    child.stdout.on("data", onChunk);
    child.stderr.on("data", onChunk);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (!found) {
        reject(new Error(`Туннель завершился с кодом ${code}`));
      }
    });
  });
}

const { url, child: tunnel } = await startTunnel();
const webAppUrl = `${url}/mini`;
console.log(`\nMini App для Telegram: ${webAppUrl}`);
console.log(`Предпросмотр в браузере: http://localhost:3000/mini\n`);

const app = spawnCmd(isWin ? "npm.cmd" : "npm", ["run", "dev"], {
  stdio: "inherit",
  env: { TELEGRAM_WEBAPP_URL: webAppUrl },
});

function shutdown() {
  tunnel.kill();
  app.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
app.on("exit", (code) => {
  tunnel.kill();
  process.exit(code ?? 0);
});
