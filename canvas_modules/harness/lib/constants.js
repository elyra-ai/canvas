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

// Globals

export const APP_NAME = "WDP Common Canvas";
export const APP_ID = "wdp-common-canvas";
export const APP_PATH = "/";
export const API_PATH_V1 = "/v1/test-harness";
export const APP_SESSION_KEY = "keyboard cat";

export const TEST_RESOURCES_DIAGRAMS_PATH = "../test_resources/diagrams/";
export const TEST_RESOURCES_PALETTES_PATH = "../test_resources/palettes/";
export const TEST_RESOURCES_PROPERTIES_PATH = "../test_resources/properties/";
export const TEST_RESOURCES_FORMS_PATH = "../test_resources/forms/";
export const TEST_RESOURCES_PARAMETERDEFS_PATH = "../test_resources/parameterDefs/";

export const PROCESS_EXIT_TIMEOUT = 5000; // ms (5 seconds)
export const FAILURE_EXIT_CODE = 1;

export const VALUE_CONTENT_TYPE_JSON = "application/json";

export const USER_AGENT = "";
export const HEADER_CONTENT_TYPE = "Content-Type";
export const HEADER_HOST = "Host";
export const HEADER_X_PROXY_FROM = "X-Proxy-From";
export const HEADER_X_FORWARDED_PROTO = "X-Forwarded-Proto";

export const PROTOCOL_HTTPS = "https";

export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_NO_CONTENT = 204;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_FORBIDDEN = 403;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
export const HTTP_STATUS_SEE_OTHER = 303;
export const HTTP_STATUS_NOT_MODIFIED = 304;

// HTTP Messages

export const HTTP_MESSAGE_BAD_REQUEST = "Bad Request";
export const HTTP_MESSAGE_NOT_FOUND = "Not Found";
export const HTTP_MESSAGE_NOT_FOUND_DETAILS = "The requested resource could not be found.";
export const HTTP_MESSAGE_INTERNAL_SERVER_ERROR = "Internal Server Error";
export const HTTP_MESSAGE_UNAUTHORIZED = "Unauthorized";
export const HTTP_MESSAGE_FORBIDDEN = "Forbidden";
