#!/usr/bin/env node
/*
 * Copyright 2025 Elyra Authors
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

// ─── File generators ────────────────────────────────────────────────────────

function generatePackageJson(appName) {
	return JSON.stringify(
		{
			name: appName,
			version: "0.1.0",
			description: `${appName} - an Elyra Canvas application`,
			scripts: {
				start: "react-scripts start",
				build: "react-scripts build",
				test: "react-scripts test",
				eject: "react-scripts eject",
			},
			dependencies: {
				"@carbon/icons-react": "^11.78.0",
				"@carbon/react": "^1.105.0",
				"@elyra/canvas": "^13.46.1",
				"@ibm/plex-mono": "^1.1.0",
				"@ibm/plex-sans": "^1.1.0",
				"@ibm/plex-sans-condensed": "^2.0.0",
				"@ibm/plex-serif": "^2.0.0",
				react: "^18.2.0",
				"react-dom": "^18.2.0",
				"react-intl": "^5.25.1",
				"react-scripts": "5.0.1",
				sass: "^1.99.0",
			},
			eslintConfig: {
				extends: ["react-app"],
			},
			browserslist: {
				production: [">0.2%", "not dead", "not op_mini all"],
				development: [
					"last 1 chrome version",
					"last 1 firefox version",
					"last 1 safari version",
				],
			},
			devDependencies: { copyfiles: "^2.4.1" },
		},
		null,
		2
	);
}

function generateIndexHtml(appName) {
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${appName}" />
    <link rel="stylesheet" href="%PUBLIC_URL%/common-canvas.min.css" />
    <title>${appName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
}

function generateIndexJs() {
	return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`;
}

function generateAppJs(appName) {
	const title = appName
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

	return `import React, { useRef, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { CommonCanvas, CanvasController } from '@elyra/canvas';
import { Toggle } from '@carbon/react';
import flowData from './pipeline-flow.json';
import paletteData from './palette.json';
import '@elyra/canvas/dist/styles/common-canvas.min.css';
import './App.scss';

function App() {
  const title = "${title}";
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const canvasController = useRef(new CanvasController());

  useEffect(() => {
    canvasController.current.setPipelineFlow(flowData);
    canvasController.current.setPipelineFlowPalette(paletteData);
    canvasController.current.openPalette();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-carbon-theme',
      isDarkTheme ? 'g90' : 'g10'
    );
  }, [isDarkTheme]);

  const canvasConfig = {
    enablePaletteLayout: "Flyout",
    enableToolbarLayout: "Top",
    enableKeyboardNavigation: true
  };

  return (
    <IntlProvider locale="en">
      <div className="App">
        <div className="header">
          <h1>{title}</h1>
          <div className="theme-toggle">
            <Toggle
              id="theme-toggle"
              labelText="Theme"
              labelA="Light"
              labelB="Dark"
              toggled={isDarkTheme}
              onToggle={(checked) => setIsDarkTheme(checked)}
              size="sm"
            />
          </div>
        </div>
        <div className="canvas-container">
          <CommonCanvas
            canvasController={canvasController.current}
            config={canvasConfig}
          />
        </div>
      </div>
    </IntlProvider>
  );
}

export default App;
`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	console.log("\nCreate Elyra Canvas App\n");
	console.log("This will scaffold a working Elyra Canvas application.\n");

	const args = process.argv.slice(2);
	const useDefaults =
		args.includes("--defaults") || args.includes("-y") || !process.stdin.isTTY;
	const nameArg = args.find((a) => !a.startsWith("-"));

	let appName;
	let includeSampleNodes;

	if (useDefaults) {
		appName = slugify(nameArg || "elyra-canvas-app");
		includeSampleNodes = true;
		console.log(`App name:             ${appName}`);
		console.log(`Sample nodes & flow:  yes`);
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

			includeSampleNodes = await confirm(
				rl,
				"\nInclude sample palette nodes and pipeline flow?",
				true
			);
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

		// ── package.json, index.html, src/index.js ──
		writeFileSync(
			join(projectDir, "package.json"),
			generatePackageJson(appName)
		);
		writeFileSync(
			join(projectDir, "public", "index.html"),
			generateIndexHtml(appName)
		);
		writeFileSync(join(projectDir, "src", "index.js"), generateIndexJs());
		writeFileSync(
			join(projectDir, "src", "App.js"),
			generateAppJs(appName)
		);

		// ── Carbon styling files ──
		const src = join(TEMPLATE_DIR, "src");
		copyFileSync(join(src, "App.scss"), join(projectDir, "src", "App.scss"));
		copyFileSync(join(src, "carbon.scss"), join(projectDir, "src", "carbon.scss"));
		copyFileSync(join(src, "common.scss"), join(projectDir, "src", "common.scss"));

		// ── Palette & flow data ──
		const templateSrc = join(TEMPLATE_DIR, "src");
		if (includeSampleNodes) {
			copyFileSync(
				join(templateSrc, "palette.json"),
				join(projectDir, "src", "palette.json")
			);
			copyFileSync(
				join(templateSrc, "pipeline-flow.json"),
				join(projectDir, "src", "pipeline-flow.json")
			);
			copyDir(
				join(TEMPLATE_DIR, "public", "icons"),
				join(projectDir, "public", "icons")
			);
		} else {
			copyFileSync(
				join(templateSrc, "empty-palette.json"),
				join(projectDir, "src", "palette.json")
			);
			copyFileSync(
				join(templateSrc, "empty-flow.json"),
				join(projectDir, "src", "pipeline-flow.json")
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
		console.log(`  npm start\n`);
		console.log("Opens http://localhost:3000 in your browser.\n");
	} catch (err) {
		console.error("\nFailed to create project:", err.message);
		process.exit(1);
	}
}

main();
