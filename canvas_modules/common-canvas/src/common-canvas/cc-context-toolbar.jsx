/*
 * Copyright 2023 Elyra Authors
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
import { connect } from "react-redux";
import { findLastIndex } from "lodash";
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";
import ColorPicker from "../color-picker";

const CM_TOOLBAR_GAP = 2;
const CM_ICON_SIZE = 32;
const CM_ICON_PAD = 2;
const DIVIDER_SIZE = 1;
const ICON_SIZE_PLUS_GAP = CM_ICON_SIZE + CM_TOOLBAR_GAP;
const PADDING = 2;

class CommonCanvasContextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-Context-Toolbar");
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
		this.colorClicked = this.colorClicked.bind(this);
	}

	onMouseLeave(evt) {
		this.props.canvasController.setMouseInContextToolbar(false);
		setTimeout(() => this.props.canvasController.closeContextToolbar(), 200);
	}

	onMouseEnter(evt) {
		this.props.canvasController.setMouseInContextToolbar(true);
	}

	getToolbarConfig({ toolbarItems, overflowMenuItems }) {
		const leftBar = [];
		toolbarItems.forEach((item) => leftBar.push(this.getMenuItem(item)));
		overflowMenuItems.forEach((item) => leftBar.push(this.getMenuItem(item)));
		return {
			leftBar: leftBar,
			rightBar: []
		};
	}

	getMenuItem(menuItem) {
		if (menuItem.divider) {
			return { divider: true };
		}
		const subPanelInfo = this.getSubPanelInfo(menuItem);
		const subMenu = !subPanelInfo.subPanel && menuItem.menu ? this.getSubMenu(menuItem) : null;

		return {
			action: menuItem.action,
			label: menuItem.label,
			subMenu: subMenu,
			subPanel: subPanelInfo.subPanel,
			subPanelData: subPanelInfo.subPanelData,
			enable: this.getEnable(menuItem),
			iconEnabled: menuItem.icon
		};
	}

	getSubPanelInfo(menuItem) {
		if (menuItem.action === "colorBackground") {
			return { subPanel: ColorPicker, subPanelData: { clickActionHandler: (color) => this.colorClicked(color) } };
		}
		return {};
	}

	getSubMenu(menuItem) {
		if (typeof menuItem.menu === "object") {
			return menuItem.menu.map((option) => {
				if (option.divider) {
					return { divider: true };
				}
				return { action: option.action, label: option.label, enable: this.getEnable(option), iconEnabled: option.icon };
			});
		}
		return null;
	}

	getEnable(menuItem) {
		if (typeof menuItem.enable === "undefined") {
			return true;
		}
		return menuItem.enable;
	}

	// Returns the width of the context toolbar.
	getContextToolbarWidth(toolbarItems, overflowMenuItems) {
		const dividers = toolbarItems.filter((i) => i.divider);
		const dividersCount = dividers.length;
		const dividersWidth = dividersCount * DIVIDER_SIZE;

		// If there is at least one overflow item, we will need an overflow
		// icon which will increase the toolbar items by one.
		const overflowItemCount = overflowMenuItems.length > 0 ? 1 : 0;
		const buttonsCount = toolbarItems.length + overflowItemCount - dividersCount;
		const buttonsWidth = (buttonsCount * (CM_ICON_SIZE + CM_ICON_PAD));

		// If we have some overflow menu items, we reduce the width by five pixels
		// which forces the overflow menu and the overflow icon to be shown. We
		// use 5 pixels because this is how many are needed to make the toolbar
		// work correcty with differnet browser magnificaitons.
		const reduction = overflowMenuItems.length > 0 ? 5 : 0;
		return buttonsWidth + dividersWidth - reduction;
	}

	// Removes leading and trailing dividers from the items array and any
	// remaining places where there are consecutive dividers are reduced to a
	// single divider. These unecessary dividers may occur because the app's
	// contextMenuHandler may return an array which result in these being left
	// in the overflowItems array.
	removeUnnecessaryDividers(items) {
		const start = items.findIndex((item) => !item.divider);
		const end = findLastIndex(items, (item) => !item.divider);
		const trimmedItems = items.slice(start, end + 1);

		const outItems = [];
		let previousDivider = false;

		trimmedItems.forEach((item) => {
			if (item.divider) {
				if (!previousDivider) {
					outItems.push(item);
				}
				previousDivider = true;
			} else {
				outItems.push(item);
				previousDivider = false;
			}
		});
		return outItems;
	}

	toolbarActionHandler(action, editParam) {
		this.props.canvasController.setMouseInContextToolbar(false);
		this.props.canvasController.closeContextToolbar();
		this.props.canvasController.contextMenuActionHandler(action, editParam);
	}

	colorClicked(color) {
		this.toolbarActionHandler("colorSelectedObjects", { color });
	}

	shouldCenterJustifyToolbar() {
		const objType = this.props.contextSource.type;
		return (
			objType === "link" ||
			objType === "canvas" ||
			objType === "node" &&
				this.props.contextSource.targetObject.layout.contextToolbarPosition === "topCenter" &&
				!this.props.contextSource.targetObject.is_expanded);
	}

	// Returns adjusted x, y  coordinates for the context menu to ensure it appears
	// fully within the containing div (viewport).
	adjustPosToFit(x, y, width, height) {
		const containingDiv = document.getElementById(this.props.containingDivId);
		const divRect = containingDiv
			? containingDiv.getBoundingClientRect()
			: { top: -1000, bottom: 1000, left: -1000, right: 1000 }; // To enable Jest tests.

		const rect = {
			left: 0,
			right: divRect.right - divRect.left,
			top: 0,
			bottom: divRect.bottom - divRect.top
		};

		let newX = x;
		let newY = y;

		const rightOver = (x + width) - rect.right;
		const leftOver = rect.left - x;
		const bottomOver = (y + height) - rect.bottom;
		const topOver = rect.top - y;

		if (rightOver > 0) {
			newX -= rightOver + PADDING;

		} else if (leftOver > 0) {
			newX += leftOver + PADDING;
		}

		if (bottomOver > 0) {
			newY -= bottomOver + PADDING;

		} else if (topOver > 0) {
			newY += topOver + PADDING;
		}

		return { x: newX, y: newY };
	}

	render() {
		this.logger.log("render");

		let contextToolbar = null;

		if (this.props.showContextMenu) {
			const toolbarItems = this.props.contextMenuDef.filter((cmItem) => cmItem.toolbarItem);
			let overflowMenuItems = this.props.contextMenuDef.filter((cmItem) => !cmItem.toolbarItem);
			overflowMenuItems = this.removeUnnecessaryDividers(overflowMenuItems);
			const toolbarConfig = this.getToolbarConfig({ toolbarItems, overflowMenuItems });
			const toolbarWidth = this.getContextToolbarWidth(toolbarItems, overflowMenuItems);

			// Note: cmPos is already adjusted as a starting point for the context
			// toolbar position by a calculation in svg-canvas-renderer.js.
			const pos = this.props.contextSource.cmPos || { x: 0, y: 0 };
			let x = this.shouldCenterJustifyToolbar()
				? pos.x - (toolbarWidth / 2)
				: pos.x - toolbarWidth;
			let y = pos.y - ICON_SIZE_PLUS_GAP;

			// Make sure the context toolbar is fully inside the viewport.
			({ x, y } = this.adjustPosToFit(x, y, toolbarWidth, ICON_SIZE_PLUS_GAP));

			contextToolbar = (
				<div className={"context-toolbar"} style={{ left: x, top: y, width: toolbarWidth }}
					onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}
				>
					<Toolbar
						config={toolbarConfig}
						instanceId={this.props.canvasController.getInstanceId()}
						containingDivId={this.props.containingDivId}
						toolbarActionHandler={this.toolbarActionHandler}
						tooltipDirection={"top"}
						size={"sm"}
					/>
				</div>
			);
		}

		return contextToolbar;
	}
}

CommonCanvasContextToolbar.propTypes = {
	// Provided by CommonCanvas
	canvasController: PropTypes.object.isRequired,
	containingDivId: PropTypes.string.isRequired,

	// Provided by redux
	contextMenuDef: PropTypes.array.isRequired,
	contextSource: PropTypes.object.isRequired,
	showContextMenu: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
	contextMenuDef: state.contextmenu.menuDef,
	contextSource: state.contextmenu.source,
	showContextMenu: state.contextmenu.isOpen
});

export default connect(mapStateToProps)(CommonCanvasContextToolbar);
