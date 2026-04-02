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

// Helper function to suppress specific console warnings
export function suppressConsoleWarning(warningMessages) {
	// Convert single string to array for uniform handling
	const messagesToSuppress =
		Array.isArray(warningMessages) ? warningMessages : [warningMessages];

	return jest.spyOn(console, "warn").mockImplementation((message) => {
		// Check if message matches any of the messages to suppress
		for (const warningMessage of messagesToSuppress) {
			if (message && message.includes(warningMessage)) {
				return;
			}
		}
		// Log other warnings normally
		// Can't use console.warn here otherwise it loops.
		console.log(message); // eslint-disable-line no-console
	});
}

// Helper function to suppress specific console errors
export function suppressConsoleError(errorMessages) {
	// Convert single string to array for uniform handling
	const messagesToSuppress =
		Array.isArray(errorMessages) ? errorMessages : [errorMessages];

	return jest.spyOn(console, "error").mockImplementation((message) => {
		// Check if message matches any of the messages to suppress
		for (const errorMessage of messagesToSuppress) {
			if (message && message.includes(errorMessage)) {
				return;
			}
		}
		// Log other errors normally
		// Can't use console.error here otherwise it loops.
		console.log(message); // eslint-disable-line no-console
	});
}

// Made with Bob
