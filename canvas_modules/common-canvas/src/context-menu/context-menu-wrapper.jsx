/*
 * Copyright 2017-2022 Elyra Authors
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

import React from "react";
import PropTypes from "prop-types";
import CommonContextMenu from "./common-context-menu.jsx";

const CONTEXT_MENU_BUTTON = 2;

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

	// Returns an object that describes the dimensions of a rectangle for the
	// canvas div with coordinates based on the top left corner of the div. This
	// will match the coordinates for the mouse position where the user clicked,
	// which is specified in this.props.contextMenuPos object.
	getCanvasRect() {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const clientRect = containingDiv.getBoundingClientRect();
		const canvasRect = {
			top: 0,
			bottom: clientRect.bottom - clientRect.top,
			left: 0,
			right: clientRect.right - clientRect.left,
			height: clientRect.height,
			width: clientRect.width
		};

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
			// This stop propagation is needed in common canvas so that selected nodes will
			// remain selected even after clicking outside the context menu to close the menu.
			if (this.props.stopPropagation) {
				e.stopPropagation();
			}
			this.props.closeContextMenu();
		}
	}

	contextMenuClicked(action, param) {
		this.props.contextMenuActionHandler(action, param);
	}

	render() {
		return (
			<CommonContextMenu
				contextHandler={this.contextMenuClicked}
				menuDefinition={this.props.contextMenuDef}
				canvasRect={this.getCanvasRect()}
				mousePos={this.props.contextMenuPos}
			/>
		);
	}
}

ContextMenuWrapper.propTypes = {
	contextMenuDef: PropTypes.array.isRequired,
	containingDivId: PropTypes.string.isRequired,
	contextMenuPos: PropTypes.object.isRequired,
	contextMenuActionHandler: PropTypes.func.isRequired,
	closeContextMenu: PropTypes.func.isRequired,
	stopPropagation: PropTypes.bool
};
