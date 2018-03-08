/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global document */

function setTextValue(text, append) {
	const container = document.getElementsByClassName("expression_editor_control")[0];
	var editor = container.getElementsByClassName("CodeMirror")[0].CodeMirror;
	const newValue = (append) ? editor.getValue() + " " + text : text;
	editor.setValue(newValue);
	editor.setCursor(1, text.length - 1);
	return;
}

function getAutoCompleteCount(text) {
	const container = document.getElementsByClassName("expression_editor_control")[0];
	var editor = container.getElementsByClassName("CodeMirror")[0].CodeMirror;
	editor.setValue(text);
	editor.setCursor(1, text.length - 1);
	var ctrlEvent = {
		code: "ControlLeft",
		ctrlKey: true,
		key: "Control",
		keyCode: 17,
		type: "keydown",
		which: 17
	};
	editor.triggerOnKeyDown(ctrlEvent);
	var spaceEvent = {
		code: "Space",
		ctrlKey: true,
		key: " ",
		keyCode: 32,
		type: "keydown",
		which: 32
	};
	editor.triggerOnKeyDown(spaceEvent);

	const hintsUL = document.getElementsByClassName("CodeMirror-hints")[0];
	const hints = hintsUL.getElementsByTagName("li");
	return hints.length;
}

function selectAutoComplete(text) {
	const container = document.getElementsByClassName("expression_editor_control")[0];
	var editor = container.getElementsByClassName("CodeMirror")[0].CodeMirror;
	editor.setValue(text);
	editor.setCursor(1, text.length - 1);
	var ctrlEvent = {
		code: "ControlLeft",
		ctrlKey: true,
		key: "Control",
		keyCode: 17,
		type: "keydown",
		which: 17
	};
	editor.triggerOnKeyDown(ctrlEvent);
	var spaceEvent = {
		code: "Space",
		ctrlKey: true,
		key: " ",
		keyCode: 32,
		type: "keydown",
		which: 32
	};
	editor.triggerOnKeyDown(spaceEvent);

	// select the first one in the list of hints and make sure it is the selectText
	const hintsUL = document.getElementsByClassName("CodeMirror-hints")[0];
	const hints = hintsUL.getElementsByTagName("li");
	hints[0].click();

	return;
}


module.exports = {
	getAutoCompleteCount: getAutoCompleteCount,
	selectAutoComplete: selectAutoComplete,
	setTextValue: setTextValue
};
