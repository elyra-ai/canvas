/****************************************************************
 ** IBM Confidential
 **
 ** OCO Source Materials
 **
 ** NextGen Workbench
 **
 ** (c) Copyright IBM Corp. 2017
 **
 ** The source code for this program is not published or otherwise
 ** divested of its trade secrets, irrespective of what has been
 ** deposited with the U.S. Copyright Office.
 *****************************************************************/

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
	VISIBLE: "25px"
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
