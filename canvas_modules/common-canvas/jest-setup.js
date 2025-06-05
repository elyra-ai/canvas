/*
 * Copyright 2017-2023 Elyra Authors
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

/* global fetch */
require("jest-fetch-mock").enableMocks();
fetch.mockResponse("<svg />");

// Added to filter out `act` error and warning messages
console.warn = jest.fn(mockConsole(console.warn));
console.error = jest.fn(mockConsole(console.error));

// Added to simulate scrollIntoView for react components
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Fixes - TypeError: window.matchMedia is not a function
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

function mockConsole(consoleMethod) {
	const ignoredMessages = ["test was not wrapped in act(...)", "Rendering components directly into document.body is discouraged"];
	return (message, ...args) => {
		const hasIgnoredMessage = ignoredMessages.some((ignoredMessage) => message && typeof message === "string" && message.includes(ignoredMessage));
		if (!hasIgnoredMessage) {
			consoleMethod(message, ...args);
		}
	};
}

beforeEach(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		value: 1000
	});
	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		value: 1000
	});
});
