/*
 * Copyright 2024 Elyra Authors
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
const LEFT_ARROW_KEY = "ArrowLeft";
const RIGHT_ARROW_KEY = "ArrowRight";
const UP_ARROW_KEY = "ArrowUp";
const DOWN_ARROW_KEY = "ArrowDown";
const ESC_KEY = "Escape";
const TAB_KEY = "Tab";
const BACKSPACE_KEY = "Backspace";
const DELETE_KEY = "Delete";
const SPACE_KEY = "Space";

const SPACE_CHAR_KEY = " ";
const COMMA_CHAR_KEY = ",";

const A_KEY = "a";
const B_KEY = "b";
const C_KEY = "c";
const E_KEY = "e";
const I_KEY = "i";
const K_KEY = "k";
const L_KEY = "l";
const P_KEY = "p";
const V_KEY = "v";
const X_KEY = "x";
const Y_KEY = "y";
const Z_KEY = "z";

const F10_KEY = "F10";

const SEVEN_KEY = "7";
const EIGHT_KEY = "8";
const NINE_KEY = "9";
const ZERO_KEY = "0";


export default class KeyboardUtils {

	/* ----------------------------------------- */
	/* Canvas navigation                         */
	/* ----------------------------------------- */

	static spaceKey(evt) {
		return this.isSpaceKey(evt);
	}

	static toggleLogging(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.altKey && evt.key === P_KEY;
	}

	static selectAll(evt) {
		return this.isMetaKey(evt) && !evt.shiftKey && evt.key === A_KEY;
	}

	static deselectAll(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === A_KEY;
	}

	static delete(evt) {
		return (evt.key === BACKSPACE_KEY || evt.key === DELETE_KEY);
	}

	static undo(evt) {
		return this.isMetaKey(evt) && !evt.shiftKey && evt.key === Z_KEY;
	}

	static redo(evt) {
		return this.isMetaKey(evt) && ((evt.shiftKey && evt.key === Z_KEY) || evt.key === Y_KEY);
	}

	static copyToClipboard(evt) {
		return this.isMetaKey(evt) && evt.key === C_KEY;
	}

	static cutToClipboard(evt) {
		return this.isMetaKey(evt) && evt.key === X_KEY;
	}

	static pasteFromClipboard(evt) {
		return this.isMetaKey(evt) && evt.key === V_KEY;
	}

	static zoomIn(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === EIGHT_KEY;
	}

	static zoomOut(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === NINE_KEY;
	}

	static zoomToFit(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === ZERO_KEY;
	}

	static panLeft(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === LEFT_ARROW_KEY;
	}

	static panRight(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === RIGHT_ARROW_KEY;
	}

	static panUp(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === UP_ARROW_KEY;
	}

	static panDown(evt) {
		return this.isMetaKey(evt) && evt.shiftKey && evt.key === DOWN_ARROW_KEY;
	}

	static nextGroup(evt) {
		return !evt.shiftKey && evt.key === TAB_KEY;
	}

	static previousGroup(evt) {
		return evt.shiftKey && evt.key === TAB_KEY;
	}

	/* ----------------------------------------- */
	/* Canvas objects navigation                 */
	/* ----------------------------------------- */

	static nextObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === RIGHT_ARROW_KEY;
	}

	static previousObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === LEFT_ARROW_KEY;
	}

	static selectObject(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === RETURN_KEY;
	}

	static selectObjectAugment(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === RETURN_KEY;
	}

	static selectObjectRange(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === RETURN_KEY;
	}

	static nextSiblingLink(d3Event) {
		return d3Event.key === DOWN_ARROW_KEY;
	}

	static previousSiblingLink(d3Event) {
		return d3Event.key === UP_ARROW_KEY;
	}

	// Shortcut to display either a context menu or context
	// toolbar, depending on which is enabled, for the
	// canvas or objects on the canvas.
	static displayContextOptions(evt) {
		return (this.isMetaKey(evt) && evt.key === COMMA_CHAR_KEY) ||
			(evt.shiftKey && evt.key === F10_KEY);
	}

	static moveObjectLeft(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === LEFT_ARROW_KEY;
	}

	static moveObjectRight(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === RIGHT_ARROW_KEY;
	}

	static moveObjectUp(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === UP_ARROW_KEY;
	}

	static moveObjectDown(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === DOWN_ARROW_KEY;
	}

	static sizeObjectLeft(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === LEFT_ARROW_KEY;
	}

	static sizeObjectRight(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === RIGHT_ARROW_KEY;
	}

	static sizeObjectUp(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === UP_ARROW_KEY;
	}

	static sizeObjectDown(d3Event) {
		return !this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === DOWN_ARROW_KEY;
	}

	/* Link creation */

	static createLink(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === L_KEY;
	}

	/* Comment display */

	static scrollTextUp(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.altKey && d3Event.key === DOWN_ARROW_KEY;
	}

	static scrollTextDown(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.altKey && d3Event.key === UP_ARROW_KEY;
	}

	/* ----------------------------------------- */
	/* Comment Text Entry                        */
	/* ----------------------------------------- */

	static cancelTextEntry(d3Event) {
		return d3Event.key === ESC_KEY;
	}

	static completeTextEntry(d3Event) {
		return d3Event.shiftKey && d3Event.key === RETURN_KEY;
	}

	static returnToTextEditing(evt) {
		return !evt.shiftKey && evt.key === TAB_KEY;
	}

	// During text entry this might either complete the text entry OR
	// add a new line.
	static returnCommand(d3Event) {
		return d3Event.key === RETURN_KEY;
	}

	/* Markdown text entry shortcuts */

	static boldCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.key === B_KEY;
	}

	static italicsCommand(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === I_KEY;
	}

	static strikethroughCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === X_KEY;
	}

	static numberedListCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === SEVEN_KEY;
	}

	static bulletedListCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === EIGHT_KEY;
	}

	static codeCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.key === E_KEY;
	}

	static linkCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.key === K_KEY;
	}

	static quoteCommand(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.shiftKey && d3Event.key === I_KEY;
	}

	static incHashesCommand(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === RIGHT_ARROW_KEY;
	}

	static decHashesCommand(d3Event) {
		return this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.key === LEFT_ARROW_KEY;
	}

	/* ----------------------------------------- */
	/* Toolbar                                   */
	/* ----------------------------------------- */

	static openSubArea(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static closeSubArea(evt) {
		return evt.key === ESC_KEY;
	}

	static openSubAreaFromMenu(evt) {
		return evt.key === RIGHT_ARROW_KEY;
	}

	static closeSubAreaToMenu(evt) {
		return evt.key === LEFT_ARROW_KEY;
	}

	static setFocusOnNextToolbarBtn(evt) {
		return evt.key === RIGHT_ARROW_KEY;
	}

	static setFocusOnPreviousToolbarBtn(evt) {
		return evt.key === LEFT_ARROW_KEY;
	}

	static setFocusOnNextMenuItem(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static setFocusOnPreviousMenuItem(evt) {
		return evt.key === UP_ARROW_KEY;
	}

	/* ----------------------------------------- */
	/* Color Picker                              */
	/* ----------------------------------------- */

	static nextColor(evt) {
		return evt.key === RIGHT_ARROW_KEY;
	}

	static previousColor(evt) {
		return evt.key === LEFT_ARROW_KEY;
	}

	static aboveColor(evt) {
		return evt.key === UP_ARROW_KEY;
	}

	static belowColor(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static selectColor(evt) {
		return evt.key === RETURN_KEY || this.isSpaceKey(evt);
	}

	static tabKey(evt) {
		return evt.key === TAB_KEY;
	}

	/* ----------------------------------------- */
	/* Notification panel key functions          */
	/* ----------------------------------------- */

	static activateButton(evt) {
		return evt.key === RETURN_KEY || this.isSpaceKey(evt);
	}

	static nextSection(evt) {
		return !evt.shiftKey && evt.key === TAB_KEY;
	}

	static previousSection(evt) {
		return evt.shiftKey && evt.key === TAB_KEY;
	}

	/* ----------------------------------------- */
	/* Context Menu key functions                */
	/* ----------------------------------------- */

	static nextContextMenuOption(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static previousContextMenuOption(evt) {
		return evt.key === UP_ARROW_KEY;
	}

	static openContextMenuSubMenu(evt) {
		return evt.key === RIGHT_ARROW_KEY;
	}

	static closeContextMenuSubMenu(evt) {
		return evt.key === LEFT_ARROW_KEY || evt.key === ESC_KEY;
	}

	static activateContextMenuOption(evt) {
		return evt.key === RETURN_KEY || this.isSpaceKey(evt);
	}

	static closeContextMenu(evt) {
		return evt.key === ESC_KEY;
	}

	/* ----------------------------------------- */
	/* Palette key functions                     */
	/* ----------------------------------------- */

	static openCategory(evt) {
		return evt.key === RETURN_KEY || this.isSpaceKey(evt);
	}

	static fromCategoryToFirstNode(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static nextNodeInCategory(evt) {
		return evt.key === DOWN_ARROW_KEY;
	}

	static previousNodeInCategory(evt) {
		return evt.key === UP_ARROW_KEY;
	}

	static createAutoNode(evt) {
		return !evt.shiftKey && (this.isSpaceKey(evt) || evt.key === RETURN_KEY);
	}

	static createAutoNodeNoLink(evt) {
		return evt.shiftKey && (this.isSpaceKey(evt) || evt.key === RETURN_KEY);
	}

	/* ----------------------------------------- */
	/* Utility functions                         */
	/* ----------------------------------------- */

	// key property can sometimes be set to "Space" (SPACE_KEY) in tests.
	static isSpaceKey(evt) {
		return evt.key === SPACE_CHAR_KEY || evt.key === SPACE_KEY;
	}

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
