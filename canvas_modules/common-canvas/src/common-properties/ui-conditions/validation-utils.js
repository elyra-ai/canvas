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

/**
* Check if the given propertyId is a nested control, and if the messageInfo applies to that specific cell
*
* @param {object} propertyId. required
* @param {object} messageInfo. required
*/
function doesErrorMessageApplyToCell(propertyId, messageInfo) {
	if (propertyId?.propertyId && messageInfo.propertyId?.propertyId) {
		const currentCellRow = propertyId?.propertyId?.row;
		const currentCellCol = propertyId?.propertyId?.col;
		const errorCellRow = messageInfo[currentCellRow];
		if (!errorCellRow || (typeof currentCellCol !== "undefined" && typeof errorCellRow[currentCellCol] === "undefined")) {
			return false;
		}
	} else if (typeof propertyId?.index !== "undefined" && messageInfo.propertyId?.propertyId) { // selectColumns
		const currentCellRow = propertyId.index;
		const errorCellRow = messageInfo[currentCellRow];
		if (!errorCellRow) {
			return false;
		}
	}
	return true;
}

export {
	doesErrorMessageApplyToCell
};
