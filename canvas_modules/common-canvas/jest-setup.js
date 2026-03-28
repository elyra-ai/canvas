/*
 * Copyright 2017-2026 Elyra Authors
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

/* global jest, beforeEach */
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
fetch.mockResponse("<svg />");

// Added to filter out `act` error and warning messages
console.warn = mockConsole(console.warn);
console.error = mockConsole(console.error);

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
	const ignoredMessages = [
		"test was not wrapped in act(...)",
		"Rendering components directly into document.body is discouraged",
		"[WARNING]: Ignoring unsupported condition operation 'colDoesExists' for control type structuretable:",
		"[WARNING]: Ignoring unsupported condition operation 'colDoesExists' for control type structurelisteditor:",
		"[WARNING]: Ignoring unsupported condition operation 'colNotExists' for control type numberfield:",
		"[WARNING]: Ignoring unsupported condition operation 'contains' for control type passwordfield:",
		"[WARNING]: Ignoring unsupported condition operation 'notContains' for control type passwordfield:",
		"[WARNING]: Ignoring unsupported condition operation 'notEquals' for control type passwordfield:",
		"[WARNING]: Ignoring unsupported condition operation 'cellNotEmpty' for control type wrongcontrol:",
		"[WARNING]: Ignoring unsupported condition operation 'equals' for control type passwordfield:",
		"[WARNING]: Ignoring condition operation 'equals' for parameter_ref undefined with input data type function:",
		"[WARNING]: Ignoring condition operation 'matches' for parameter_ref test no regular expression specified in condition.:",
		"[WARNING]: Ignoring condition operation 'matches' for parameter_ref test with input data type number:",
		"[WARNING]: Ignoring condition operation 'notMatches' for parameter_ref undefined no regular expression specified in condition.:",
		"[WARNING]: Ignoring condition operation 'notMatches' for parameter_ref undefined with input data type number:",
		"[WARNING]: Ignoring condition operation 'isNotEmpty' for parameter_ref undefined with input data type function:",
		"[WARNING]: Ignoring condition operation 'isEmpty' for parameter_ref undefined with input data type function:",
		"[WARNING]: Ignoring condition operation 'contains' for parameter_ref undefined with input data type function:",
		"[WARNING]: Ignoring condition operation 'notContains' for parameter_ref undefined with input data type function:",
		"[WARNING]: Condition Operator dmRoleEquals only intended for use on columns:",
		"[WARNING]: Condition Operator dmMeasurementEquals only intended for use on columns:",
		"[WARNING]: Condition Operator dmMeasurementNotEquals only intended for use on columns:",
		"[WARNING]: Condition Operator dmTypeNotEquals only intended for use on columns:",
		"[WARNING]: Condition Operator dmTypeEquals only intended for use on columns:",
		"[WARNING]: Condition Operator dmRoleEquals only intended for use on columns:",
		"[WARNING]: Control not found for samplingSize:",
		"[WARNING]: Control not found for param_removed:",
		// Error thrown by error-boundary-test.js
		"Error: This is a fake error thrown for testing purposes.",
		// This message for VirtualizedGrid
		"Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
		// These messages from virtualized-table
		"componentWillMount has been renamed",
		"componentWillReceiveProps has been renamed",

	];
	return (msg, ...args) => {
		const message = typeof msg === "object" ? msg.toString() : msg; // msg might be an error object if one was thrown.

		const hasIgnoredMessage = ignoredMessages.some((ignoredMessage) => message && typeof message === "string" && message.includes(ignoredMessage));
		if (!hasIgnoredMessage) {
			consoleMethod(message, ...args);
		}
	};
}

beforeEach(() => {
	// Mock the Virtual DOM so the table can be rendered: https://github.com/TanStack/virtual/issues/641
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		value: 1000
	});
	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		value: 1000
	});
});
