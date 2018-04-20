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
import CommonContextMenu from "./common-context-menu.jsx";

// context-menu sizing
const CONTEXT_MENU_WIDTH = 160; // see context-menu.css .react-context-menu margin
const CONTEXT_MENU_LINK_HEIGHT = 30; // see context-menu.css .react-context-menu-item height
const CONTEXT_MENU_DIVIDER_HEIGHT = 1; // see context-menu.css .react-context-menu-item height
const CONTEXT_MENU_TOOLBAR_HEIGHT = 45; // Height of tooolbar
const CONTEXT_MENU_BUTTON = 2;

export default class ContextMenuWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.contextMenuClicked = this.contextMenuClicked.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		// On Firefox, the context menu gesture emits a 'click' event which causes the
		// context menu to disappear imediately after it is displayed if clicks are
		// captured, so we look for 'mousedown' events instead.
		document.addEventListener("mousedown", this.handleClickOutside, true);
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleClickOutside, true);
	}

	handleClickOutside(e) {
		const domNode = document.getElementById("context-menu-popover");
		if (domNode && !domNode.contains(e.target)) {
			this.props.canvasController.closeContextMenu();

			// This stops the canvasClicked function from being fired which would
			// clear any current selections. The event here is a real event not a
			// synthetic react mouse event so we need to use the 'stopPropagation' method.
			// We only stop propogation if it is NOT a context menu gesture because
			// when a context menu is requested we need to let the gesture go through
			// to the canvas objects.
			if (e.button !== CONTEXT_MENU_BUTTON) {
				e.stopPropagation();
			}
		}
	}

	// Returns a new position and the canvas rectangle for the context menu based on the current
	// mouse position and whether the menu would appear outside the edges of the page.
	repositionContextMenu(mousePos, menuSize) {
		const pos = {};
		pos.x = mousePos.x;
		pos.y = mousePos.y;
		var containingDiv = document.getElementById(this.props.containingDivId);
		var commonCanvasRect = containingDiv.getBoundingClientRect();

		// The commonCanvasRect height is relative to the bottom of the page banner
		// while the context menu mouse position is relative to the SVG area which
		// starts at the bottom of the toolbar. So we need to adjust the
		// commonCanvasRect to be relative to the bottom of the toolbar.
		var bottom = commonCanvasRect.height - CONTEXT_MENU_TOOLBAR_HEIGHT;

		// Reposition contextMenu if it will show off the bottom of the page
		if (mousePos.y + menuSize.height > bottom) {
			pos.y = bottom - menuSize.height - 5; // Move up by five pixels so it looks nice

			// If repositioning the menu would push it off the top of the page
			// (in very short browser windows) position it at the top.
			if (pos.y < 0) {
				pos.y = 0;
			}
		}

		// Reposition contextMenu if it will show off the right of the page
		if (mousePos.x + menuSize.width > commonCanvasRect.width) {
			pos.x = mousePos.x - menuSize.width;
		}

		return { pos: pos, rect: commonCanvasRect };
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
			height: ((menu.length - numDividers) * CONTEXT_MENU_LINK_HEIGHT) + (numDividers * CONTEXT_MENU_DIVIDER_HEIGHT),
			width: CONTEXT_MENU_WIDTH
		};

		return menuSize;
	}

	contextMenuClicked(action) {
		this.props.canvasController.contextMenuActionHandler(action);
	}

	render() {
		// Reposition contextMenu so that it does not show off the screen
		var menuSize = this.calculateContextMenuSize(this.props.contextMenuDef);
		const posAndRect = this.repositionContextMenu(this.props.canvasController.getContextMenuPos(), menuSize);
		const pos = posAndRect.pos;
		const canvasRect = posAndRect.rect;
		const menuRect = { left: pos.x, top: pos.y, width: menuSize.width, height: menuSize.height };

		const posStyle = {
			left: pos.x + "px",
			top: pos.y + "px"
		};

		const contextMenu = (<CommonContextMenu
			menuDefinition={this.props.contextMenuDef}
			contextHandler={this.contextMenuClicked}
			menuRect={menuRect}
			canvasRect={canvasRect}
		/>);

		return (
			<div id="context-menu-popover" className="context-menu-popover" style={posStyle}>
				{contextMenu}
			</div>
		);
	}
}

ContextMenuWrapper.propTypes = {
	containingDivId: PropTypes.string.isRequired,
	contextMenuDef: PropTypes.array.isRequired,
	canvasController: PropTypes.object.isRequired
};
