/*
 * Copyright 2023 Elyra Authors
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

// These utility functions are used by both toolbar-sub-menu.jsx AND
// toolbar-sub-panel.jsx to position the areaEf (menu or panel) relative
// to the parent actionItemRect, passed in, in the direction indicated by
// the expandDirection parameter and constrained within the <div>
// specified by the containingDivId parameter.


// Adjust the position of the sub-area to make sure it doesn't extend
// outside the containing divs boundary. We need to do this after the subarea
// has been mounted so we can query its size and position.
export function adjustSubAreaPosition(areaRef, containingDivId, expandDirection, actionItemRect) {
	const containingDiv = document.getElementById(containingDivId);
	const containingDivRect = containingDiv.getBoundingClientRect();

	const thisAreaRect = areaRef.current.getBoundingClientRect();

	const outsideBottom = thisAreaRect.bottom - containingDivRect.bottom;
	const outsideRight = thisAreaRect.right - containingDivRect.right;

	if (expandDirection === "vertical") {
		if (outsideBottom > 0) {
			const topGap = actionItemRect.top - containingDivRect.top;
			const newTop = (topGap > thisAreaRect.height)
				? actionItemRect.top - thisAreaRect.height
				: actionItemRect.bottom - outsideBottom;

			areaRef.current.style.top = newTop + "px";
		}

		if (outsideRight > 0) {
			const newLeft = actionItemRect.left - outsideRight - 2;
			areaRef.current.style.left = newLeft + "px";
		}

	} else {
		if (outsideBottom > 0) {
			const newTop = thisAreaRect.top - outsideBottom - 2;
			areaRef.current.style.top = newTop + "px";
		}

		if (outsideRight > 0) {
			const newLeft = actionItemRect.left - thisAreaRect.width;
			areaRef.current.style.left = newLeft + "px";
		}
	}
}

export function generateSubAreaStyle(expandDirection, actionItemRect) {
	if (expandDirection === "vertical") {
		return {
			top: actionItemRect.bottom + 1,
			left: actionItemRect.left
		};
	}
	return {
		top: actionItemRect.top - 1,
		left: actionItemRect.left + actionItemRect.width
	};
}


