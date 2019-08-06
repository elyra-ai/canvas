/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-empty-function: ["error", { "allow": ["arrowFunctions"] }] */

import React from "react";
import PropTypes from "prop-types";
import { MenuItem, SubMenu } from "react-contextmenu";

// context-menu sizing
const CONTEXT_MENU_WIDTH = 160; // see context-menu.css .react-context-menu margin
const CONTEXT_MENU_LINK_HEIGHT = 30; // see context-menu.css .react-context-menu-item height
const CONTEXT_MENU_DIVIDER_HEIGHT = 1; // see context-menu.css .react-context-menu-item height
const EXTRA_OFFSET = 5; // Extra offset for vertical menu positioning


class CommonContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.itemSelected = this.itemSelected.bind(this);
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

		return menuPos;
	}

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

	buildMenu(menuDefinition, mousePos, menuSize, menuPos, canvasRect) {
		const customDivider = {
			className: "contextmenu-divider"
		};

		const menuItems = [];

		let runningYPos = 0;

		for (let i = 0; i < menuDefinition.length; ++i) {
			const divider = menuDefinition[i].divider;
			const submenu = menuDefinition[i].submenu;

			if (divider) {
				menuItems.push(<MenuItem attributes={customDivider} key={i + 1} onClick={() => {}} divider />);
				runningYPos += CONTEXT_MENU_DIVIDER_HEIGHT;

			} else if (submenu) {
				const submenuItems = this.buildMenu(menuDefinition[i].menu, mousePos, menuSize, menuPos, canvasRect);
				const disabled = { disabled: this.areAllSubmenuItemsDisabled(menuDefinition[i].menu) };
				const submenuSize = this.calculateMenuSize(menuDefinition[i].menu);
				let rtl = false;

				// Ensure that the combined menu position, plus the menu width,
				//  plus the submenu width, does not exceed the viewport bounds.
				if (mousePos.x + menuSize.width + submenuSize.width > canvasRect.right) {
					rtl = true;
				}

				// Does the submenu go below the bottom of the viewport?
				const y = canvasRect.bottom - (menuPos.y + runningYPos + submenuSize.height);

				// If submenu is not below the viewport bottom set offset to 0 so the
				// submenu will not be moved. Otherwise, y will be used to move the
				// submenu up fully into the view port.
				const offset = (y > 0) ? 0 : y - EXTRA_OFFSET;

				const subMenuPosStyle = {
					top: offset + "px" // Use negative to push the menu up
				};

				menuItems.push(
					<SubMenu title={menuDefinition[i].label} key={i + 1} className="contextmenu-submenu" rtl={rtl} {...disabled}>
						<div key={i + 1} style={subMenuPosStyle} className="context-menu-popover">
							{submenuItems}
						</div>
					</SubMenu>
				);
				runningYPos += CONTEXT_MENU_LINK_HEIGHT;

			} else {
				const disabled = { disabled: menuDefinition[i].enable === false };
				menuItems.push(
					<MenuItem onClick={this.itemSelected.bind(null, menuDefinition[i].action)} key={i + 1} {...disabled}>
						{menuDefinition[i].label}
					</MenuItem>
				);
				runningYPos += CONTEXT_MENU_LINK_HEIGHT;
			}
		}
		return menuItems;
	}

	render() {
		// Reposition contextMenu so that it does not show off the screen
		const menuSize = this.calculateMenuSize(this.props.menuDefinition);
		const menuPos = this.calculateMenuPos(this.props.mousePos, menuSize, this.props.canvasRect);
		const posStyle = {
			left: menuPos.x + "px",
			top: menuPos.y + "px"
		};

		const menuItems = this.buildMenu(this.props.menuDefinition, this.props.mousePos, menuSize, menuPos, this.props.canvasRect);

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
