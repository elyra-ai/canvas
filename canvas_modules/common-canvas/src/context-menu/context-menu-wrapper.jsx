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

const CONTEXT_MENU_BUTTON = 2;
const CONTEXT_MENU_TOOLBAR_HEIGHT = 45; // Height of tooolbar

export default class ContextMenuWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.contextMenuClicked = this.contextMenuClicked.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside, true);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.handleClickOutside, true);
	}

	getCanvasRect() {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const clientRect = containingDiv.getBoundingClientRect();
		const canvasRect = {
			top: clientRect.top,
			bottom: clientRect.bottom,
			left: clientRect.left,
			right: clientRect.right,
			height: clientRect.height,
			width: clientRect.width
		};

		// The commonCanvasRect height and top are relative to the bottom of the
		// page banner while the context menu mouse position is relative to the
		// SVG area which starts at the bottom of the toolbar. So we need to adjust
		// the commonCanvasRect to be relative to the bottom of the toolbar.
		canvasRect.top = 0;
		canvasRect.bottom = canvasRect.height - CONTEXT_MENU_TOOLBAR_HEIGHT;
		canvasRect.height -= CONTEXT_MENU_TOOLBAR_HEIGHT;

		canvasRect.left = 0;
		canvasRect.right = canvasRect.width;

		return canvasRect;
	}

	handleClickOutside(e) {
		// On Firefox, the context menu gesture emits both a 'context menu' event
		// and a 'click' event. If the click is processed it causes the
		// context menu to disappear imediately after it has displayed.
		// Consequently, when this method is called with the context menu button set
		// (which indicates one of the additional clicks from Firefox) we just
		// stop propogation and return. On other browsers we don't get this extra
		// events.
		// Also, on Safari, when a user is displaying the context menu with a ctrl-click,
		// the click is received with a ctrlKey field enabled. So we also ignore that.
		if (e.button === CONTEXT_MENU_BUTTON || e.ctrlKey) {
			e.stopPropagation();
			return;
		}

		// If the click was anywhere outside the context menu we just close the menu.
		const domNode = document.getElementById("context-menu-popover");
		if (domNode && !domNode.contains(e.target)) {
			this.props.canvasController.closeContextMenu();
			e.stopPropagation();
		}
	}

	contextMenuClicked(action) {
		this.props.canvasController.contextMenuActionHandler(action);
	}

	render() {
		return (
			<CommonContextMenu
				contextHandler={this.contextMenuClicked}
				menuDefinition={this.props.contextMenuDef}
				canvasRect={this.getCanvasRect()}
				mousePos={this.props.canvasController.getContextMenuPos()}
			/>
		);
	}
}

ContextMenuWrapper.propTypes = {
	contextMenuDef: PropTypes.array.isRequired,
	containingDivId: PropTypes.string.isRequired,
	canvasController: PropTypes.object.isRequired
};
