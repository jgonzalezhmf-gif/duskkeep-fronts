import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(".next");

if (!existsSync(target)) {
  console.log("[clean:next] .next does not exist");
  process.exit(0);
}

rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
console.log("[clean:next] removed", target);
