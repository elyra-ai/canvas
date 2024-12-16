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

/* eslint no-empty-function: ["error", { "allow": ["functions", "arrowFunctions"] }] */
/* global document*/

global.Range = function Range() {};

const createContextualFragment = (html) => {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.children[0]; // so hokey it's not even funny
};

global.Range.prototype.createContextualFragment = (html) => createContextualFragment(html);

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
	return {
		setEnd: () => {},
		setStart: () => {},
		getBoundingClientRect: () => ({ right: 0 }),
		getClientRects: () => [],
		createContextualFragment,
	};
};
