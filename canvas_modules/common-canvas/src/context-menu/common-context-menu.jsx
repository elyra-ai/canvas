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

	// Sets focus on the first top level menu item unless focus is already on
	// an element within the menu (other than the menu itself). This prevents
	// focus being pulled back to the top item when, for example, focus has
	// been moved to the first item of a cascaded menu because the mouse cursor
	// is over the item that opens that menu.
	const focusCurrentItem = useCallback(() => {
		const popover = menuPopoverRef.current;
		const active = document.activeElement;
		if (popover && active && active !== popover && popover.contains(active)) {
			return;
		}
		menuRefs.current[0]?.current?.focus();
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

	// Runs after every render. This must be declared before the mount effect
	// so that, on mount, the menu is positioned before the observer is started.
	useLayoutEffect(() => {
		applyMenuPosition();
		// Carbon's MenuItem always sets a title attribute, equal to the label,
		// which makes the browser display a tooltip on hover. Carbon sets it after
		// spreading the other props so it can't be overridden. So we remove it.
		menuPopoverRef.current?.querySelectorAll("[role='menuitem'][title]").forEach((item) => item.removeAttribute("title"));
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
		const popover = menuPopoverRef.current;

		// Carbon moves focus into a cascaded menu when it opens but two of its
		// mechanisms compete:
		//   - Menu moves focus to the first enabled MenuItem in the cascaded menu
		//     (in an animation frame) but it can't do this for the color picker
		//     because its content is not made up of MenuItems.
		//   - Each MenuItem's FloatingFocusManager has order ["reference", "floating"]
		//     so its initial focus (also set in an animation frame) goes to the
		//     reference, which is the parent menu item.
		// Both run in the same frame and the last one to be queued wins. With
		// React 19 the first cascaded item usually ends up with focus but with
		// React 18 the parent item does, and Elyra Canvas must work with both.
		// So we watch for cascaded menus expanding or collapsing and, after Carbon
		// has finished, set focus ourselves. This runs a callback after two
		// animation frames and returns a function that cancels it.
		const afterTwoFrames = (fn) => {
			let id = requestAnimationFrame(() => {
				id = requestAnimationFrame(fn);
			});
			return () => cancelAnimationFrame(id);
		};

		// Moves focus to the color picker, or else the first enabled item, in the
		// cascaded menu of the expanded parentItem, unless focus is already on an
		// element within it. Focus on the cascaded menu itself, which Carbon sets
		// when it opens, doesn't count because it shows a focus outline around
		// the whole menu.
		const focusFirstSubMenuItem = (parentItem) => {
			const subMenu = parentItem.getAttribute("aria-expanded") === "true" &&
				parentItem.querySelector(":scope > [role='menu']");
			const active = document.activeElement;
			if (!subMenu || (active !== subMenu && subMenu.contains(active))) {
				return;
			}
			(subMenu.querySelector(".color-picker-item") ||
				subMenu.querySelector(":scope > [role='menuitem']:not([aria-disabled='true'])"))?.focus();
		};

		// Carbon moves focus to the menu item that opened a cascaded menu when it
		// is closed by the mouse moving away. We want focus to go to the top item
		// in the main menu instead. We only do this if focus is in one of the
		// collapsed items (or has been lost from the menu entirely) so we don't
		// disturb focus the user has placed elsewhere in the menu.
		const focusTopItemAfterSubMenuClose = (collapsedItems) => {
			const active = document.activeElement;
			if (collapsedItems.some((item) => item.contains(active)) || !popover.contains(active)) {
				menuRefs.current[0]?.current?.focus();
			}
		};

		let cancelOpenFocus;
		let cancelCloseFocus;
		const observer = new MutationObserver((mutations) => {
			const targets = mutations.map((m) => m.target);
			const expanded = targets
				.filter((t) => t.getAttribute("aria-expanded") === "true")
				.pop();
			const collapsed = targets
				.filter((t) => t.getAttribute("aria-expanded") === "false");
			if (expanded) {
				cancelOpenFocus?.();
				cancelOpenFocus = afterTwoFrames(() => focusFirstSubMenuItem(expanded));
			} else if (collapsed.length > 0 && lastInputWasMouse.current) {
				// A cascaded menu was closed by the mouse moving away. If focus is
				// inside it, move focus out immediately, before the browser hides
				// the menu. Otherwise the focused element disappears, focus is lost
				// (blur with no related target) and Carbon closes the whole menu.
				// Carbon may also move focus to the parent item after this callback
				// so check again after it has finished.
				focusTopItemAfterSubMenuClose(collapsed);
				cancelCloseFocus?.();
				cancelCloseFocus = afterTwoFrames(() => focusTopItemAfterSubMenuClose(collapsed));
			}
		});
		if (popover) {
			observer.observe(popover, { attributes: true, attributeFilter: ["aria-expanded"], subtree: true });
		}

		const onDocumentMouseMove = () => {
			lastInputWasMouse.current = true;
		};
		const onDocumentKeyDown = () => {
			lastInputWasMouse.current = false;
		};
		const onDocumentMouseDown = (evt) => {
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
			observer.disconnect();
			cancelOpenFocus?.();
			cancelCloseFocus?.();
			document.removeEventListener("mousemove", onDocumentMouseMove, true);
			document.removeEventListener("keydown", onDocumentKeyDown, true);
			document.removeEventListener("mousedown", onDocumentMouseDown, true);
			document.removeEventListener("mouseup", onDocumentMouseUp, true);
		};
	}, []);

	const colorPickerWrapperRef = useRef(null);
	const colorSelected = useRef(false);

	const colorClicked = (color, evt) => {
		colorSelected.current = true;
		contextHandler("colorSelectedObjects", evt, { color });
	};

	// Closes just a cascaded menu. Carbon provides no way to do this other than
	// its own left arrow handling. So we send a left arrow key press to the
	// cascaded menu. Carbon then closes just that cascaded menu and returns focus
	// to its parent menu item.
	const closeCascadeMenu = (ref) => {
		ref.current?.dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
		);
	};

	// The color picker calls closeSubPanel when:
	// * a color is selected, in which case the whole context menu should close
	// * when the user presses left arrow on the first color, in which case only
	//   the cascaded menu should close.
	const closeColorPicker = () => {
		if (colorSelected.current) {
			colorSelected.current = false;
			closeMenu();
		} else {
			closeCascadeMenu(colorPickerWrapperRef);
		}
	};

	const buildColorPickerPanel = () => {
		const subPanelData = {
			clickActionHandler: (c, evt) => colorClicked(c, evt),
			closeSubPanel: () => closeMenu()
		};
		return (
			<div key="color-picker" ref={colorPickerWrapperRef} tabIndex={-1}>
				<ColorPicker subPanelData={subPanelData} closeSubPanel={closeColorPicker} />
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
					// Carbon ignores the disabled prop on a MenuItem that has children
					// so the submenu content is only supplied when the item is enabled.
					const disabled = areAllItemsDisabled(menuDef[i].menu);
					const subMenuContent = disabled ? null : buildMenu(menuDef[i].menu).menuItems;
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
