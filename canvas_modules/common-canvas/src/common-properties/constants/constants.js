/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function _defineConstant(key, value) {
	Object.defineProperty(module.exports, key, {
		value: value,
		enumerable: true,
		writable: false
	});
}

_defineConstant("CHARACTER_LIMITS", {
	NODE_PROPERTIES_DIALOG_TEXT_FIELD: 128,
	NODE_PROPERTIES_DIALOG_TEXT_AREA: 1024
});

_defineConstant("CONDITION_ERROR_MESSAGE", {
	HIDDEN: "0px",
	VISIBLE: "30px"
});

_defineConstant("DEFAULT_VALIDATION_MESSAGE", {
	type: "info",
	text: ""
});

_defineConstant("VALIDATION_MESSAGE", {
	WARNING: "#FDD600",
	ERROR: "#E71D32",
	DISABLED: "#D8D8D8"
});

_defineConstant("OKAY", "OK");
_defineConstant("CANCEL", "Cancel");

_defineConstant("DATA_TYPES", [
	"integer",
	"double",
	"string",
	"date",
	"time",
	"timestamp"
]);

_defineConstant("EDITOR_CONTROL", "editor-control-");

_defineConstant("TOOL_TIP_DELAY", 1000);
