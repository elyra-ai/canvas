/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

/* eslint no-shadow: ["error", { "allow": ["event"] }] */

import React from "react";
import enhanceWithClickOutside from "react-click-outside";
import CommonContextMenu from "./common-context-menu.jsx";

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

	handleClickOutside(event) {
		this.props.closeContextMenu();

		// This stops the canvasClicked function from being fired which would
		// clear any current selections. The event here is a real event not a
		// synthetic react mouse event.
		event.stopPropagation();
	}

	repositionContextMenu(mousePos, menuSize) {
		const pos = {};
		pos.x = mousePos.x;
		pos.y = mousePos.y;

		var containingDiv = document.getElementById(this.props.containingDivId);
		var commonCanvasRect = containingDiv.getBoundingClientRect();

		// Reposition contextMenu if it will show off the screen
		if (Math.round(mousePos.y + menuSize.height) >
		commonCanvasRect.height - commonCanvasRect.top + containingDiv.scrollTop) {
			pos.y = mousePos.y - menuSize.height;
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

	render() {
		// Reposition contextMenu so that it does not show off the screen
		var menuSize = this.calculateContextMenuSize(this.props.contextMenuDef);
		const pos = this.repositionContextMenu(this.props.mousePos, menuSize);

		// Offset the context menu poisiton by 5 pixels. This moves the menu
		// underneath the pointer. On Firefox this stops the menu from immediately
		// disappearing becasue on FF the handleClickOutside is fired because the
		// mouse pointer is outside of the conetxt menu. On Chrome and Safari
		// (on the Mac) the system does not think the pointer is outside the menu.
		const posStyle = {
			left: pos.x - 5 + "px",
			top: pos.y - 5 + "px"
		};

		const contextMenu = (<CommonContextMenu
			menuDefinition={this.props.contextMenuDef}
			contextHandler={this.props.contextMenuClicked}
		/>);

		return (
			<div className="context-menu-popover" style={posStyle}>
				{contextMenu}
			</div>
		);
	}
}

ContextMenuWrapper.propTypes = {
	containingDivId: React.PropTypes.string.isRequired,
	mousePos: React.PropTypes.object.isRequired,
	contextMenuDef: React.PropTypes.array.isRequired,
	contextMenuClicked: React.PropTypes.func.isRequired,
	closeContextMenu: React.PropTypes.func.isRequired
};

export default enhanceWithClickOutside(ContextMenuWrapper);
