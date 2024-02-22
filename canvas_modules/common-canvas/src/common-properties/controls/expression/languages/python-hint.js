/*
 * Copyright 2017-2024 Elyra Authors
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

const pythonKeywords = [
	"and",
	"del",
	"not",
	"as",
	"elif",
	"global",
	"or",
	"with",
	"assert",
	"else",
	"pass",
	"yield",
	"break",
	"except",
	"print",
	"in",
	"raise",
	"continue",
	"finally",
	"is",
	"return",
	"lambda"
];

const pythonFunctions = [
	"basestring()",
	"execfile()",
	"file()",
	"raw_input()",
	"unichr()",
	"reduce()",
	"unicode()",
	"long()",
	"reload()",
	"xrange()",
	"cmp()",
	"apply()",
	"buffer()",
	"coerce()",
	"intern()",
];

function getPythonHints() {
	const pythonHints = [];

	pythonKeywords.forEach((keyword) => pythonHints.push({ label: keyword, type: "keyword" }));

	pythonFunctions.forEach((func) => pythonHints.push({ label: func, type: "function" }));

	return pythonHints;
}

export {
	getPythonHints
};
