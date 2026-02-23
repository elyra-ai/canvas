/*
 * Copyright 2017-2026 Elyra Authors
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

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import PropTypes from "prop-types";

import { Button } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
import KeyboardUtils from "../common-canvas/keyboard-utils.js";
import ToolbarSubMenu from "./toolbar-sub-menu.jsx";

const ToolbarOverflowItem = forwardRef(({
	index,
	action,
	label,
	size,
	subMenuActions,
	setOverflowIndex,
	toolbarActionHandler,
	instanceId,
	containingDivId,
	toolbarFocusAction,
	setToolbarFocusAction,
	isFocusInToolbar,
	closeAnyOpenSubArea
}, ref) => {

	const [showExtendedMenu, setShowExtendedMenu] = useState(false);

	const buttonRef = useRef(null);

	// Manage button focus
	useEffect(() => {
		if (toolbarFocusAction === action && isFocusInToolbar && !showExtendedMenu) {
			buttonRef.current.focus();
		}
	}, [toolbarFocusAction, isFocusInToolbar, showExtendedMenu]);


	// Manage event listener for clicking outside the overflow menu.
	useEffect(() => {
		document.addEventListener("click", clickOutside, false);

		return () => {
			document.removeEventListener("click", clickOutside, false);
		};

	}, [toolbarFocusAction, isFocusInToolbar, showExtendedMenu]);


	// Expose methods to toolbar.jsx
	useImperativeHandle(ref, () => ({
		getAction: () => action,

		isSubAreaDisplayed: () => showExtendedMenu,

		closeSubArea: () => closeSubArea()
	}));

	function onKeyDown(evt) {
		if (KeyboardUtils.closeSubArea(evt)) {
			closeSubArea();

		} else if (KeyboardUtils.openSubArea(evt)) {
			openSubArea();
		}
		// Left and Right arrow clicks are caught in the
		// toolbar.jsx onKeyDown method.
	}

	function closeSubArea() {
		setOverflowIndex(null); // Clear the indexes
		setShowExtendedMenu(false);
		setToolbarFocusAction(action); // This will not set focus on this item
	}

	function openSubArea() {
		closeAnyOpenSubArea();
		setOverflowIndex(index);
		setShowExtendedMenu(true);
		setToolbarFocusAction(action);
	}

	function genOverflowButtonClassName() {
		return "toolbar-overflow-container " + genIndexClassName();
	}

	function genIndexClassName() {
		return "toolbar-index-" + index;
	}

	// When the overflow item is clicked to open the overflow menu we must set the
	// index of the overflow items so the overflow menu can be correctly constructed.
	// The overflow index values are used to split out the overflow menu action items
	// from the left bar and right bar.
	// When the overflow menu is closed we set the overflow index values to null.
	function toggleExtendedMenu() {
		if (showExtendedMenu) {
			closeSubArea();

		} else {
			openSubArea();
		}
	}

	function clickOutside(evt) {
		if (showExtendedMenu) {
			// Selector for the overflow-container that contains the overflow icon
			// and submenu (if submenu is open).
			const selector = "." + genIndexClassName();
			const isClickInOverflowContainer = evt.target.closest(selector);
			if (!isClickInOverflowContainer) {
				setShowExtendedMenu(false);
			}
		}
	}

	let overflowMenu = null;
	if (showExtendedMenu) {
		const actionItemRect = buttonRef.current.getBoundingClientRect();
		overflowMenu = (
			<ToolbarSubMenu
				subMenuActions={subMenuActions}
				instanceId={instanceId}
				toolbarActionHandler={toolbarActionHandler}
				closeSubArea={closeSubArea}
				setToolbarFocusAction={setToolbarFocusAction}
				actionItemRect={actionItemRect}
				expandDirection={"vertical"}
				containingDivId={containingDivId}
				parentSelector={".toolbar-overflow-container"}
				isOverflowMenu
				isCascadeMenu={false}
				size={size}
			/>
		);
	}

	const tabIndex = toolbarFocusAction === action ? 0 : -1;

	return (
		<div className={genOverflowButtonClassName()} data-toolbar-action={action}>
			<div className={"toolbar-overflow-item"}>
				<Button
					ref={buttonRef}
					kind="ghost"
					tabIndex={tabIndex}
					onClick={toggleExtendedMenu}
					onKeyDown={onKeyDown}
					aria-label={label}
					aria-hidden={tabIndex === -1}
					size={size}
				>
					<div className="toolbar-item-content default">
						<div className="content-main">
							<div className="toolbar-icon">
								<OverflowMenuVertical />
							</div>
						</div>
					</div>
				</Button>
			</div>
			{overflowMenu}
		</div>
	);
});

// This prevents a lint warning about display name missing.
ToolbarOverflowItem.displayName = "ToolbarOverflowItem";

ToolbarOverflowItem.propTypes = {
	index: PropTypes.number.isRequired,
	action: PropTypes.string,
	label: PropTypes.string,
	size: PropTypes.oneOf(["md", "sm", "lg"]),
	subMenuActions: PropTypes.array,
	setOverflowIndex: PropTypes.func,
	toolbarActionHandler: PropTypes.func,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	toolbarFocusAction: PropTypes.string,
	setToolbarFocusAction: PropTypes.func,
	isFocusInToolbar: PropTypes.bool,
	closeAnyOpenSubArea: PropTypes.func
};

export default ToolbarOverflowItem;
