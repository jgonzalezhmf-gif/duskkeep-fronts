#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const skillRoot = path.join(projectRoot, '.agents', 'skills', 'impeccable');
const skillFile = path.join(skillRoot, 'SKILL.md');
const loadContextFile = path.join(skillRoot, 'scripts', 'load-context.mjs');
const pinFile = path.join(skillRoot, 'scripts', 'pin.mjs');
const commandMetadataFile = path.join(skillRoot, 'scripts', 'command-metadata.json');

let passed = 0;
let failed = 0;
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function runNode(args, cwd) {
  return spawnSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  });
}

test('La skill impeccable existe y contiene comandos esperados', () => {
  assert.equal(fs.existsSync(skillFile), true, `No existe ${skillFile}`);
  const content = fs.readFileSync(skillFile, 'utf8');
  assert.match(content, /name:\s*impeccable/i);
  assert.match(content, /\|\s*`animate \[target\]`\s*\|/);
  assert.match(content, /\|\s*`craft \[feature\]`\s*\|/);
});

test('command-metadata incluye animate con descripcion', () => {
  assert.equal(fs.existsSync(commandMetadataFile), true, `No existe ${commandMetadataFile}`);
  const metadata = JSON.parse(fs.readFileSync(commandMetadataFile, 'utf8'));
  assert.equal(typeof metadata.animate?.description, 'string');
  assert.ok(metadata.animate.description.length > 20, 'Descripción de animate demasiado corta');
});

test('load-context detecta PRODUCT.md y DESIGN.md', async () => {
  const { loadContext } = await import(pathToFileURL(loadContextFile).href);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'impeccable-test-'));
  try {
    fs.writeFileSync(path.join(tempDir, 'PRODUCT.md'), '# Product\nContexto de prueba', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'DESIGN.md'), '# Design\nSistema visual de prueba', 'utf8');
    const result = loadContext(tempDir);
    assert.equal(result.hasProduct, true);
    assert.equal(result.hasDesign, true);
    assert.equal(result.productPath, 'PRODUCT.md');
    assert.equal(result.designPath, 'DESIGN.md');
    assert.equal(result.migrated, false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('load-context migra .impeccable.md a PRODUCT.md', async () => {
  const { loadContext } = await import(pathToFileURL(loadContextFile).href);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'impeccable-test-'));
  try {
    fs.writeFileSync(path.join(tempDir, '.impeccable.md'), '# Legacy\nContenido legacy', 'utf8');
    const result = loadContext(tempDir);
    assert.equal(result.hasProduct, true);
    assert.equal(result.migrated, true);
    assert.equal(fs.existsSync(path.join(tempDir, 'PRODUCT.md')), true);
    assert.equal(fs.existsSync(path.join(tempDir, '.impeccable.md')), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('pin/unpin animate crea y elimina shortcut en .agents/skills', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'impeccable-pin-'));
  try {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'pin-test' }), 'utf8');
    fs.mkdirSync(path.join(tempDir, '.agents', 'skills', 'impeccable'), { recursive: true });

    const pinResult = runNode([pinFile, 'pin', 'animate'], tempDir);
    assert.equal(pinResult.status, 0, `pin falló:\n${pinResult.stderr || pinResult.stdout}`);
    const pinnedSkillPath = path.join(tempDir, '.agents', 'skills', 'animate', 'SKILL.md');
    assert.equal(fs.existsSync(pinnedSkillPath), true, 'No se creó SKILL.md para animate');
    const pinnedContent = fs.readFileSync(pinnedSkillPath, 'utf8');
    assert.match(pinnedContent, /impeccable-pinned-skill/);
    assert.match(pinnedContent, /impeccable animate/);

    const unpinResult = runNode([pinFile, 'unpin', 'animate'], tempDir);
    assert.equal(unpinResult.status, 0, `unpin falló:\n${unpinResult.stderr || unpinResult.stdout}`);
    assert.equal(fs.existsSync(path.join(tempDir, '.agents', 'skills', 'animate')), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error instanceof Error ? error.stack : error);
  }
}

if (failed > 0) {
  console.error(`\nResultado: ${failed} prueba(s) fallaron, ${passed} pasaron.`);
  process.exitCode = 1;
} else {
  console.log(`\nResultado: ${passed} prueba(s) pasaron.`);
}
