import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "scripts/audio/elevenlabs-audio-plan.json");
const BATCHES_PATH = path.join(ROOT, "scripts/audio/duskkeep-audio-batches.json");
const API_URL = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";

function loadDotEnvLocal() {
  return readFile(path.join(ROOT, ".env.local"), "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    })
    .catch(() => {});
}

function parseArgs() {
  const args = process.argv.slice(2);
  const batchArg = args.find((arg) => arg.startsWith("--batch="));
  const variantsArg = args.find((arg) => arg.startsWith("--variants="));
  return {
    dryRun: args.includes("--dry-run"),
    batch: batchArg ? batchArg.split("=")[1] : null,
    variants: variantsArg ? Math.max(1, Number(variantsArg.split("=")[1]) || 1) : 1,
    ids: args.filter((arg) => !arg.startsWith("--")),
  };
}

async function main() {
  const { dryRun, ids, batch, variants } = parseArgs();
  const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
  const batches = JSON.parse(await readFile(BATCHES_PATH, "utf8"));
  const batchIds = batch ? batches[batch]?.sfx : null;

  if (batch && !batchIds) {
    throw new Error(`Unknown audio batch: ${batch}`);
  }

  const requestedIds = ids.length ? ids : batchIds ?? [];
  const selected = requestedIds.length ? plan.sfx.filter((item) => requestedIds.includes(item.id)) : plan.sfx;
  const missing = requestedIds.filter((id) => !selected.some((item) => item.id === id));

  if (missing.length) {
    throw new Error(`Unknown SFX id(s): ${missing.join(", ")}`);
  }

  if (dryRun) {
    for (const item of selected) {
      for (let variant = 1; variant <= variants; variant += 1) {
        console.log(`[dry-run] ${item.id}#${variant} -> ${getOutputPath(item, variants, variant)}`);
      }
    }
    return;
  }

  await loadDotEnvLocal();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing. Set it in the session or .env.local before generating audio.");
  }

  for (const item of selected) {
    for (let variant = 1; variant <= variants; variant += 1) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: item.prompt,
          model_id: "eleven_text_to_sound_v2",
          duration_seconds: item.durationSeconds,
          prompt_influence: item.promptInfluence,
          loop: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`ElevenLabs SFX failed for ${item.id}#${variant}: ${response.status} ${body}`);
      }

      const relativeOutput = getOutputPath(item, variants, variant);
      const buffer = Buffer.from(await response.arrayBuffer());
      const output = path.join(ROOT, relativeOutput);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, buffer);
      console.log(`[generated] ${item.id}#${variant} -> ${relativeOutput}`);
    }
  }
}

function getOutputPath(item, variants, variant) {
  if (variants <= 1) return item.output;
  const parsed = path.parse(item.output);
  return path.join(parsed.dir, "_drafts", `${parsed.name}_v${String(variant).padStart(2, "0")}${parsed.ext}`).replaceAll("\\", "/");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
