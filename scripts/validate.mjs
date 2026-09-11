#!/usr/bin/env node
// Validate every skill in ./skills against the Agent Skills specification
// (https://agentskills.io/specification) and against this repository's own
// invariants. Zero dependencies; Node 18 or newer.
//
//   node scripts/validate.mjs
//
// Exit status is 1 when any error is found. Warnings never fail the run.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const readmePath = join(root, "README.md");

const ALLOWED_KEYS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN = [
  { pattern: /\$ARGUMENTS/, reason: "host-specific placeholder; describe the invocation request in prose" },
  { pattern: /~\/\.commands/, reason: "legacy install path" },
  { pattern: /\/Users\/|\/home\/[a-z]/, reason: "absolute home path" },
];

const errors = [];
const warnings = [];
const error = (skill, message) => errors.push(`${skill}: ${message}`);
const warn = (skill, message) => warnings.push(`${skill}: ${message}`);

function parseFrontmatter(text, skill) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    error(skill, "SKILL.md must start with a `---` frontmatter block");
    return { fields: null, body: text };
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    error(skill, "frontmatter is not closed with `---`");
    return { fields: null, body: "" };
  }
  const fields = new Map();
  for (const line of lines.slice(1, end)) {
    if (line.trim() === "") continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$/);
    if (!match) {
      error(skill, `unsupported frontmatter line: ${JSON.stringify(line)} (this validator supports single-line \`key: value\` fields only)`);
      continue;
    }
    const [, key, value] = match;
    if (fields.has(key)) error(skill, `duplicate frontmatter key \`${key}\``);
    fields.set(key, value.trim());
  }
  return { fields, body: lines.slice(end + 1).join("\n") };
}

function validateSkill(name) {
  const dir = join(skillsDir, name);
  const skillFile = join(dir, "SKILL.md");
  if (!existsSync(skillFile)) {
    error(name, "missing SKILL.md");
    return;
  }
  const text = readFileSync(skillFile, "utf8");
  const { fields, body } = parseFrontmatter(text, name);
  if (!fields) return;

  for (const key of fields.keys()) {
    if (!ALLOWED_KEYS.has(key)) error(name, `unknown frontmatter key \`${key}\``);
  }

  const declared = fields.get("name");
  if (!declared) error(name, "frontmatter `name` is required");
  else {
    if (declared !== name) error(name, `frontmatter name \`${declared}\` must match the directory name`);
    if (!NAME_PATTERN.test(declared)) error(name, "name must be lowercase letters, digits, and single hyphens");
    if (declared.length > 64) error(name, "name must be 64 characters or fewer");
  }

  const description = fields.get("description");
  if (!description) error(name, "frontmatter `description` is required");
  else if (description.length > 1024) error(name, `description is ${description.length} characters; the limit is 1024`);

  const compatibility = fields.get("compatibility");
  if (compatibility !== undefined && compatibility.length > 500) {
    error(name, `compatibility is ${compatibility.length} characters; the limit is 500`);
  }

  if (body.trim() === "") error(name, "SKILL.md has no instructions after the frontmatter");

  const lineCount = text.split(/\r?\n/).length;
  if (lineCount > 500) warn(name, `SKILL.md is ${lineCount} lines; the specification recommends staying under 500`);

  for (const { pattern, reason } of FORBIDDEN) {
    if (pattern.test(body)) error(name, `body matches ${pattern} (${reason})`);
  }

  for (const match of body.matchAll(/`((?:references|scripts|assets)\/[^`\s]+)`/g)) {
    const target = join(dir, match[1]);
    if (!existsSync(target)) error(name, `references \`${match[1]}\` but that file does not exist`);
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "SKILL.md") continue;
    if (entry.isDirectory() && ["references", "scripts", "assets"].includes(entry.name)) continue;
    warn(name, `unexpected entry \`${entry.name}\` (the layout is SKILL.md plus optional references/, scripts/, assets/)`);
  }
}

const PUBLICATION_PATTERNS = [
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, reason: "private key" },
  { pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/, reason: "GitHub token" },
  { pattern: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}\b/, reason: "API key" },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/, reason: "AWS access key" },
  { pattern: /\bxox[abpr]-[A-Za-z0-9-]{10,}\b/, reason: "Slack token" },
  { pattern: /\bAIza[0-9A-Za-z_-]{35}\b/, reason: "Google API key" },
  { pattern: /\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*["']?[A-Za-z0-9_\-/+=]{16,}/i, reason: "credential assignment" },
  { pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/, reason: "email address" },
  { pattern: /\/Users\/[^\s/"'`]+|\/home\/[^\s/"'`]+/, reason: "absolute home path" },
  { pattern: /~\/Developer\//, reason: "personal development path" },
];
const SKIPPED_DIRS = new Set([".git", "node_modules"]);
const BINARY_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|svg|ico|pdf|zip|tgz|gz|woff2?|ttf|otf|mp[34]|wasm)$/i;

// Everything in the repository is published, by git or by npm, so every
// text file is scanned for secrets and for anything tied to one machine
// or one person.
function validatePublishedFiles() {
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SKIPPED_DIRS.has(entry.name) || entry.name === ".DS_Store") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile() || BINARY_EXTENSIONS.test(entry.name)) continue;
      const relative = full.slice(root.length + 1);
      const lines = readFileSync(full, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const { pattern, reason } of PUBLICATION_PATTERNS) {
          if (pattern.test(line)) error(relative, `line ${index + 1} contains a ${reason}`);
        }
      });
    }
  };
  walk(root);
}

function validateReadme(skillNames) {
  if (!existsSync(readmePath)) {
    error("README.md", "missing");
    return;
  }
  const readme = readFileSync(readmePath, "utf8");
  // A table row names a command either as plain code or as a link to its
  // own SKILL.md; the backreference rejects a link that points elsewhere.
  const documented = new Set();
  for (const match of readme.matchAll(/^\| (?:`([a-z0-9-]+)`|\[`([a-z0-9-]+)`\]\(skills\/\2\/SKILL\.md\)) \|/gm)) {
    documented.add(match[1] ?? match[2]);
  }
  for (const name of skillNames) {
    if (!documented.has(name)) error("README.md", `skill \`${name}\` is not listed in the command tables`);
  }
  for (const name of documented) {
    if (!skillNames.includes(name)) error("README.md", `table lists \`${name}\` but skills/${name} does not exist`);
  }
}

if (!existsSync(skillsDir)) {
  console.error("skills/ directory not found");
  process.exit(1);
}

const skillNames = readdirSync(skillsDir)
  .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
  .sort();

if (skillNames.length === 0) error("skills", "no skill directories found");
for (const name of skillNames) validateSkill(name);
validateReadme(skillNames);
validatePublishedFiles();

for (const message of warnings) console.log(`warning  ${message}`);
for (const message of errors) console.log(`error    ${message}`);
const summary = `${skillNames.length} skills, ${errors.length} errors, ${warnings.length} warnings`;
if (errors.length > 0) {
  console.log(`FAIL  ${summary}`);
  process.exit(1);
}
console.log(`OK    ${summary}`);
