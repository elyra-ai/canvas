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
// const SPACE_KEY = 32;
const LEFT_ARROW_KEY = "ArrowLeft";
// const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = "ArrowRight";
// const DOWN_ARROW_KEY = 40;
// const L_KEY = 76;
const LEFT_SQUARE_BRACKET_KEY = "BracketLeft";
const RIGHT_SQUARE_BRACKET_KEY = "BracketRight";


export default class KeyboardUtils {

	static nextObjectInGroup(d3Event) {
		return d3Event.code === RIGHT_ARROW_KEY;
	}

	static previousObjectInGroup(d3Event) {
		return d3Event.code === LEFT_ARROW_KEY;
	}

	// The calling code will differentiate between a single select
	// or an 'extra' select that adds to the set of selected objects.
	static selectObject(d3Event) {
		return d3Event.code === RETURN_KEY;
	}

	// static selectExtraObject(d3Event) {
	// 	return d3Event.code === RETURN_KEY && this.isCmndCtrlPressed(d3Event);
	// }

	static nextSiblingLink(d3Event) {
		return d3Event.code === RIGHT_SQUARE_BRACKET_KEY;
	}

	static previousSiblingLink(d3Event) {
		return d3Event.code === LEFT_SQUARE_BRACKET_KEY;
	}

	// Returns true if either the Command Key on Mac or Control key on Windows
	// is pressed. evnt can be either a regular event object OR the
	// d3event object provided by d3.
	static isCmndCtrlPressed(evnt) {
		if (CanvasUtils.isMacintosh()) {
			return evnt.metaKey;
		}
		return evnt.ctrlKey;
	}



}
