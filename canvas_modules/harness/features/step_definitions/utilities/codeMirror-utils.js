/*
 * Copyright 2017-2020 IBM Corporation
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

/* global document */

function setTextValue(text, append) {
	const container = document.getElementsByClassName("properties-expression-editor")[0];
	var editor = container.getElementsByClassName("CodeMirror")[0].CodeMirror;
	const newValue = (append) ? editor.getValue() + " " + text : text;
	editor.setValue(newValue);
	editor.setCursor(1, text.length - 1);
	return;
}

function getAutoCompleteCount(text) {
	const container = document.getElementsByClassName("properties-expression-editor")[0];
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
	const container = document.getElementsByClassName("properties-expression-editor")[0];
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
