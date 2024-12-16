/*
 * Copyright 2017-2025 Elyra Authors
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

// Ref: https://docs.python.org/3.12/reference/lexical_analysis.html#keywords
const pythonKeywords = [
	"await",
	"else",
	"pass",
	"break",
	"except",
	"in",
	"raise",
	"finally",
	"is",
	"return",
	"and",
	"continue",
	"lambda",
	"as",
	"nonlocal",
	"assert",
	"del",
	"global",
	"not",
	"with",
	"async",
	"elif",
	"or",
	"yield"
];

// Ref: https://docs.python.org/3/library/functions.html
const pythonFunctions = [];

function getPythonHints() {
	const pythonHints = [];

	pythonKeywords.forEach((keyword) => pythonHints.push({ label: keyword, type: "keyword" }));

	pythonFunctions.forEach((func) => pythonHints.push({ label: func, type: "function" }));

	return pythonHints;
}

export {
	getPythonHints
};
