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
		if (containingDiv) {
			const clientRect = containingDiv.getBoundingClientRect();
			return {
				top: 0,
				bottom: clientRect.bottom - clientRect.top,
				left: 0,
				right: clientRect.right - clientRect.left,
				height: clientRect.height,
				width: clientRect.width
			};
		}
		// Assist Jests tests to run when containingDiv is not available.
		return { top: 0, bottom: 200, left: 0, right: 50, height: 200, width: 50 };
	}

	handleClickOutside(e) {
		// On Safari, when a user is displaying the context menu with a ctrl-click
		// (which is a supported context menu gesture on the Mac) a secondary click
		// event is emmitted which is received here with the ctrlKey field enabled.
		// So we ignore that event otherwse, if we continue, the context menu will
		// be closed.
		if (e.ctrlKey) {
			e.stopPropagation();
			return;
		}

		// If the click was anywhere outside the context menu and
		// the ellipsis button we just close the menu.
		if (!this.isOverContextMenu(e) && !this.isOverEllipsisButton(e)) {
			// This stop propagation is needed in common canvas so that selected nodes will
			// remain selected even after clicking outside the context menu to close the menu.
			if (this.props.stopPropagation) {
				e.stopPropagation();
			}
			this.props.closeContextMenu();
		}
	}

	// Retruns true if the event occurred over the context menu.
	isOverContextMenu(e) {
		const domNode = document.getElementById("context-menu-popover");
		return !domNode || domNode.contains(e.target);
	}

	// Returns true if the event occurred over the ellipsis button. Typically
	// there will be only one ellipsis button on the canvas, since they are only
	// displayed on hover, but in some test cicumstances there might be more
	// than one.
	isOverEllipsisButton(e) {
		const ellipsisNodes = document.getElementsByClassName("d3-node-ellipsis-group");
		let state = false;
		for (let i = 0; i < ellipsisNodes.length; i++) {
			if (state === false && ellipsisNodes[i].contains(e.target)) {
				state = true;
			}
		}
		return state;
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
