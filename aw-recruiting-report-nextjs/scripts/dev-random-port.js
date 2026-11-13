const net = require("net");
const { spawn } = require("child_process");

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(findAvailablePort(startPort + 1)));
    server.listen(startPort, "0.0.0.0", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const hasPortArg = args.includes("-p") || args.includes("--port");
  let spawnArgs = ["next", "dev", ...args];

  if (!hasPortArg) {
    const randomBase = 3100 + Math.floor(Math.random() * 800);
    const port = await findAvailablePort(randomBase);
    console.log(`[AW Recruiting] Starting Next.js dev server on dynamic port ${port}`);
    spawnArgs = ["next", "dev", "-p", String(port), ...args];
  }

  const child = spawn("npx", spawnArgs, {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
