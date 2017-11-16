/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import enhanceWithClickOutside from "react-click-outside";
import CommonContextMenu from "./common-context-menu.jsx";
import CanvasController from "./common-canvas-controller.js";

// context-menu sizing
const CONTEXT_MENU_MARGIN = 2; // see common-canvas.css .react-context-menu margin
const CONTEXT_MENU_BORDER = 1; // see common-canvas.css .react-context-menu border
const CONTEXT_MENU_PADDING = 5; // see common-canvas.css .react-context-menu padding
const CONTEXT_MENU_LINK_HEIGHT = 29; // see common-canvas.css .react-context-menu-link height
const CONTEXT_MENU_MIN_WIDTH = 160; // see common-canvas.css .react-context-menu min-width

class ContextMenuWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleClickOutside(clickOutsideEvent) {
		CanvasController.closeContextMenu();

		// This stops the canvasClicked function from being fired which would
		// clear any current selections. The event here is a real event not a
		// synthetic react mouse event.
		clickOutsideEvent.stopPropagation();
	}

	repositionContextMenu(mousePos, menuSize) {
		const pos = {};
		pos.x = mousePos.x;
		pos.y = mousePos.y;
		var containingDiv = document.getElementById(this.props.containingDivId);
		var commonCanvasRect = containingDiv.getBoundingClientRect();

		// Reposition contextMenu if it will show off the screen
		const screenSize = commonCanvasRect.height - commonCanvasRect.top + containingDiv.scrollTop;
		if (Math.round(mousePos.y + menuSize.height) > screenSize) {
			// adjust menu to start at the top of screen
			if (Math.round(screenSize / 2) < mousePos.y) {
				pos.y = mousePos.y - menuSize.height;
				// need to adjust height of context menu so it doesn't go off top of screen
				if (pos.y < 0) {
					pos.h = menuSize.height + (mousePos.y - menuSize.height);
					pos.y = 0;
				}
			} else if (Math.round(screenSize / 2) < (mousePos.y + menuSize.height)) {
				// adjust menu height so it doesn't go off bottom of screen in small windows
				pos.h = screenSize - mousePos.y;
			}
		}
		if (Math.round(mousePos.x + menuSize.width) >
		commonCanvasRect.width - commonCanvasRect.left + containingDiv.scrollLeft) {
			pos.x = mousePos.x - menuSize.width;
		}

		return pos;
	}

	calculateContextMenuSize(menu) {
		var numDividers = 0;
		for (let i = 0; i < menu.length; ++i) {
			const divider = menu[i].divider;
			if (divider) {
				numDividers++;
			}
		}

		var menuSize = {
			height: ((menu.length - numDividers) * CONTEXT_MENU_LINK_HEIGHT) +
			(CONTEXT_MENU_MARGIN + CONTEXT_MENU_BORDER + CONTEXT_MENU_PADDING),
			width: CONTEXT_MENU_MIN_WIDTH - (CONTEXT_MENU_MARGIN + CONTEXT_MENU_BORDER + CONTEXT_MENU_PADDING)
		};

		return menuSize;
	}

	contextMenuClicked(action) {
		CanvasController.contextMenuActionHandler(action);
	}

	render() {
		// Reposition contextMenu so that it does not show off the screen
		var menuSize = this.calculateContextMenuSize(this.props.contextMenuDef);
		const pos = this.repositionContextMenu(CanvasController.getContextMenuPos(), menuSize);

		// Offset the context menu poisiton by 5 pixels. This moves the menu
		// underneath the pointer. On Firefox this stops the menu from immediately
		// disappearing becasue on FF the handleClickOutside is fired because the
		// mouse pointer is outside of the conetxt menu. On Chrome and Safari
		// (on the Mac) the system does not think the pointer is outside the menu.
		const posStyle = {
			left: pos.x - 5 + "px",
			top: pos.y - 5 + "px"
		};
		if (pos.h) {
			// posStyle.height = pos.h + "px";
		}

		const contextMenu = (<CommonContextMenu
			menuDefinition={this.props.contextMenuDef}
			contextHandler={this.contextMenuClicked}
		/>);

		return (
			<div className="context-menu-popover" style={posStyle}>
				{contextMenu}
			</div>
		);
	}
}

ContextMenuWrapper.propTypes = {
	containingDivId: PropTypes.string.isRequired,
	contextMenuDef: PropTypes.array.isRequired
};

export default enhanceWithClickOutside(ContextMenuWrapper);
