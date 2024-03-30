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
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";


configure({ adapter: new Adapter() });

require("jest-fetch-mock").enableMocks();
fetch.mockResponse("<svg />");

// Added to filter out `act` error and warning messages
console.warn = jest.fn(mockConsole(console.warn));
console.error = jest.fn(mockConsole(console.error));

// Added to simulate scrollIntoView for react components
window.HTMLElement.prototype.scrollIntoView = jest.fn();

function mockConsole(consoleMethod) {
	const ignoredMessages = ["test was not wrapped in act(...)", "Rendering components directly into document.body is discouraged"];
	return (message, ...args) => {
		const hasIgnoredMessage = ignoredMessages.some((ignoredMessage) => message && typeof message === "string" && message.includes(ignoredMessage));
		if (!hasIgnoredMessage) {
			consoleMethod(message, ...args);
		}
	};
}
