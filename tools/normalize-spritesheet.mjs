#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ANCHORS = new Set(["bottom-center", "center", "left-center", "top-center"]);

function readArg(name, fallback = null) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function getAnchorPoint(bounds, anchor) {
  if (anchor === "bottom-center") {
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: bounds.maxY,
    };
  }

  if (anchor === "left-center") {
    return {
      x: bounds.minX,
      y: (bounds.minY + bounds.maxY) / 2,
    };
  }

  if (anchor === "top-center") {
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: bounds.minY,
    };
  }

  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

function getTargetAnchor(frameWidth, frameHeight, anchor) {
  if (anchor === "bottom-center") return { x: frameWidth / 2, y: frameHeight - 1 };
  if (anchor === "left-center") return { x: 0, y: frameHeight / 2 };
  if (anchor === "top-center") return { x: frameWidth / 2, y: 0 };
  return { x: frameWidth / 2, y: frameHeight / 2 };
}

function findAlphaBounds(data, imageWidth, frameWidth, frameHeight, frameIndex, alphaThreshold) {
  let minX = frameWidth;
  let minY = frameHeight;
  let maxX = -1;
  let maxY = -1;
  let count = 0;
  const xOffset = frameIndex * frameWidth;

  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const alpha = data[((y * imageWidth + xOffset + x) * 4) + 3];
      if (alpha <= alphaThreshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return { minX, minY, maxX, maxY, count };
}

const input = readArg("input");
const output = readArg("output");
const frameCount = Number.parseInt(readArg("frames", "0"), 10);
const anchor = readArg("anchor", "bottom-center");
const alphaThreshold = Number.parseInt(readArg("alpha-threshold", "12"), 10);

if (!input) fail("Missing --input");
if (!output) fail("Missing --output");
if (!Number.isFinite(frameCount) || frameCount <= 0) fail("Missing or invalid --frames");
if (!ANCHORS.has(anchor)) fail(`Invalid --anchor. Use one of: ${Array.from(ANCHORS).join(", ")}`);

const image = sharp(input).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
if (info.width % frameCount !== 0) {
  fail(`Image width ${info.width} is not divisible by frame count ${frameCount}`);
}

const frameWidth = info.width / frameCount;
const frameHeight = info.height;
const targetAnchor = getTargetAnchor(frameWidth, frameHeight, anchor);
const outputData = Buffer.alloc(info.width * info.height * 4);
const diagnostics = [];

for (let frame = 0; frame < frameCount; frame += 1) {
  const bounds = findAlphaBounds(data, info.width, frameWidth, frameHeight, frame, alphaThreshold);
  if (!bounds) {
    diagnostics.push({ frame, empty: true });
    continue;
  }

  const frameAnchor = getAnchorPoint(bounds, anchor);
  const dx = Math.round(targetAnchor.x - frameAnchor.x);
  const dy = Math.round(targetAnchor.y - frameAnchor.y);
  let clippedPixels = 0;
  const srcXOffset = frame * frameWidth;
  const dstXOffset = frame * frameWidth;

  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const srcIndex = ((y * info.width + srcXOffset + x) * 4);
      const alpha = data[srcIndex + 3];
      if (alpha <= alphaThreshold) continue;

      const dstX = x + dx;
      const dstY = y + dy;
      if (dstX < 0 || dstX >= frameWidth || dstY < 0 || dstY >= frameHeight) {
        clippedPixels += 1;
        continue;
      }

      const dstIndex = ((dstY * info.width + dstXOffset + dstX) * 4);
      outputData[dstIndex] = data[srcIndex];
      outputData[dstIndex + 1] = data[srcIndex + 1];
      outputData[dstIndex + 2] = data[srcIndex + 2];
      outputData[dstIndex + 3] = alpha;
    }
  }

  diagnostics.push({
    frame,
    bounds,
    anchor: {
      x: Math.round(frameAnchor.x * 100) / 100,
      y: Math.round(frameAnchor.y * 100) / 100,
    },
    offset: { x: dx, y: dy },
    clippedPixels,
  });
}

await fs.mkdir(path.dirname(output), { recursive: true });
await sharp(outputData, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
}).png().toFile(output);

const report = {
  input,
  output,
  frameCount,
  frameWidth,
  frameHeight,
  anchor,
  alphaThreshold,
  targetAnchor,
  diagnostics,
};
await fs.writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
