/*
 * Copyright 2025 Elyra Authors
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

import CanvasUtils from "./common-canvas-utils.js";

const RETURN_KEY = "Enter"; // Return key on the Mac
const SPACE_KEY = "Space";
const LEFT_ARROW_KEY = "ArrowLeft";
const RIGHT_ARROW_KEY = "ArrowRight";
const UP_ARROW_KEY = "ArrowUp";
const DOWN_ARROW_KEY = "ArrowDown";
const LAB_KEY = "Comma"; // Left angle bracket
const RAB_KEY = "Period"; // Right angle bracket
const ESC_KEY = "Escape";
const PERIOD_KEY = "Period";
const SLASH_KEY = "Slash";
const EQUAL_KEY = "Equal";
const MINUS_KEY = "Minus";
const TAB_KEY = "Tab";
const BACKSPACE_KEY = "Backspace";
const DELETE_KEY = "Delete";

const A_KEY = "KeyA";
const B_KEY = "KeyB";
const C_KEY = "KeyC";
const E_KEY = "KeyE";
const I_KEY = "KeyI";
const K_KEY = "KeyK";
const P_KEY = "KeyP";
const V_KEY = "KeyV";
const X_KEY = "KeyX";
const Y_KEY = "KeyY";
const Z_KEY = "KeyZ";

const SEVEN_KEY = "Digit7";
const EIGHT_KEY = "Digit8";
const ZERO_KEY = "Digit0";

export default class KeyboardUtils {

	/* ----------------------------------------- */
	/* Canvas navigation                         */
	/* ----------------------------------------- */

	static spaceKey(evt) {
		return evt.code === SPACE_KEY;
	}

	static toggleLogging(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.altKey && evt.code === P_KEY;
	}

	static selectAll(evt) {
		return this.isMetaKey(evt) && !evt.shiftKey && evt.code === A_KEY;
	}

	static deselectAll(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === A_KEY;
	}

	static delete(evt) {
		return (evt.code === BACKSPACE_KEY || evt.code === DELETE_KEY);
	}

	static undo(evt) {
		return this.isMetaKey(evt) && !evt.shiftKey && evt.code === Z_KEY;
	}

	static redo(evt) {
		return this.isMetaKey(evt) && ((evt.shiftKey && evt.code === Z_KEY) || evt.code === Y_KEY);
	}

	static copyToClipboard(evt) {
		return this.isMetaKey(evt) && evt.code === C_KEY;
	}

	static cutToClipboard(evt) {
		return this.isMetaKey(evt) && evt.code === X_KEY;
	}

	static pasteFromClipboard(evt) {
		return this.isMetaKey(evt) && evt.code === V_KEY;
	}

	static zoomIn(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === EQUAL_KEY;
	}

	static zoomOut(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === MINUS_KEY;
	}

	static zoomToFit(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === ZERO_KEY;
	}

	static panLeft(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === LEFT_ARROW_KEY;
	}

	static panRight(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === RIGHT_ARROW_KEY;
	}

	static panUp(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === UP_ARROW_KEY;
	}

	static panDown(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.code === DOWN_ARROW_KEY;
	}

	static nextGroup(evt) {
		return evt.code === TAB_KEY && !evt.shiftKey;
	}

	static previousGroup(evt) {
		return evt.code === TAB_KEY && evt.shiftKey;
	}

	/* ----------------------------------------- */
	/* Canvas objects navigation                 */
	/* ----------------------------------------- */

	static nextObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RIGHT_ARROW_KEY;
	}

	static previousObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === LEFT_ARROW_KEY;
	}

	static selectObject(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RETURN_KEY;
	}

	static selectObjectAugment(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RETURN_KEY;
	}

	static selectObjectRange(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === RETURN_KEY;
	}

	static nextSiblingLink(d3Event) {
		return d3Event.code === DOWN_ARROW_KEY;
	}

	static previousSiblingLink(d3Event) {
		return d3Event.code === UP_ARROW_KEY;
	}

	// Shortcut to display either a context menu or context
	// toolbar, depending on which is enabled, for the
	// canvas or objects on the canvas.
	static displayContextOptions(evt) {
		return this.isMetaKey(evt) && evt.code === SLASH_KEY;
	}

	static moveObjectLeft(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === LEFT_ARROW_KEY;
	}

	static moveObjectRight(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RIGHT_ARROW_KEY;
	}

	static moveObjectUp(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === UP_ARROW_KEY;
	}

	static moveObjectDown(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === DOWN_ARROW_KEY;
	}

	static sizeObjectLeft(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === LEFT_ARROW_KEY;
	}

	static sizeObjectRight(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === RIGHT_ARROW_KEY;
	}

	static sizeObjectUp(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === UP_ARROW_KEY;
	}

	static sizeObjectDown(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === DOWN_ARROW_KEY;
	}

	/* Link creation */

	static createLink(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === PERIOD_KEY;
	}

	/* Comment display */

	static scrollTextUp(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.altKey && d3Event.code === DOWN_ARROW_KEY;
	}

	static scrollTextDown(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.altKey && d3Event.code === UP_ARROW_KEY;
	}

	/* ----------------------------------------- */
	/* Comment Text Entry                        */
	/* ----------------------------------------- */

	static cancelTextEntry(d3Event) {
		return d3Event.code === ESC_KEY;
	}

	static completeTextEntry(d3Event) {
		return d3Event.shiftKey && d3Event.code === RETURN_KEY;
	}

	static returnToTextEditing(evt) {
		return !evt.shiftKey && evt.code === TAB_KEY;
	}

	// During text entry this might either complete the text entry OR
	// add a new line.
	static returnCommand(d3Event) {
		return d3Event.code === RETURN_KEY;
	}

	/* Markdown text entry shortcuts */

	static boldCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === B_KEY;
	}

	static italicsCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === I_KEY;
	}

	static strikethroughCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === X_KEY;
	}

	static numberedListCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === SEVEN_KEY;
	}

	static bulletedListCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === EIGHT_KEY;
	}

	static codeCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === E_KEY;
	}

	static linkCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === K_KEY;
	}

	static quoteCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.code === RAB_KEY;
	}

	static incHashesCommand(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RAB_KEY;
	}

	static decHashesCommand(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === LAB_KEY;
	}

	/* ----------------------------------------- */
	/* Toolbar                                   */
	/* ----------------------------------------- */

	static openSubArea(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static closeSubArea(evt) {
		return evt.code === ESC_KEY;
	}

	static openSubAreaFromMenu(evt) {
		return evt.code === RIGHT_ARROW_KEY;
	}

	static closeSubAreaToMenu(evt) {
		return evt.code === LEFT_ARROW_KEY;
	}

	static setFocusOnNextToolbarBtn(evt) {
		return evt.code === RIGHT_ARROW_KEY;
	}

	static setFocusOnPreviousToolbarBtn(evt) {
		return evt.code === LEFT_ARROW_KEY;
	}

	static setFocusOnNextMenuItem(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static setFocusOnPreviousMenuItem(evt) {
		return evt.code === UP_ARROW_KEY;
	}

	/* ----------------------------------------- */
	/* Color Picker                              */
	/* ----------------------------------------- */

	static nextColor(evt) {
		return evt.code === RIGHT_ARROW_KEY;
	}

	static previousColor(evt) {
		return evt.code === LEFT_ARROW_KEY;
	}

	static aboveColor(evt) {
		return evt.code === UP_ARROW_KEY;
	}

	static belowColor(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static selectColor(evt) {
		return evt.code === RETURN_KEY || evt.code === SPACE_KEY;
	}

	static tabKey(evt) {
		return evt.code === TAB_KEY;
	}

	/* ----------------------------------------- */
	/* Notification panel key functions          */
	/* ----------------------------------------- */

	static activateButton(evt) {
		return evt.code === RETURN_KEY || evt.code === SPACE_KEY;
	}

	static nextSection(evt) {
		return !evt.shiftKey && evt.code === TAB_KEY;
	}

	static previousSection(evt) {
		return evt.shiftKey && evt.code === TAB_KEY;
	}

	/* ----------------------------------------- */
	/* Context Menu key functions                */
	/* ----------------------------------------- */

	static nextContextMenuOption(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static previousContextMenuOption(evt) {
		return evt.code === UP_ARROW_KEY;
	}

	static openContextMenuSubMenu(evt) {
		return evt.code === RIGHT_ARROW_KEY;
	}

	static closeContextMenuSubMenu(evt) {
		return evt.code === LEFT_ARROW_KEY || evt.code === ESC_KEY;
	}

	static activateContextMenuOption(evt) {
		return evt.code === RETURN_KEY || evt.code === SPACE_KEY;
	}

	static closeContextMenu(evt) {
		return evt.code === ESC_KEY;
	}

	/* ----------------------------------------- */
	/* Palette key functions                */
	/* ----------------------------------------- */

	static openCategory(evt) {
		return evt.code === RETURN_KEY || evt.code === SPACE_KEY;
	}

	static fromCategoryToFirstNode(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static nextNodeInCategory(evt) {
		return evt.code === DOWN_ARROW_KEY;
	}

	static previousNodeInCategory(evt) {
		return evt.code === UP_ARROW_KEY;
	}

	static createAutoNode(evt) {
		return !evt.shiftKey && (evt.code === SPACE_KEY || evt.code === RETURN_KEY);
	}

	static createAutoNodeNoLink(evt) {
		return evt.shiftKey && (evt.code === SPACE_KEY || evt.code === RETURN_KEY);
	}

	/* ----------------------------------------- */
	/* Utility functions                         */
	/* ----------------------------------------- */

	// Returns true if either the 'Command Key' on Mac or
	// 'Control Key' or 'Windows key' on Windows is pressed.
	// evnt can be either a regular event object OR the
	// d3event object provided by d3.
	static isMetaKey(evt) {
		if (CanvasUtils.isMacintosh()) {
			return evt.metaKey;
		}
		return evt.ctrlKey || evt.metaKey;
	}
}
