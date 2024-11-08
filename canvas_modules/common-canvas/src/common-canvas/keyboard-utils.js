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
const SPACE_KEY = "Space";
const LEFT_ARROW_KEY = "ArrowLeft";
const RIGHT_ARROW_KEY = "ArrowRight";
const UP_ARROW_KEY = "ArrowUp";
const DOWN_ARROW_KEY = "ArrowDown";
const ESC_KEY = "Escape";
const SLASH_KEY = "Slash";
const EQUAL_KEY = "Equal";
const MINUS_KEY = "Minus";
const TAB_KEY = "Tab";
const BACKSPACE_KEY = "Backspace";
const DELETE_KEY = "Delete";
const A_KEY = "KeyA";
const C_KEY = "KeyC";
const P_KEY = "KeyP";
const V_KEY = "KeyV";
const X_KEY = "KeyX";
const Y_KEY = "KeyY";
const Z_KEY = "KeyZ";
const ZERO_KEY = "Digit0";

const LEFT_SQUARE_BRACKET_KEY = "BracketLeft";
const RIGHT_SQUARE_BRACKET_KEY = "BracketRight";


export default class KeyboardUtils {

	/* ----------------------------------------- */
	/* Canvas navigation key functions           */
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

	static nextObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === RIGHT_ARROW_KEY;
	}

	static previousObjectInGroup(d3Event) {
		return !this.isMetaKey(d3Event) && !d3Event.shiftKey && d3Event.code === LEFT_ARROW_KEY;
	}

	// The calling code will differentiate between a single select
	// or an 'extra' select that adds to the set of selected objects.
	static selectObject(d3Event) {
		return d3Event.code === RETURN_KEY;
	}

	static nextSiblingLink(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === RIGHT_SQUARE_BRACKET_KEY;
	}

	static previousSiblingLink(d3Event) {
		return this.isMetaKey(d3Event) && d3Event.code === LEFT_SQUARE_BRACKET_KEY;
	}

	// Shortcut to display either a context menu or context
	// toolbar, depending on which is enabled, for the
	// canvas or objects on the canvas.
	// Note: We don't use a augmentation key (Cmnd or Ctrl or Shift)
	// for this shortcut because displaying context options
	// involves auto-select which uses augmentation keys for
	// adding selections to the set of selections.
	static displayContextOptions(evt) {
		return this.isMetaKey(evt) && evt.code === SLASH_KEY;
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
	/* Text Toolbar key functions                */
	/* ----------------------------------------- */

	static returnToTextEditing(evt) {
		return evt.code === TAB_KEY && !evt.shiftKey;
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
