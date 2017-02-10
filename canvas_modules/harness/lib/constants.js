/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
