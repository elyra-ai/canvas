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

import React from "react";
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import { Menu, MenuItem, MenuItemDivider } from "@carbon/react";
import withCarbonV12 from "../common-canvas/with-carbon-v12.jsx";
import ColorPicker from "../color-picker";
import { ACTION_COLOR_BACKGROUND } from "../common-canvas/constants/canvas-constants";

// context-menu sizing
const CONTEXT_MENU_WIDTH = 160; // See context-menu.scss
const CONTEXT_MENU_LINK_HEIGHT = 30; // See context-menu.scss
const CONTEXT_MENU_DIVIDER_HEIGHT = 1; // See context-menu.scss
const EXTRA_OFFSET = 5; // Extra offset for vertical menu positioning

class CommonContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.menuRefs = [];

		this.focusIndex = null; // Set to null so we know when it is not initialized.

		this.itemSelected = this.itemSelected.bind(this);
		this.colorClicked = this.colorClicked.bind(this);
		this.handleMenuOpen = this.handleMenuOpen.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
		this.closing = false;

		// Records whether the most recent user input was from the mouse (true) or
		// the keyboard (false) so we can tell how a cascaded menu was closed.
		this.lastInputWasMouse = false;
		this.onDocumentMouseMove = () => {
			this.lastInputWasMouse = true;
		};
		this.onDocumentKeyDown = () => {
			this.lastInputWasMouse = false;
		};

		this.menuPopoverRef = React.createRef();
	}

	componentDidMount() {
		this.applyMenuPosition();
		this.ensureMenuItemsHaveMenuRole();
		this.removeMenuItemTooltips();
		this.focusCurrentItem();
		this.observeSubMenuOpening();
		document.addEventListener("mousemove", this.onDocumentMouseMove, true);
		document.addEventListener("keydown", this.onDocumentKeyDown, true);
	}

	componentDidUpdate() {
		this.applyMenuPosition();
		this.ensureMenuItemsHaveMenuRole();
		this.removeMenuItemTooltips();
		this.focusCurrentItem();
	}

	componentWillUnmount() {
		this.subMenuObserver?.disconnect();
		cancelAnimationFrame(this.subMenuFocusFrame);
		cancelAnimationFrame(this.subMenuCloseFrame);
		document.removeEventListener("mousemove", this.onDocumentMouseMove, true);
		document.removeEventListener("keydown", this.onDocumentKeyDown, true);
	}

	onContextMenu(e) {
		e.preventDefault();
	}

	// Closes the menu. Closing the menu restores focus to the canvas which blurs
	// this menu while it is still mounted, and Carbon responds to that blur by
	// calling onClose again. The closing flag stops that re-entrant call from
	// recursing infinitely.
	// Carbon's MenuItem requires a string label but menu definitions may supply
	// a React element (for example a <FormattedMessage>). This converts such an
	// element to a string using the element's message props and the intl object.
	getLabelString(label) {
		if (React.isValidElement(label) && label.props?.id) {
			const { id, defaultMessage, values } = label.props;
			return this.props.intl.formatMessage({ id, defaultMessage }, values);
		}
		return label;
	}

	closeMenu() {
		if (this.closing) {
			return;
		}
		this.closing = true;
		try {
			this.props.closeContextMenu();
		} finally {
			this.closing = false;
		}
	}

	handleMenuOpen() {
		this.applyMenuPosition();
		this.focusCurrentItem();
	}

	// Sets focus on the current top level menu item unless focus is already on
	// an element within the menu (other than the menu itself). This prevents
	// focus being pulled back to a top level item when, for example, focus has
	// been moved to the first item of a cascaded menu because the mouse cursor
	// is over the item that opens that menu.
	focusCurrentItem() {
		this.focusIndex = this.focusIndex === null ? 0 : this.focusIndex;

		const popover = this.menuPopoverRef.current;
		const active = document.activeElement;
		if (popover && active && active !== popover && popover.contains(active)) {
			return;
		}

		if (this.menuRefs[this.focusIndex]?.current) {
			this.menuRefs[this.focusIndex].current.focus();
		}
	}

	// Watches for a menu item expanding its cascaded menu. When that happens
	// (for example, when the mouse is moved over the item) focus is moved to the
	// first item in the cascaded menu. Carbon does try to do this itself but its
	// focus manager also queues a call to focus the parent menu item and, which
	// one wins is a matter of timing. So we wait two animation frames, to let
	// Carbon finish, and then, if focus is not already inside the cascaded
	// menu, we set it ourselves.
	observeSubMenuOpening() {
		const popover = this.menuPopoverRef.current;
		if (!popover) {
			return;
		}
		this.subMenuObserver = new MutationObserver((mutations) => {
			// Cascaded menu items are added to the DOM when a submenu opens so
			// remove their tooltips too.
			this.removeMenuItemTooltips();
			const targets = mutations
				.filter((m) => m.type === "attributes")
				.map((m) => m.target);
			const expanded = targets
				.filter((t) => t.getAttribute("aria-expanded") === "true")
				.pop();
			const collapsed = targets
				.filter((t) => t.getAttribute("aria-expanded") === "false");
			if (expanded) {
				cancelAnimationFrame(this.subMenuFocusFrame);
				this.subMenuFocusFrame = requestAnimationFrame(() => {
					this.subMenuFocusFrame = requestAnimationFrame(() => this.focusFirstSubMenuItem(expanded));
				});
			} else if (collapsed.length > 0 && this.lastInputWasMouse) {
				// A cascaded menu was closed by the mouse moving away. If focus is
				// inside the cascaded menu, move it out immediately, before the
				// browser hides the menu. Otherwise the focused element disappears,
				// focus is lost (blur with no related target) and Carbon closes the
				// whole context menu.
				this.focusTopItemAfterSubMenuClose(collapsed);

				// Carbon may also move focus to the parent item after this callback
				// so check again after it has finished.
				cancelAnimationFrame(this.subMenuCloseFrame);
				this.subMenuCloseFrame = requestAnimationFrame(() => {
					this.subMenuCloseFrame = requestAnimationFrame(() => this.focusTopItemAfterSubMenuClose(collapsed));
				});
			}
		});
		this.subMenuObserver.observe(popover, { attributes: true, attributeFilter: ["aria-expanded"], childList: true, subtree: true });
	}

	// Carbon's MenuItem always sets a title attribute, equal to the label, which
	// causes the browser to display a tooltip as the mouse hovers over the item.
	// Carbon doesn't allow this to be overridden through props so we remove the
	// attribute from the DOM.
	removeMenuItemTooltips() {
		const popover = this.menuPopoverRef.current;
		if (!popover) {
			return;
		}
		popover.querySelectorAll("[role='menuitem'][title]").forEach((item) => item.removeAttribute("title"));
	}

	// Carbon moves focus to the menu item that opened a cascaded menu when the
	// cascaded menu is closed because the mouse moved away. We want focus to
	// go to the top item in the main menu instead. We only do this if focus is
	// on one of the collapsed items (or has been lost from the menu entirely)
	// so we don't disturb focus the user has placed elsewhere in the menu.
	focusTopItemAfterSubMenuClose(collapsedItems) {
		const popover = this.menuPopoverRef.current;
		const active = document.activeElement;
		if (!popover) {
			return;
		}
		const focusInCollapsed = collapsedItems.some((item) => item.contains(active));
		if (!focusInCollapsed && popover.contains(active)) {
			return;
		}
		this.focusIndex = 0;
		this.menuRefs[0]?.current?.focus();
	}

	focusFirstSubMenuItem(parentItem) {
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
	}

	// Carbon's MenuItem with submenu has an issue in onOpenChange where it steals
	// focus back to itself whenever focus moves to another menu item unless the
	// target menu item contains an element with role="menu". To prevent Carbon
	// from incorrectly trapping focus on cascading submenu items when navigating
	// with ArrowUp/ArrowDown, we ensure each menu item contains a hidden role="menu".
	ensureMenuItemsHaveMenuRole() {
		const popover = this.menuPopoverRef.current;
		if (!popover) {
			return;
		}
		const items = popover.querySelectorAll("[role='menuitem']");
		items.forEach((item) => {
			if (!item.querySelector("[role='menu']")) {
				const dummy = document.createElement("span");
				dummy.setAttribute("role", "menu");
				dummy.style.display = "none";
				item.appendChild(dummy);
			}
		});
	}

	/** Sets CSS custom properties for the root menu position on its DOM node. */
	applyMenuPosition() {
		if (!this.menuPopoverRef.current) {
			return;
		}
		const menuSize = this.calculateMenuSize(this.props.menuDefinition);
		const menuPos = this.calculateMenuPos(this.props.mousePos, menuSize, this.props.canvasRect);
		const el = this.menuPopoverRef.current;
		el.style.setProperty("--context-menu-left", menuPos.x + "px");
		el.style.setProperty("--context-menu-top", menuPos.y + "px");
	}

	itemSelected(data) {
		this.props.contextHandler(data);
	}

	colorClicked(color, evt) {
		this.props.contextHandler("colorSelectedObjects", evt, { color });
	}

	// Returns the size of the menu passed in.
	calculateMenuSize(menu) {
		var numDividers = 0;
		for (let i = 0; i < menu.length; ++i) {
			const divider = menu[i].divider;
			if (divider) {
				numDividers++;
			}
		}

		const linkHeight = this.props.carbonV12 ? 32 : CONTEXT_MENU_LINK_HEIGHT;
		var menuSize = {
			height: ((menu.length - numDividers) * linkHeight) + (numDividers * CONTEXT_MENU_DIVIDER_HEIGHT),
			width: CONTEXT_MENU_WIDTH
		};

		return menuSize;
	}

	// Returns a new position and the canvas rectangle for the context menu based on the current
	// mouse position and whether the menu would appear outside the edges of the page.
	calculateMenuPos(mousePos, menuSize, canvasRect) {
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

	// Returns true if all the items in a menu (or sub-menu) are disabled.
	areAllItemsDisabled(menuItems) {
		let isEnabled = false;

		for (let i = 0; i < menuItems.length; i++) {
			if (!menuItems[i].divider) {
				if (menuItems[i].submenu) {
					if (!this.areAllItemsDisabled(menuItems[i].menu)) {
						isEnabled = true;
					}

				} else if (this.isItemEnabled(menuItems[i])) {
					isEnabled = true;
				}
			}
		}
		return !isEnabled;
	}

	// Returns true if the menu item passed is enabled. The absence of the
	// 'enable' property default to true.
	isItemEnabled(item) {
		return (typeof item.enable === "undefined" || item.enable === true);
	}

	// Builds a new menu based on the menu definition passed in.
	buildMenu(menuDefinition, menuSize, menuPos, canvasRect) {
		const menuItems = [];
		const menuRefs = [];

		// Records if we have just displayed a divider. This is useful because we
		// only want to display one divider if there is a divider element
		// immediately after another divider element in the menuDefinition array.
		let previousDivider = false;

		const allItemsDisabled = this.areAllItemsDisabled(menuDefinition);

		for (let i = 0; i < menuDefinition.length; ++i) {
			const divider = menuDefinition[i].divider;
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
					menuRefs.push(ref);

					menuItem = (
						<MenuItem key={i} ref={ref} tabIndex={0} label={this.getLabelString(menuDefinition[i].label)}
							className={"context-menu-item disabled"}
							role="menuitem" aria-disabled
						/>
					);

				} else if (menuDefinition[i].action === ACTION_COLOR_BACKGROUND) {
					const disabled = !this.isItemEnabled(menuDefinition[i]);
					const subMenuContent = this.buildColorPickerPanel();
					const ref = disabled ? null : React.createRef();
					if (!disabled) {
						menuRefs.push(ref);
					}

					menuItem = (
						<MenuItem key={i} ref={ref} className={"context-menu-item" + (disabled ? " disabled" : "")}
							label={this.getLabelString(menuDefinition[i].label)}
							aria-disabled={disabled} disabled={disabled}
							role="menuitem"
						>
							{subMenuContent}
						</MenuItem>
					);

				} else if (menuDefinition[i].submenu) {
					const disabled = this.areAllItemsDisabled(menuDefinition[i].menu);
					const subMenuInfo = this.buildMenu(menuDefinition[i].menu, menuSize, menuPos, canvasRect, 100);
					const subMenuContent = subMenuInfo.menuItems;
					const ref = disabled ? null : React.createRef();
					if (!disabled) {
						menuRefs.push(ref);
					}

					menuItem = (
						<MenuItem key={i} ref={ref} className={"context-menu-item" + (disabled ? " disabled" : "")}
							label={this.getLabelString(menuDefinition[i].label)}
							aria-disabled={disabled} disabled={disabled}
							role="menuitem"
						>
							{subMenuContent}
						</MenuItem>
					);

				} else if (menuDefinition[i].enable === false) {
					menuItem = (
						<MenuItem key={i} label={this.getLabelString(menuDefinition[i].label)} className={"context-menu-item disabled"}
							disabled role="menuitem" aria-disabled
						/>
					);

				} else {
					const onClickFunction = this.itemSelected.bind(null, menuDefinition[i].action);
					const ref = React.createRef();
					menuRefs.push(ref);

					menuItem = (
						<MenuItem key={i} ref={ref} tabIndex={-1} data-action={menuDefinition[i].action}
							label={this.getLabelString(menuDefinition[i].label)} className={"context-menu-item"}
							onClick={onClickFunction} role="menuitem"
						/>
					);
				}
			}
			menuItems.push(menuItem);
		}
		return { menuItems, menuRefs };
	}

	buildColorPickerPanel() {
		const subPanelData = {
			clickActionHandler: (c, evt) => this.colorClicked(c, evt),
			closeSubPanel: () => this.closeMenu()
		};
		return (
			<div key="color-picker" tabIndex={-1}>
				<ColorPicker subPanelData={subPanelData} closeSubPanel={() => this.closeMenu()} />
			</div>
		);
	}

	render() {
		this.menuRefs = [];
		const menuSize = this.calculateMenuSize(this.props.menuDefinition);
		const menuPos = this.calculateMenuPos(this.props.mousePos, menuSize, this.props.canvasRect);
		const menuInfo = this.buildMenu(this.props.menuDefinition, menuSize, menuPos, this.props.canvasRect);
		this.menuRefs = menuInfo.menuRefs;

		let popoverClass = "context-menu-popover";
		if (this.props.carbonV12) {
			popoverClass += " context-menu-popover--v12";
		}

		return (
			<Menu
				ref={this.menuPopoverRef}
				id="context-menu-popover"
				className={popoverClass}
				open
				target={null}
				legacyAutoalign={false}
				label="Context menu"
				tabIndex={0}
				role="menu"
				onContextMenu={this.onContextMenu}
				onOpen={this.handleMenuOpen}
				onClose={this.closeMenu}
			>
				{menuInfo.menuItems}
			</Menu>
		);
	}
}

CommonContextMenu.propTypes = {
	contextHandler: PropTypes.func.isRequired,
	closeContextMenu: PropTypes.func.isRequired,
	menuDefinition: PropTypes.array.isRequired,
	canvasRect: PropTypes.object.isRequired,
	mousePos: PropTypes.object.isRequired,
	carbonV12: PropTypes.bool,
	intl: PropTypes.object.isRequired // Provided by injectIntl
};

export default withCarbonV12(injectIntl(CommonContextMenu));
