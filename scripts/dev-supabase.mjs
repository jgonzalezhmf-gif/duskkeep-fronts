import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--webpack"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXT_PUBLIC_PERSISTENCE: "supabase",
    SERVER_AUTHORITATIVE_API_ENABLED: "true",
  },
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
