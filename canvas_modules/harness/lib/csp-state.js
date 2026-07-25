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

// Shared in-memory flag controlling whether the server sends a
// Content-Security-Policy header.  Kept in its own module so that both
// application.js and v1-ops-api.js can import it without creating a
// circular dependency.

let cspEnabled = true;

/** Returns the current CSP-enabled flag. */
export function isCspEnabled() {
	return cspEnabled;
}

/**
 * Sets the CSP-enabled flag and returns the new value.
 * @param {boolean} value - true to enable CSP, false to disable.
 * @returns {boolean} The updated flag value.
 */
export function setCspEnabled(value) {
	cspEnabled = Boolean(value);
	return cspEnabled;
}
