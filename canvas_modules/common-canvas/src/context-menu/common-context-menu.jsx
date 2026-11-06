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
/* eslint no-empty-function: ["error", { "allow": ["arrowFunctions"] }] */

import React, { useCallback, useLayoutEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { Menu, MenuItem, MenuItemDivider } from "@carbon/react";
import withCarbonV12 from "../common-canvas/with-carbon-v12.jsx";
import ColorPicker from "../color-picker";
import { ACTION_COLOR_BACKGROUND } from "../common-canvas/constants/canvas-constants";

// context-menu sizing
const CONTEXT_MENU_WIDTH = 160; // See context-menu.scss
const CONTEXT_MENU_LINK_HEIGHT = 30; // See context-menu.scss
const CONTEXT_MENU_DIVIDER_HEIGHT = 1; // See context-menu.scss
// In Carbon v12 the native Carbon menu styles are used (see context-menu.scss).
const CONTEXT_MENU_V12_LINK_HEIGHT = 32; // Height of a menu item
const CONTEXT_MENU_V12_PADDING = 4; // Padding at the top and at the bottom of the menu
const CONTEXT_MENU_V12_DIVIDER_MARGIN = 4; // Margin above and below each divider
const EXTRA_OFFSET = 5; // Extra offset for vertical menu positioning

// Returns true if the menu item passed is enabled. The absence of the
// 'enable' property default to true.
function isItemEnabled(item) {
	return (typeof item.enable === "undefined" || item.enable === true);
}

// Returns true if all the items in a menu (or sub-menu) are disabled.
function areAllItemsDisabled(menuItems) {
	let isEnabled = false;

	for (let i = 0; i < menuItems.length; i++) {
		if (!menuItems[i].divider) {
			if (menuItems[i].submenu) {
				if (!areAllItemsDisabled(menuItems[i].menu)) {
					isEnabled = true;
				}

			} else if (isItemEnabled(menuItems[i])) {
				isEnabled = true;
			}
		}
	}
	return !isEnabled;
}

// Returns the size of the menu passed in.
function calculateMenuSize(menu, carbonV12) {
	var numDividers = 0;
	for (let i = 0; i < menu.length; ++i) {
		const divider = menu[i].divider;
		if (divider) {
			numDividers++;
		}
	}

	const linkHeight = carbonV12 ? CONTEXT_MENU_V12_LINK_HEIGHT : CONTEXT_MENU_LINK_HEIGHT;
	var menuSize = {
		height: ((menu.length - numDividers) * linkHeight) + (numDividers * CONTEXT_MENU_DIVIDER_HEIGHT),
		width: CONTEXT_MENU_WIDTH
	};

	// Carbon v12 styles add padding to the menu and margins to the dividers,
	// which are removed in v11 by context-menu.scss.
	if (carbonV12) {
		menuSize.height += (2 * CONTEXT_MENU_V12_PADDING) + (numDividers * 2 * CONTEXT_MENU_V12_DIVIDER_MARGIN);
	}

	return menuSize;
}

// Returns a new position and the canvas rectangle for the context menu based on the current
// mouse position and whether the menu would appear outside the edges of the page.
function calculateMenuPos(mousePos, menuSize, canvasRect) {
	const menuPos = { x: mousePos.x, y: mousePos.y };

	// Reposition contextMenu if it will show off the bottom of the page
	if (mousePos.y + menuSize.height > canvasRect.height) {
		menuPos.y = canvasRect.height - menuSize.height - EXTRA_OFFSET; // Move up by extra offset so it looks nice

		// If repositioning the menu would push it off the top of the page
		// (in very short browser windows) position it at the top.
		if (menuPos.y < 0) {
			menuPos.y = 0;
		}
	}

	// Reposition contextMenu if it will show off the right of the page
	if (mousePos.x + menuSize.width > canvasRect.width) {
		menuPos.x -= menuSize.width;
	}

	// Add two pixels to x and y because on Chrome without this the context menu
	// appears with  the top corner of the first menu item under the mouse
	// cursor. This highlights the first menu item (which looks weird) and, if
	// the first item is a cascade menu, automatically opens the sub-menu.
	menuPos.x += 2;
	menuPos.y += 2;

	return menuPos;
}

function onContextMenu(e) {
	e.preventDefault();
}

const CommonContextMenu = (props) => {
	const { contextHandler, menuDefinition, carbonV12 } = props;
	const intl = useIntl();

	const menuPopoverRef = useRef(null);
	const menuRefs = useRef([]);
	const focusIndex = useRef(null); // Set to null so we know when it is not initialized.
	const closing = useRef(false);
	const mounted = useRef(false);

	// Records whether the most recent user input was from the mouse (true) or
	// the keyboard (false) so we can tell how a cascaded menu was closed.
	const lastInputWasMouse = useRef(false);

	// Records whether a mouse button is currently held down outside the menu.
	// Pressing the mouse on the canvas moves focus out of the menu which makes
	// Carbon close the menu immediately. That is too early because the canvas
	// needs to see the menu is still open when it handles the mouse down, so
	// it knows the click is just closing the menu (and so doesn't clear the
	// selections). Closing is done by the canvas (on zoom start) or by the
	// context menu wrapper (on click) instead.
	const mouseDownOutsideMenu = useRef(false);

	const subMenuObserver = useRef(null);
	const subMenuFocusFrame = useRef(null);
	const subMenuCloseFrame = useRef(null);

	// Holds the latest props so callbacks passed to Carbon, and to long-lived
	// listeners, can stay stable and still see current values.
	const latestProps = useRef(props);
	latestProps.current = props;

	// Carbon's MenuItem requires a string label but menu definitions may supply
	// a React element (for example a <FormattedMessage>). This converts such an
	// element to a string using the element's message props and the intl object.
	const getLabelString = (label) => {
		if (React.isValidElement(label) && label.props?.id) {
			const { id, defaultMessage, values } = label.props;
			return intl.formatMessage({ id, defaultMessage }, values);
		}
		return label;
	};

	// Closes the menu. Closing the menu restores focus to the canvas which blurs
	// this menu while it is still mounted, and Carbon responds to that blur by
	// calling onClose again. The closing flag stops that re-entrant call from
	// recursing infinitely.
	const closeMenu = useCallback(() => {
		if (closing.current || mouseDownOutsideMenu.current) {
			return;
		}
		closing.current = true;
		try {
			latestProps.current.closeContextMenu();
		} finally {
			closing.current = false;
		}
	}, []);

	// Sets focus on the current top level menu item unless focus is already on
	// an element within the menu (other than the menu itself). This prevents
	// focus being pulled back to a top level item when, for example, focus has
	// been moved to the first item of a cascaded menu because the mouse cursor
	// is over the item that opens that menu.
	const focusCurrentItem = useCallback(() => {
		focusIndex.current = focusIndex.current === null ? 0 : focusIndex.current;

		const popover = menuPopoverRef.current;
		const active = document.activeElement;
		if (popover && active && active !== popover && popover.contains(active)) {
			return;
		}

		if (menuRefs.current[focusIndex.current]?.current) {
			menuRefs.current[focusIndex.current].current.focus();
		}
	}, []);

	// Carbon moves focus to the menu item that opened a cascaded menu when the
	// cascaded menu is closed because the mouse moved away. We want focus to
	// go to the top item in the main menu instead. We only do this if focus is
	// on one of the collapsed items (or has been lost from the menu entirely)
	// so we don't disturb focus the user has placed elsewhere in the menu.
	const focusTopItemAfterSubMenuClose = useCallback((collapsedItems) => {
		const popover = menuPopoverRef.current;
		const active = document.activeElement;
		if (!popover) {
			return;
		}
		const focusInCollapsed = collapsedItems.some((item) => item.contains(active));
		if (!focusInCollapsed && popover.contains(active)) {
			return;
		}
		focusIndex.current = 0;
		menuRefs.current[0]?.current?.focus();
	}, []);


	// Moves keyboard focus to the first focusable item in the cascaded menu
	// belonging to the given parent menu item.
	//
	// parentItem - the DOM element of the menu item that owns the cascaded menu.
	//
	// Focus is only moved when:
	//   - parentItem is expanded (aria-expanded="true"),
	//   - parentItem contains a direct child element with role="menu", and
	//   - focus is not already inside that cascaded menu.
	//
	// The target is the color picker item if the cascaded menu contains one,
	// otherwise the first direct child menuitem that is not aria-disabled.
	// If no target is found, focus is left unchanged.
	const focusFirstSubMenuItem = useCallback((parentItem) => {
		if (parentItem.getAttribute("aria-expanded") !== "true") {
			return;
		}
		const subMenu = parentItem.querySelector(":scope > [role='menu']");
		if (!subMenu || subMenu.contains(document.activeElement)) {
			return;
		}
		const first = subMenu.querySelector(".color-picker-item") ||
			subMenu.querySelector(":scope > [role='menuitem']:not([aria-disabled='true'])");
		first?.focus();
	}, []);

	// Carbon's MenuItem always sets a title attribute, equal to the label, which
	// causes the browser to display a tooltip as the mouse hovers over the item.
	// Carbon doesn't allow this to be overridden through props so we remove the
	// attribute from the DOM.
	const removeMenuItemTooltips = useCallback(() => {
		const popover = menuPopoverRef.current;
		if (!popover) {
			return;
		}
		popover.querySelectorAll("[role='menuitem'][title]").forEach((item) => item.removeAttribute("title"));
	}, []);

	// Sets CSS custom properties for the root menu position on its DOM node.
	const applyMenuPosition = useCallback(() => {
		const el = menuPopoverRef.current;
		if (!el) {
			return;
		}
		const p = latestProps.current;
		const menuSize = calculateMenuSize(p.menuDefinition, p.carbonV12);
		const menuPos = calculateMenuPos(p.mousePos, menuSize, p.canvasRect);
		el.style.setProperty("--context-menu-left", menuPos.x + "px");
		el.style.setProperty("--context-menu-top", menuPos.y + "px");
	}, []);

	const handleMenuOpen = useCallback(() => {
		applyMenuPosition();
		focusCurrentItem();
	}, [applyMenuPosition, focusCurrentItem]);

	// Watches for a menu item expanding its cascaded menu. When that happens
	// (for example, when the mouse is moved over the item) focus is moved to the
	// first item in the cascaded menu. Carbon does try to do this itself but its
	// focus manager also queues a call to focus the parent menu item and, which
	// one wins is a matter of timing. So we wait two animation frames, to let
	// Carbon finish, and then, if focus is not already inside the cascaded
	// menu, we set it ourselves.
	const observeSubMenuOpening = useCallback(() => {
		const popover = menuPopoverRef.current;
		if (!popover) {
			return;
		}
		subMenuObserver.current = new MutationObserver((mutations) => {
			// Cascaded menu items are added to the DOM when a submenu opens so
			// remove their tooltips too.
			removeMenuItemTooltips();
			const targets = mutations
				.filter((m) => m.type === "attributes")
				.map((m) => m.target);
			const expanded = targets
				.filter((t) => t.getAttribute("aria-expanded") === "true")
				.pop();
			const collapsed = targets
				.filter((t) => t.getAttribute("aria-expanded") === "false");
			if (expanded) {
				cancelAnimationFrame(subMenuFocusFrame.current);
				subMenuFocusFrame.current = requestAnimationFrame(() => {
					subMenuFocusFrame.current = requestAnimationFrame(() => focusFirstSubMenuItem(expanded));
				});
			} else if (collapsed.length > 0 && lastInputWasMouse.current) {
				// A cascaded menu was closed by the mouse moving away. If focus is
				// inside the cascaded menu, move it out immediately, before the
				// browser hides the menu. Otherwise the focused element disappears,
				// focus is lost (blur with no related target) and Carbon closes the
				// whole context menu.
				focusTopItemAfterSubMenuClose(collapsed);

				// Carbon may also move focus to the parent item after this callback
				// so check again after it has finished.
				cancelAnimationFrame(subMenuCloseFrame.current);
				subMenuCloseFrame.current = requestAnimationFrame(() => {
					subMenuCloseFrame.current = requestAnimationFrame(() => focusTopItemAfterSubMenuClose(collapsed));
				});
			}
		});
		subMenuObserver.current.observe(popover, { attributes: true, attributeFilter: ["aria-expanded"], childList: true, subtree: true });
	}, [removeMenuItemTooltips, focusFirstSubMenuItem, focusTopItemAfterSubMenuClose]);

	// Runs after every render. This must be declared before the mount effect
	// so that, on mount, the menu is positioned before the observer is started.
	useLayoutEffect(() => {
		applyMenuPosition();
		removeMenuItemTooltips();
		// On mount, focus is set on the first menu item by handleMenuOpen which
		// Carbon calls after it has recorded the element that currently has focus.
		// Carbon returns focus to that element when the menu closes, so we must
		// not move focus to a menu item before then. Otherwise Carbon would try
		// to return focus to a menu item that no longer exists.
		if (mounted.current) {
			focusCurrentItem();
		}
	});

	useLayoutEffect(() => {
		mounted.current = true;
		observeSubMenuOpening();

		const onDocumentMouseMove = () => {
			lastInputWasMouse.current = true;
		};
		const onDocumentKeyDown = () => {
			lastInputWasMouse.current = false;
		};
		const onDocumentMouseDown = (evt) => {
			const popover = menuPopoverRef.current;
			mouseDownOutsideMenu.current = !(popover && popover.contains(evt.target));
		};
		const onDocumentMouseUp = () => {
			mouseDownOutsideMenu.current = false;
		};
		document.addEventListener("mousemove", onDocumentMouseMove, true);
		document.addEventListener("keydown", onDocumentKeyDown, true);
		document.addEventListener("mousedown", onDocumentMouseDown, true);
		document.addEventListener("mouseup", onDocumentMouseUp, true);

		return () => {
			mounted.current = false;
			subMenuObserver.current?.disconnect();
			cancelAnimationFrame(subMenuFocusFrame.current);
			cancelAnimationFrame(subMenuCloseFrame.current);
			document.removeEventListener("mousemove", onDocumentMouseMove, true);
			document.removeEventListener("keydown", onDocumentKeyDown, true);
			document.removeEventListener("mousedown", onDocumentMouseDown, true);
			document.removeEventListener("mouseup", onDocumentMouseUp, true);
		};
	}, [observeSubMenuOpening]);

	const colorClicked = (color, evt) => {
		contextHandler("colorSelectedObjects", evt, { color });
	};

	const buildColorPickerPanel = () => {
		const subPanelData = {
			clickActionHandler: (c, evt) => colorClicked(c, evt),
			closeSubPanel: () => closeMenu()
		};
		return (
			<div key="color-picker" tabIndex={-1}>
				<ColorPicker subPanelData={subPanelData} closeSubPanel={() => closeMenu()} />
			</div>
		);
	};

	// Builds a new menu based on the menu definition passed in.
	const buildMenu = (menuDef) => {
		const menuItems = [];
		const refs = [];

		// Records if we have just displayed a divider. This is useful because we
		// only want to display one divider if there is a divider element
		// immediately after another divider element in the menuDefinition array.
		let previousDivider = false;

		const allItemsDisabled = areAllItemsDisabled(menuDef);

		for (let i = 0; i < menuDef.length; ++i) {
			const divider = menuDef[i].divider;
			let menuItem;

			if (divider) {
				if (!previousDivider) {
					menuItem = <MenuItemDivider key={i} className={"context-menu-divider"} />;
					previousDivider = true;
				}
			} else {
				previousDivider = false;

				// Special case, when all menu items are disabled, it allows the topmost
				// disabled item to receive focus, even though it is disabled, so the
				// keyboard user can close the menu using ESC.
				if (i === 0 && allItemsDisabled) {
					const ref = React.createRef();
					refs.push(ref);

					menuItem = (
						<MenuItem key={i} ref={ref} tabIndex={0} label={getLabelString(menuDef[i].label)}
							className={"context-menu-item disabled"}
							aria-disabled
						/>
					);

				} else if (menuDef[i].action === ACTION_COLOR_BACKGROUND) {
					const disabled = !isItemEnabled(menuDef[i]);
					const subMenuContent = buildColorPickerPanel();
					const ref = disabled ? null : React.createRef();
					if (!disabled) {
						refs.push(ref);
					}

					menuItem = (
						<MenuItem key={i} ref={ref} className={"context-menu-item" + (disabled ? " disabled" : "")}
							label={getLabelString(menuDef[i].label)}
							disabled={disabled}
						>
							{subMenuContent}
						</MenuItem>
					);

				} else if (menuDef[i].submenu) {
					const disabled = areAllItemsDisabled(menuDef[i].menu);
					const subMenuInfo = buildMenu(menuDef[i].menu);
					const subMenuContent = subMenuInfo.menuItems;
					const ref = disabled ? null : React.createRef();
					if (!disabled) {
						refs.push(ref);
					}

					menuItem = (
						<MenuItem key={i} ref={ref} className={"context-menu-item" + (disabled ? " disabled" : "")}
							label={getLabelString(menuDef[i].label)}
							disabled={disabled}
						>
							{subMenuContent}
						</MenuItem>
					);

				} else if (menuDef[i].enable === false) {
					menuItem = (
						<MenuItem key={i} label={getLabelString(menuDef[i].label)} className={"context-menu-item disabled"}
							disabled
						/>
					);

				} else {
					const ref = React.createRef();
					refs.push(ref);

					menuItem = (
						<MenuItem key={i} ref={ref} data-action={menuDef[i].action}
							label={getLabelString(menuDef[i].label)} className={"context-menu-item"}
							onClick={() => contextHandler(menuDef[i].action)}
						/>
					);
				}
			}
			menuItems.push(menuItem);
		}
		return { menuItems, menuRefs: refs };
	};

	const menuInfo = buildMenu(menuDefinition);
	menuRefs.current = menuInfo.menuRefs;

	let popoverClass = "context-menu-popover";
	if (carbonV12) {
		popoverClass += " context-menu-popover--v12";
	}

	return (
		<Menu
			ref={menuPopoverRef}
			id="context-menu-popover"
			className={popoverClass}
			open
			target={null}
			legacyAutoalign={false}
			label="Context menu"
			onContextMenu={onContextMenu}
			onOpen={handleMenuOpen}
			onClose={closeMenu}
		>
			{menuInfo.menuItems}
		</Menu>
	);
};

CommonContextMenu.propTypes = {
	contextHandler: PropTypes.func.isRequired,
	closeContextMenu: PropTypes.func.isRequired,
	menuDefinition: PropTypes.array.isRequired,
	canvasRect: PropTypes.object.isRequired,
	mousePos: PropTypes.object.isRequired,
	carbonV12: PropTypes.bool // Provided by withCarbonV12
};

export default withCarbonV12(CommonContextMenu);
