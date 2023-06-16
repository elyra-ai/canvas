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
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";
import ColorPickerPanel from "../color-picker/color-picker-panel.jsx";

const CM_TOOLBAR_GAP = 4;
const CM_ICON_SIZE = 32;
const CM_ICON_PAD = 2;

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
		toolbarItems.forEach((item) => {
			leftBar.push(this.getMenuItem(item));
		});

		// Records if we have just displayed a divider. This is useful because we
		// only want to display one divider if there is a divider element
		// immediately after another divider element in the overflowMenuItems array.
		let previousDivider = false;

		overflowMenuItems.forEach((item) => {
			if (item.divider) {
				if (!previousDivider) {
					leftBar.push({ divider: true });
					previousDivider = true;
				}
			} else {
				leftBar.push(this.getMenuItem(item));
				previousDivider = false;
			}
		});

		return {
			leftBar: leftBar,
			rightBar: []
		};
	}

	getMenuItem(menuItem) {
		const subPanel = this.getSubPanel(menuItem);
		const subMenu = !subPanel && menuItem.submenu ? this.getSubMenu(menuItem) : null;
		return { action: menuItem.action, label: menuItem.label, subMenu, subPanel, enable: this.getEnable(menuItem), iconEnabled: menuItem.icon };
	}

	getSubPanel(menuItem) {
		if (menuItem.action === "colorBackground") {
			return this.buildColorPickerPanel();
		}
		return null;
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
		// If there is at least one overflow item, we will need an overflow
		// icon which will increase the toolbar items by one.
		const overflowItemCount = overflowMenuItems.length > 0 ? 1 : 0;
		const toolbarItemsCount = toolbarItems.length + overflowItemCount;

		// If we have some overflow menu items, we reduce the width by one pixel
		// which forces the overflow menu and the overflow icon to be shown.
		const reduction = overflowMenuItems.length > 0 ? 1 : 0;
		return (toolbarItemsCount * (CM_ICON_SIZE + CM_ICON_PAD)) - reduction;
	}

	toolbarActionHandler(action, editParam) {
		this.props.canvasController.setMouseInContextToolbar(false);
		this.props.canvasController.closeContextToolbar();
		this.props.canvasController.contextMenuActionHandler(action, editParam);
	}

	colorClicked(color) {
		this.toolbarActionHandler("colorSelectedObjects", { color });
	}

	buildColorPickerPanel() {
		return (
			<ColorPickerPanel clickActionHandler={this.colorClicked} />
		);
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

	render() {
		this.logger.log("render");

		let contextToolbar = null;

		if (this.props.showContextMenu) {
			const toolbarItems = this.props.contextMenuDef.filter((cmItem) => cmItem.toolbarItem && !cmItem.divider);
			const overflowMenuItems = this.props.contextMenuDef.filter((cmItem) => !cmItem.toolbarItem);
			const toolbarConfig = this.getToolbarConfig({ toolbarItems, overflowMenuItems });

			const toolbarWidth = this.getContextToolbarWidth(toolbarItems, overflowMenuItems);

			// Note: cmPos is already adjusted as a starting point for the context
			// toolbar position by a calculation in svg-canvas-renderer.js.
			const pos = this.props.contextSource.cmPos || { x: 0, y: 0 };
			const x = this.shouldCenterJustifyToolbar()
				? pos.x - (toolbarWidth / 2)
				: pos.x - toolbarWidth;
			const y = (pos.y - CM_ICON_SIZE) - CM_TOOLBAR_GAP;

			contextToolbar = (
				<div className={"context-toolbar"} style={{ left: x, top: y, width: toolbarWidth }}
					onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}
				>
					<Toolbar
						config={toolbarConfig}
						instanceId={this.props.canvasController.getInstanceId()}
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
