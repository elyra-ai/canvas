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

// These utility functions are used by both toolbar-sub-menu.jsx AND
// toolbar-sub-panel.jsx to position the sub-area (sub-menu or sub-panel)
// relative to the parent actionItemRect, passed in, in the direction
// indicated by the expandDirection parameter and constrained within
// the <div> specified by the containingDivId parameter.


// Adjust the position of the sub-area to make sure it doesn't extend
// outside the containing divs boundary. We need to do this after the subarea
// has been mounted so we can query its size and position.
export function adjustSubAreaPosition(subAreaRef, containingDivId, expandDirection, actionItemRect) {
	if (!subAreaRef || !actionItemRect || !containingDivId) {
		return;
	}
	const containingDiv = document.getElementById(containingDivId);
	const containingDivRect = containingDiv
		? containingDiv.getBoundingClientRect()
		: { top: -1000, bottom: 1000, left: -1000, right: 1000 }; // To enable Jest tests.

	const subAreaRect = subAreaRef.getBoundingClientRect();

	// Calculate the amount that the panel/menu is outside of the containing div
	// edges. Positive value means it is outside. Negative is inside.
	const outsideBottom = actionItemRect.bottom + subAreaRect.height - containingDivRect.bottom;

	if (expandDirection === "vertical") {
		const outsideRight = actionItemRect.left + subAreaRect.width - containingDivRect.right;

		if (outsideBottom > 0) {
			const topGap = actionItemRect.top - containingDivRect.top;
			const newTop = (topGap > subAreaRect.height)
				? -(subAreaRect.height)
				: -(outsideBottom);

			subAreaRef.style.top = newTop + "px";
		}

		if (outsideRight > 0) {
			// If one of our parent objects contains the "floating-toolbar" class, we assume
			// the toolbar is displayed in an 'absolute' position. This changes the offset calculations
			// for the sub-area being displayed.
			const floatingToolbar = subAreaRef.closest(".floating-toolbar");

			const newLeft = floatingToolbar
				? actionItemRect.left - floatingToolbar.getBoundingClientRect().left - outsideRight
				: actionItemRect.left - containingDivRect.left - outsideRight;
			subAreaRef.style.left = newLeft + "px";
		}

	} else {
		const outsideRight = actionItemRect.right + subAreaRect.width - containingDivRect.right;

		if (outsideBottom > 0) {
			const newTop = -(outsideBottom + 2);
			subAreaRef.style.top = newTop + "px";
		}

		if (outsideRight > 0) {
			const newLeft = -(subAreaRect.width);
			subAreaRef.style.left = newLeft + "px";
		}
	}
}

export function generateSubAreaStyle(expandDirection, actionItemRect) {
	if (!actionItemRect) {
		return null;
	}

	if (expandDirection === "vertical") {
		return {
			top: actionItemRect.height + 1,
			left: actionItemRect.left
		};
	}
	return {
		top: -1,
		left: actionItemRect.width
	};
}


