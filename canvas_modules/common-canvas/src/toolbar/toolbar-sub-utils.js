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


// Sets an inline style property only when its value actually changes. Avoiding
// redundant writes keeps repeated adjustments (which run on every re-render)
// from disturbing the sub-area - most importantly, clearing and re-applying
// maxHeight would reset a scrolled menu back to the top.
function setStyle(subAreaRef, prop, value) {
	if (subAreaRef.style[prop] !== value) {
		subAreaRef.style[prop] = value;
	}
}

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

	if (expandDirection === "vertical") {
		// The menu's natural (unclamped) content height. Reading scrollHeight means
		// we never have to clear an existing maxHeight clamp in order to measure -
		// clearing it would make the content momentarily fit, which resets the
		// menu's scroll position to the top on every re-render.
		const menuHeight = subAreaRef.scrollHeight;

		// Measure the menu's viewport position when top === 0 so the calculations
		// below don't depend on which ancestor is the positioning context. Changing
		// 'top' does not affect the menu's scroll position.
		subAreaRef.style.top = "0px";
		const originRect = subAreaRef.getBoundingClientRect();
		const originTop = originRect.top;

		const spaceBelow = containingDivRect.bottom - actionItemRect.bottom;
		const spaceAbove = actionItemRect.top - containingDivRect.top;

		// Decide where to put the menu so that it always stays fully within the
		// containing div, scrolling internally when it is too tall to fit.
		let targetTop = actionItemRect.bottom; // Default: drop the menu below the item.
		let maxHeight = null;

		if (menuHeight > spaceBelow) {
			// The menu is too tall to fit below the item.
			if (menuHeight <= spaceAbove) {
				// It fits fully above the item, so flip it up.
				targetTop = actionItemRect.top - menuHeight;
			} else if (spaceBelow >= spaceAbove) {
				// It doesn't fit either way, but there is more room below the item.
				// Keep it below and clamp its height so it scrolls internally.
				targetTop = actionItemRect.bottom;
				maxHeight = spaceBelow;
			} else {
				// There is more room above: pin the menu to the top of the
				// containing div, above the item, and clamp it so it scrolls.
				targetTop = containingDivRect.top;
				maxHeight = spaceAbove;
			}
		}

		// Only write styles that actually change, so that unrelated re-renders
		// (e.g. focus/hover changes while the cursor moves over the toolbar) don't
		// disturb the menu - in particular, they don't reset its scroll position.
		setStyle(subAreaRef, "top", (targetTop - originTop) + "px");
		if (maxHeight === null) {
			setStyle(subAreaRef, "maxHeight", "");
			setStyle(subAreaRef, "overflowY", "");
		} else {
			setStyle(subAreaRef, "maxHeight", Math.max(maxHeight, 0) + "px");
			setStyle(subAreaRef, "overflowY", "auto");
		}

		const outsideRight = actionItemRect.left + originRect.width - containingDivRect.right;
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
		// Horizontal expansion is used by cascade sub-menus and sub-panels. They
		// are position:fixed (see .subarea-cascade in toolbar.scss) so that they
		// are not clipped by a scrollable parent menu's overflow, which means we
		// position them in viewport coordinates here.
		const subAreaRect = subAreaRef.getBoundingClientRect();
		const menuHeight = subAreaRef.scrollHeight;

		// Open to the right of the item, or flip to the left when there isn't room.
		const spaceRight = containingDivRect.right - actionItemRect.right;
		const left = (subAreaRect.width > spaceRight)
			? actionItemRect.left - subAreaRect.width
			: actionItemRect.right;
		setStyle(subAreaRef, "left", left + "px");

		// Top-align with the item, then shift up if the bottom would overflow the
		// containing div - but never above the containing div's top.
		let topPos = actionItemRect.top - 1;
		const overflowBottom = (topPos + menuHeight) - containingDivRect.bottom;
		if (overflowBottom > 0) {
			topPos = Math.max(topPos - overflowBottom, containingDivRect.top);
		}
		setStyle(subAreaRef, "top", topPos + "px");

		// If the cascade is itself taller than the available space, clamp and scroll.
		const availableHeight = containingDivRect.bottom - topPos;
		if (menuHeight > availableHeight) {
			setStyle(subAreaRef, "maxHeight", Math.max(availableHeight, 0) + "px");
			setStyle(subAreaRef, "overflowY", "auto");
		} else {
			setStyle(subAreaRef, "maxHeight", "");
			setStyle(subAreaRef, "overflowY", "");
		}
	}
}

/** Applies the initial position for a cascade sub-area directly to the DOM
 * element via CSSOM writes so that no inline style= attribute is created.
 * This is the CSSOM equivalent of the former generateSubAreaStyle() React prop
 * and is called before adjustSubAreaPosition() refines the placement.
 *
 * @param {HTMLElement} subAreaRef - The sub-area DOM element.
 * @param {string} expandDirection - "vertical" or "horizontal".
 * @param {object} actionItemRect - Bounding rect of the triggering toolbar item.
 */
export function applySubAreaInitialStyle(subAreaRef, expandDirection, actionItemRect) {
	if (!subAreaRef || !actionItemRect) {
		return;
	}

	// Cascade sub-areas use position:fixed so they are not clipped by a scrollable
	// parent menu's overflow. Because they are fixed, the initial position is
	// expressed in viewport coordinates (adjustSubAreaPosition refines it).
	subAreaRef.style.top = (expandDirection === "vertical"
		? actionItemRect.bottom + 1
		: actionItemRect.top - 1) + "px";
	subAreaRef.style.left = (expandDirection === "vertical"
		? actionItemRect.left
		: actionItemRect.right) + "px";
}


