/*
 * Copyright 2017-2024 Elyra Authors
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
import { ChevronRight } from "@carbon/react/icons";
import ColorPicker from "../color-picker";
import KeyboardUtils from "../common-canvas/keyboard-utils";

// context-menu sizing
const CONTEXT_MENU_WIDTH = 160; // See context-menu.scss
const CONTEXT_MENU_LINK_HEIGHT = 30; // See context-menu.scss
const CONTEXT_MENU_DIVIDER_HEIGHT = 1; // See context-menu.scss
const EXTRA_OFFSET = 5; // Extra offset for vertical menu positioning


class CommonContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displaySubMenuAction: ""
		};
		this.menuRefs = [];
		this.subMenuRefs = [];

		this.focusIndex = null; // Set to null so we know when it is not initialized.
		this.subMenuFocusIndex = 0;

		this.onKeyDown = this.onKeyDown.bind(this);
		this.itemSelected = this.itemSelected.bind(this);
		this.colorClicked = this.colorClicked.bind(this);
	}

	componentDidMount() {
		this.focusIndex = this.focusIndex === null ? 0 : this.focusIndex;
		this.menuRefs[this.focusIndex].current.focus();
	}

	componentDidUpdate() {
		if (this.state.displaySubMenuAction) {
			this.subMenuFocusIndex = 0;
			if (this.state.displaySubMenuAction !== "colorBackground") {
				const subMenuRefs = this.subMenuRefs[this.state.displaySubMenuAction];
				subMenuRefs[this.subMenuFocusIndex].current.focus();
			}

		} else {
			this.focusIndex = this.focusIndex === null ? 0 : this.focusIndex;
			this.menuRefs[this.focusIndex].current.focus();
		}
	}

	onContextMenu(e) {
		e.preventDefault();
	}

	onKeyDown(evt) {
		// Don't let keyboard event go through to other objects.
		evt.stopPropagation();
		evt.preventDefault();

		if (KeyboardUtils.nextContextMenuOption(evt)) {
			if (this.state.displaySubMenuAction) {
				const subMenuRefs = this.subMenuRefs[this.state.displaySubMenuAction];
				this.subMenuFocusIndex = this.subMenuFocusIndex === subMenuRefs.length - 1 ? 0 : this.subMenuFocusIndex + 1;
				subMenuRefs[this.subMenuFocusIndex].current.focus();

			} else {
				this.focusIndex = this.focusIndex === this.menuRefs.length - 1 ? 0 : this.focusIndex + 1;
				this.menuRefs[this.focusIndex].current.focus();
			}

		} else if (KeyboardUtils.previousContextMenuOption(evt)) {
			if (this.state.displaySubMenuAction) {
				const subMenuRefs = this.subMenuRefs[this.state.displaySubMenuAction];
				this.subMenuFocusIndex = this.subMenuFocusIndex === 0 ? subMenuRefs.length - 1 : this.subMenuFocusIndex - 1;
				subMenuRefs[this.subMenuFocusIndex].current.focus();

			} else {
				this.focusIndex = this.focusIndex === 0 ? this.menuRefs.length - 1 : this.focusIndex - 1;
				this.menuRefs[this.focusIndex].current.focus();
			}

		} else if (KeyboardUtils.openContextMenuSubMenu(evt)) {
			const action = evt.target.dataset.action;
			if (this.subMenuRefs[action]) {
				this.subMenuOpen(action);
			}

		} else if (KeyboardUtils.closeContextMenuSubMenu(evt) &&
					this.state.displaySubMenuAction) {
			this.subMenuClose();

		} else if (KeyboardUtils.closeContextMenu(evt) &&
					!this.state.displaySubMenuAction) {
			this.props.closeContextMenu();

		} else if (KeyboardUtils.activateContextMenuOption(evt)) {
			const action = evt.target.dataset.action;
			if (this.subMenuRefs[action]) {
				this.subMenuOpen(action);

			} else {
				this.itemSelected(action);
			}
		}
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

		var menuSize = {
			height: ((menu.length - numDividers) * CONTEXT_MENU_LINK_HEIGHT) + (numDividers * CONTEXT_MENU_DIVIDER_HEIGHT),
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

	// Builds a new menu based on the menu defintion passed in.
	buildMenu(menuDefinition, menuSize, menuPos, canvasRect) {
		const menuItems = [];
		const menuRefs = [];

		let runningYPos = 0;

		// Records if we have just displayed a divider. This is useful because we
		// only want to display one divider if there is a divider element
		// immediately after another divider element in the menuDefintion array.
		let previousDivider = false;

		const allItemsDisabled = this.areAllItemsDisabled(menuDefinition);

		for (let i = 0; i < menuDefinition.length; ++i) {
			const divider = menuDefinition[i].divider;
			let menuItem;

			if (divider) {
				if (!previousDivider) {
					menuItem = <div key={i} className={"context-menu-divider"} />;
					runningYPos += CONTEXT_MENU_DIVIDER_HEIGHT;
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
						<div key={i} ref={ref} tabIndex={0} className={"context-menu-item disabled"} onKeyDown={this.onKeyDown} role="menuitem">
							{menuDefinition[i].label}
						</div>
					);

				} else if (menuDefinition[i].action === "colorBackground") {
					const disabled = !this.isItemEnabled(menuDefinition[i]);
					const subMenuSize = { width: CONTEXT_MENU_WIDTH, height: 50 };
					const subMenuInfo = this.buildColorPickerPanel();
					const subMenuContent = subMenuInfo.menuItems;
					this.subMenuRefs[menuDefinition[i].action] = subMenuInfo.menuRefs;

					menuItem = this.buildSubMenu(
						menuDefinition, i, menuRefs, subMenuContent, runningYPos, menuPos, menuSize, subMenuSize, canvasRect, disabled);


				} else if (menuDefinition[i].submenu) {
					const disabled = this.areAllItemsDisabled(menuDefinition[i].menu);
					const subMenuSize = this.calculateMenuSize(menuDefinition[i].menu);
					const subMenuInfo = this.buildMenu(menuDefinition[i].menu, menuSize, menuPos, canvasRect, 100);
					const subMenuContent = subMenuInfo.menuItems;
					this.subMenuRefs[menuDefinition[i].action] = subMenuInfo.menuRefs;

					menuItem = this.buildSubMenu(
						menuDefinition, i, menuRefs, subMenuContent, runningYPos, menuPos, menuSize, subMenuSize, canvasRect, disabled);

				} else if (menuDefinition[i].enable === false) {
					menuItem = (
						<div key={i} className={"context-menu-item disabled"} role="menuitem">
							{menuDefinition[i].label}
						</div>
					);

				} else {
					const onClickFunction = this.itemSelected.bind(null, menuDefinition[i].action);
					const ref = React.createRef();
					menuRefs.push(ref);

					menuItem = (
						<div key={i} ref={ref} tabIndex={-1} data-action={menuDefinition[i].action}
							className={"context-menu-item"} onClick={onClickFunction} onKeyDown={this.onKeyDown} role="menuitem"
						>
							{menuDefinition[i].label}
						</div>
					);
				}
				runningYPos += CONTEXT_MENU_LINK_HEIGHT;
			}
			menuItems.push(menuItem);
		}
		return { menuItems, menuRefs };
	}

	buildColorPickerPanel() {
		const subPanelData = {
			clickActionHandler: (c, evt) => this.colorClicked(c, evt),
			closeSubPanel: () => this.subMenuClose()
		};
		// Only create the color picker when we are actually displaying it in the sub-menu.
		// That way the color picker will set focus on itself when it is opened.
		const colorPicker = this.state.displaySubMenuAction === "colorBackground"
			? <ColorPicker ref={ref} subPanelData={subPanelData} closeSubPanel={() => this.subMenuClose()} />
			: null;

		const ref = React.createRef();

		const content = (
			<div key={"color-picker"} ref={ref} tabIndex={-1}>
				{colorPicker}
			</div>
		);

		return { menuItems: [content], menuRefs: [ref] };
	}

	subMenuOpen(action) {
		this.setState({ displaySubMenuAction: action });
	}

	subMenuClose(action) {
		this.setState({ displaySubMenuAction: "" });
	}

	// Builds a sub-menu for the menuitem identified by the index into the menudefintion.
	buildSubMenu(menuDefinition, index, menuRefs, subMenuContent, runningYPos, menuPos,
		menuSize, subMenuSize, canvasRect, disabled) {
		const rtl = this.buildRtlState(menuPos, menuSize, subMenuSize, canvasRect);
		const subMenuPosStyle = this.buildSubMenuPosStyle(runningYPos, menuPos, subMenuSize, canvasRect, rtl);
		const menuItem = menuDefinition[index];

		const icon = (<ChevronRight />);
		const menuItemContent = <div>{menuItem.label}{icon} </div>;
		const menuItemClass = "context-menu-item " + (disabled ? " disabled" : "");
		const subMenuClass = "context-menu-popover context-menu-submenu" +
			(this.state.displaySubMenuAction === menuItem.action ? " context-menu--visible" : "");
		const onMouseEnter = (disabled ? null : this.subMenuOpen.bind(this, menuItem.action));
		const onMouseLeave = (disabled ? null : this.subMenuClose.bind(this));

		const ref = disabled ? null : React.createRef();
		if (!disabled) {
			menuRefs.push(ref);
		}

		return (
			<div key={index} ref={ref} className={menuItemClass} aria-haspopup tabIndex={-1} data-action={menuItem.action} role="menuitem"
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onKeyDown={this.onKeyDown}
			>
				{menuItemContent}
				<div style={subMenuPosStyle} className={subMenuClass}>
					{subMenuContent}
				</div>
			</div>
		);
	}

	// Returns a boolean to indicate whether the submenu should appear on the
	// right of the context menu (rtl === false) or on the left of the context
	// menu (rtl === true).
	buildRtlState(menuPos, menuSize, subMenuSize, canvasRect) {
		// Ensure that the combined menu position, plus the menu width,
		//  plus the submenu width, does not exceed the viewport bounds.
		return (menuPos.x + menuSize.width + subMenuSize.width > canvasRect.right);
	}

	// Returns a style object that can be applied to the sub-menu to adjust its:
	// * vertical (y) position: If the submenu is tall enough that it would be
	// displayed off the bottom of the canvas area.
	// * horizontal (x) position: If the sub-menu needs to appear on the left
	// side of the main menu (rtl === true).
	buildSubMenuPosStyle(runningYPos, menuPos, subMenuSize, canvasRect, rtl) {
		// Does the submenu go below the bottom of the viewport?
		const y = canvasRect.bottom - (menuPos.y + runningYPos + subMenuSize.height);

		// If submenu is not below the viewport bottom set offset to 0 so the
		// submenu will not be moved. Otherwise, y will be used to move the
		// submenu up fully into the view port.
		const offset = (y > 0) ? 0 : y - EXTRA_OFFSET;

		const subMenuPosStyle = {
			top: offset + "px" // Use negative to push the menu up
		};

		if (rtl) {
			subMenuPosStyle.left = -CONTEXT_MENU_WIDTH + "px";
		}

		return subMenuPosStyle;
	}

	// Returns the menu definition array passed in making sure any
	// submenu items have an action. Note: some applications forget
	// to provide an action because, for the submenu, it is only
	// used by the context menu code.
	ensureAllSubMenuItemsHaveAction(menuDef) {
		return menuDef.map((item, index) => {
			if (item.submenu && typeof item.action === "undefined") {
				return { ...item, action: "submenu_" + index };
			}
			return item;
		});
	}

	render() {
		// Reposition contextMenu so that it does not show off the screen
		const menuSize = this.calculateMenuSize(this.props.menuDefinition);
		const menuPos = this.calculateMenuPos(this.props.mousePos, menuSize, this.props.canvasRect);
		const posStyle = {
			left: menuPos.x + "px",
			top: menuPos.y + "px"
		};

		this.menuRefs = [];
		const menuDefinition = this.ensureAllSubMenuItemsHaveAction(this.props.menuDefinition);
		const menuInfo = this.buildMenu(menuDefinition, menuSize, menuPos, this.props.canvasRect);
		this.menuRefs = menuInfo.menuRefs;

		return (
			<div id="context-menu-popover" role="menu" className="context-menu-popover" style={posStyle} onContextMenu={this.onContextMenu}>
				{menuInfo.menuItems}
			</div>
		);
	}
}

CommonContextMenu.propTypes = {
	contextHandler: PropTypes.func.isRequired,
	closeContextMenu: PropTypes.func.isRequired,
	menuDefinition: PropTypes.array.isRequired,
	canvasRect: PropTypes.object.isRequired,
	mousePos: PropTypes.object.isRequired
};

export default CommonContextMenu;
