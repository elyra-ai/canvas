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

/* global fetch */
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { configure } from "enzyme";


configure({ adapter: new Adapter() });

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
	const ignoredMessages = [
		"test was not wrapped in act(...)", "Rendering components directly into document.body is discouraged",
		"Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"
	];
	return (message, ...args) => {
		const hasIgnoredMessage = ignoredMessages.some((ignoredMessage) => message && typeof message === "string" && message.includes(ignoredMessage));
		if (!hasIgnoredMessage) {
			consoleMethod(message, ...args);
		}
	};
}
