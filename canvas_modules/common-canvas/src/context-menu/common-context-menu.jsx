/*
 * Copyright 2017-2023 Elyra Authors
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
import { ChevronRight16 } from "@carbon/icons-react";
import ColorPicker from "../color-picker";

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
		this.itemSelected = this.itemSelected.bind(this);
		this.colorClicked = this.colorClicked.bind(this);
	}

	onContextMenu(e) {
		e.preventDefault();
	}

	itemSelected(data, selectedEvent) {
		this.props.contextHandler(data);
		// This stops the canvasClicked function from being fired which would
		// clear any current selections.
		if (selectedEvent) {
			selectedEvent.stopPropagation();
		}
	}

	colorClicked(color) {
		this.props.contextHandler("colorSelectedObjects", { color });
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

		// Add a pixel to x and y because on Chrome without this the context menu
		// appears with  the top corner of the first menu item under the mouse
		// cursor. This highlights the first menu item (which looks weird) and, if
		// the first item is a cascade menu, automatically opens the sub-menu.
		menuPos.x += 1;
		menuPos.y += 1;

		return menuPos;
	}

	// Returns true of all the items in a sub-menu are disabled.
	areAllSubmenuItemsDisabled(submenuItems) {
		let itemCount = 0;
		let disabledCount = 0;
		submenuItems.forEach(function(submenuItem) {
			if (!submenuItem.divider) {
				itemCount++;
			}
			if (submenuItem.enable === false) {
				disabledCount++;
			}
		});
		return disabledCount === itemCount;
	}

	// Builds a new menu based on the menu defintion passed in.
	buildMenu(menuDefinition, menuSize, menuPos, canvasRect) {
		const menuItems = [];

		let runningYPos = 0;
		// Records if we have just displayed a divider. This is useful because we
		// only want to display one divider if there is a divider element
		// immediately after another divider element in the menuDefintion array.
		let previousDivider = false;

		for (let i = 0; i < menuDefinition.length; ++i) {
			const divider = menuDefinition[i].divider;
			const submenu = menuDefinition[i].submenu;

			if (divider) {
				if (!previousDivider) {
					menuItems.push(<div key={i + 1} className={"context-menu-divider"} />);
					runningYPos += CONTEXT_MENU_DIVIDER_HEIGHT;
					previousDivider = true;
				}
			} else if (menuDefinition[i].action === "colorBackground") {
				previousDivider = false;
				const disabled = false;
				const subMenuSize = { width: CONTEXT_MENU_WIDTH, height: 50 };
				const subMenuContent = this.buildColorPickerPanel();

				const subMenu = this.buildSubMenu(
					menuDefinition, i, subMenuContent, runningYPos, menuPos, menuSize, subMenuSize, canvasRect, disabled);
				menuItems.push(subMenu);

				runningYPos += CONTEXT_MENU_LINK_HEIGHT;

			} else if (submenu) {
				previousDivider = false;
				const disabled = this.areAllSubmenuItemsDisabled(menuDefinition[i].menu);
				const subMenuSize = this.calculateMenuSize(menuDefinition[i].menu);
				const subMenuContent = this.buildMenu(menuDefinition[i].menu, menuSize, menuPos, canvasRect);

				const subMenu = this.buildSubMenu(
					menuDefinition, i, subMenuContent, runningYPos, menuPos, menuSize, subMenuSize, canvasRect, disabled);
				menuItems.push(subMenu);

				runningYPos += CONTEXT_MENU_LINK_HEIGHT;

			} else {
				previousDivider = false;
				const className = "context-menu-item" +
					(menuDefinition[i].enable === false ? " disabled" : "");

				const onClickFunction = menuDefinition[i].enable === false
					? null
					: this.itemSelected.bind(null, menuDefinition[i].action);

				menuItems.push((
					<div key={i + 1} className={className} onClick={onClickFunction} role="menuitem">
						{menuDefinition[i].label}
					</div>
				));
				runningYPos += CONTEXT_MENU_LINK_HEIGHT;
			}
		}
		return menuItems;
	}

	buildColorPickerPanel() {
		return (
			<ColorPicker clickActionHandler={this.colorClicked} />
		);
	}

	subMenuMouseEnter(action) {
		this.setState({ displaySubMenuAction: action });
	}

	subMenuMouseLeave(action) {
		this.setState({ displaySubMenuAction: "" });
	}

	// Builds a sub-menu for the menuitem identified by the index into the menudefintion.
	buildSubMenu(menuDefinition, index, subMenuContent, runningYPos, menuPos,
		menuSize, subMenuSize, canvasRect, disabled) {
		const rtl = this.buildRtlState(menuPos, menuSize, subMenuSize, canvasRect);
		const subMenuPosStyle = this.buildSubMenuPosStyle(runningYPos, menuPos, subMenuSize, canvasRect, rtl);
		const menuItem = menuDefinition[index];

		const icon = (<ChevronRight16 />);
		const menuItemContent = <div>{menuItem.label}{icon} </div>;
		const menuItemClass = "context-menu-item " + (disabled ? " disabled" : "");
		const subMenuClass = "context-menu-popover context-menu-submenu" +
			(this.state.displaySubMenuAction === menuItem.action ? " context-menu--visible" : "");
		const onMouseEnter = (disabled ? null : this.subMenuMouseEnter.bind(this, menuItem.action));
		const onMouseLeave = (disabled ? null : this.subMenuMouseLeave.bind(this));

		return (
			<div key={index + 1} className={menuItemClass} aria-haspopup role="menuitem"
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
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

	render() {
		// Reposition contextMenu so that it does not show off the screen
		const menuSize = this.calculateMenuSize(this.props.menuDefinition);
		const menuPos = this.calculateMenuPos(this.props.mousePos, menuSize, this.props.canvasRect);
		const posStyle = {
			left: menuPos.x + "px",
			top: menuPos.y + "px"
		};

		const menuItems = this.buildMenu(this.props.menuDefinition, menuSize, menuPos, this.props.canvasRect);

		return (
			<div id="context-menu-popover" className="context-menu-popover" style={posStyle} onContextMenu={this.onContextMenu}>
				{menuItems}
			</div>
		);
	}
}

CommonContextMenu.propTypes = {
	contextHandler: PropTypes.func.isRequired,
	menuDefinition: PropTypes.array.isRequired,
	canvasRect: PropTypes.object.isRequired,
	mousePos: PropTypes.object.isRequired
};

export default CommonContextMenu;
