#!/usr/bin/env node
/*
 * Copyright 2026 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import {
	mkdirSync,
	copyFileSync,
	writeFileSync,
	readFileSync,
	readdirSync,
	existsSync,
} from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "../template");

async function prompt(rl, question, defaultAnswer = "") {
	const suffix = defaultAnswer ? ` (${defaultAnswer})` : "";
	const answer = await rl.question(`${question}${suffix}: `);
	return answer.trim() || defaultAnswer;
}

async function confirm(rl, question, defaultYes = true) {
	const hint = defaultYes ? "[Y/n]" : "[y/N]";
	const answer = await rl.question(`${question} ${hint}: `);
	if (!answer.trim()) return defaultYes;
	return answer.trim().toLowerCase().startsWith("y");
}

async function selectOption(rl, question, options) {
	console.log(`\n${question}`);
	options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
	const answer = await rl.question(`Select [1-${options.length}] (1): `);
	const idx = parseInt(answer, 10) - 1;
	return idx >= 0 && idx < options.length ? idx : 0;
}

function slugify(name) {
	return (
		name
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "")
			.replace(/^-+|-+$/g, "") || "elyra-canvas-app"
	);
}

function copyDir(src, dest) {
	const entries = readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(destPath, { recursive: true });
			copyDir(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
}

function renderTemplate(filePath, vars = {}) {
	let content = readFileSync(filePath, "utf8");
	for (const [key, value] of Object.entries(vars)) {
		content = content.replaceAll(`{{${key}}}`, value);
	}
	return content;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	console.log("\nCreate Elyra Canvas App\n");
	console.log("This will scaffold a working Elyra Canvas application.\n");

	const args = process.argv.slice(2);
	const useDefaults =
		args.includes("--defaults") || args.includes("-y") || !process.stdin.isTTY;
	const nameArg = args.find((a) => !a.startsWith("-"));

	const NODE_FORMATS = ["Horizontal", "Vertical"];
	const LINK_TYPES = ["Curve", "Elbow", "Parallax", "Straight"];
	const SNAP_TYPES = ["None", "During", "After"];

	let appName;
	let includeSamplePalette;
	let includeSampleFlow;
	let nodeFormat;
	let useContextToolbar;
	let linkType;
	let snapToGrid;

	if (useDefaults) {
		appName = slugify(nameArg || "elyra-canvas-app");
		includeSamplePalette = true;
		includeSampleFlow = true;
		nodeFormat = "Horizontal";
		useContextToolbar = true;
		linkType = "Curve";
		snapToGrid = "None";
		console.log(`App name:           ${appName}`);
		console.log(`Sample palette:     yes`);
		console.log(`Sample flow:        yes`);
		console.log(`Node format:        ${nodeFormat}`);
		console.log(`Context toolbar:    yes`);
		console.log(`Link type:          ${linkType}`);
		console.log(`Snap to grid:       ${snapToGrid}`);
	} else {
		const rl = createInterface({ input, output });
		try {
			if (nameArg) {
				appName = slugify(nameArg);
				console.log(`App name: ${appName}`);
			} else {
				const raw = await prompt(rl, "App name", "elyra-canvas-app");
				appName = slugify(raw);
			}

			includeSamplePalette = await confirm(
				rl,
				"\nInclude a sample palette with node types?",
				true
			);

			includeSampleFlow = await confirm(
				rl,
				"\nInclude a sample pipeline flow?",
				true
			);

			const nodeFormatIdx = await selectOption(
				rl,
				"Node display format:",
				NODE_FORMATS
			);
			nodeFormat = NODE_FORMATS[nodeFormatIdx];

			useContextToolbar = await confirm(
				rl,
				"\nUse context toolbars instead of context menus?",
				true
			);

			const linkTypeIdx = await selectOption(
				rl,
				"Link (connection) type:",
				LINK_TYPES
			);
			linkType = LINK_TYPES[linkTypeIdx];

			const snapIdx = await selectOption(
				rl,
				"Snap nodes to grid:",
				SNAP_TYPES
			);
			snapToGrid = SNAP_TYPES[snapIdx];
		} finally {
			rl.close();
		}
	}

	try {
		const projectDir = resolve(process.cwd(), appName);

		if (existsSync(projectDir)) {
			console.error(`\nError: Directory "${appName}" already exists.`);
			process.exit(1);
		}

		console.log(`\nScaffolding project in ${projectDir}...\n`);

		// Create directory structure
		mkdirSync(join(projectDir, "public", "icons"), { recursive: true });
		mkdirSync(join(projectDir, "src"), { recursive: true });

		const appTitle = appName
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		// ── Root config files ──
		writeFileSync(
			join(projectDir, "package.json"),
			renderTemplate(join(TEMPLATE_DIR, "package.json"), { APP_NAME: appName })
		);
		writeFileSync(
			join(projectDir, "index.html"),
			renderTemplate(join(TEMPLATE_DIR, "index.html"), { APP_NAME: appName })
		);
		copyFileSync(
			join(TEMPLATE_DIR, "vite.config.js"),
			join(projectDir, "vite.config.js")
		);

		// ── src/ ──
		copyFileSync(
			join(TEMPLATE_DIR, "src", "main.jsx"),
			join(projectDir, "src", "main.jsx")
		);
		writeFileSync(
			join(projectDir, "src", "App.jsx"),
			renderTemplate(join(TEMPLATE_DIR, "src", "App.jsx"), {
				APP_TITLE: appTitle,
				NODE_FORMAT: nodeFormat,
				USE_CONTEXT_TOOLBAR: useContextToolbar,
				LINK_TYPE: linkType,
				SNAP_TO_GRID: snapToGrid,
			})
		);

		// ── Carbon styling files ──
		const src = join(TEMPLATE_DIR, "src");
		copyFileSync(join(src, "App.scss"), join(projectDir, "src", "App.scss"));
		copyFileSync(join(src, "carbon.scss"), join(projectDir, "src", "carbon.scss"));
		copyFileSync(join(src, "common.scss"), join(projectDir, "src", "common.scss"));

		// ── Palette & flow data ──
		const templateSrc = join(TEMPLATE_DIR, "src");
		copyFileSync(
			join(templateSrc, includeSamplePalette ? "palette.json" : "empty-palette.json"),
			join(projectDir, "src", "palette.json")
		);
		copyFileSync(
			join(templateSrc, includeSampleFlow ? "pipeline-flow.json" : "empty-flow.json"),
			join(projectDir, "src", "pipeline-flow.json")
		);

		// Icons are referenced by both the palette and the flow, copy if either is included
		if (includeSamplePalette || includeSampleFlow) {
			copyDir(
				join(TEMPLATE_DIR, "public", "icons"),
				join(projectDir, "public", "icons")
			);
		}

		// ── Install dependencies ──
		if (!args.includes("--no-install")) {
			console.log("Installing dependencies (this may take a minute)...\n");
			execSync("npm install", { cwd: projectDir, stdio: "inherit" });
		}

		console.log(`\nDone! Your Elyra Canvas app is ready.\n`);
		console.log("Get started:\n");
		console.log(`  cd ${appName}`);
		console.log(`  npm run dev\n`);
		console.log("Opens http://localhost:5173 in your browser.\n");
	} catch (err) {
		console.error("\nFailed to create project:", err.message);
		process.exit(1);
	}
}

main();
