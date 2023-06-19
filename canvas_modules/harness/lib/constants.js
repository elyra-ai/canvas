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

"use strict";
// Globals

// Private Methods ------------------------------------------------------------>

function _defineConstant(name, value) {
	Object.defineProperty(module.exports, name, {
		value: value,
		enumerable: true,
		writable: false
	});
}

// Public Methods ------------------------------------------------------------->

_defineConstant("APP_NAME", "WDP Common Canvas");
_defineConstant("APP_ID", "wdp-common-canvas");
_defineConstant("APP_PATH", "/");
_defineConstant("API_PATH_V1", "/v1/test-harness");
_defineConstant("APP_SESSION_KEY", "keyboard cat");

_defineConstant("TEST_RESOURCES_DIAGRAMS_PATH", "../test_resources/diagrams/");
_defineConstant("TEST_RESOURCES_PALETTES_PATH", "../test_resources/palettes/");
_defineConstant("TEST_RESOURCES_PROPERTIES_PATH", "../test_resources/properties/");
_defineConstant("TEST_RESOURCES_FORMS_PATH", "../test_resources/forms/");
_defineConstant("TEST_RESOURCES_PARAMETERDEFS_PATH", "../test_resources/parameterDefs/");

_defineConstant("PROCESS_EXIT_TIMEOUT", 5000); // ms (5 seconds)
_defineConstant("FAILURE_EXIT_CODE", 1);

_defineConstant("VALUE_CONTENT_TYPE_JSON", "application/json");

_defineConstant("USER_AGENT", "");
_defineConstant("HEADER_CONTENT_TYPE", "Content-Type");
_defineConstant("HEADER_HOST", "Host");
_defineConstant("HEADER_X_PROXY_FROM", "X-Proxy-From");
_defineConstant("HEADER_X_FORWARDED_PROTO", "X-Forwarded-Proto");

_defineConstant("PROTOCOL_HTTPS", "https");

_defineConstant("HTTP_STATUS_OK", 200);
_defineConstant("HTTP_STATUS_CREATED", 201);
_defineConstant("HTTP_STATUS_NO_CONTENT", 204);
_defineConstant("HTTP_STATUS_BAD_REQUEST", 400);
_defineConstant("HTTP_STATUS_UNAUTHORIZED", 401);
_defineConstant("HTTP_STATUS_FORBIDDEN", 403);
_defineConstant("HTTP_STATUS_NOT_FOUND", 404);
_defineConstant("HTTP_STATUS_INTERNAL_SERVER_ERROR", 500);
_defineConstant("HTTP_STATUS_SEE_OTHER", 303);
_defineConstant("HTTP_STATUS_NOT_MODIFIED", 304);

// HTTP Messages

_defineConstant("HTTP_MESSAGE_BAD_REQUEST", "Bad Request");
_defineConstant("HTTP_MESSAGE_NOT_FOUND", "Not Found");
_defineConstant("HTTP_MESSAGE_NOT_FOUND_DETAILS", "The requested resource could not be found.");
_defineConstant("HTTP_MESSAGE_INTERNAL_SERVER_ERROR", "Internal Server Error");
_defineConstant("HTTP_MESSAGE_UNAUTHORIZED", "Unauthorized");
_defineConstant("HTTP_MESSAGE_FORBIDDEN", "Forbidden");
