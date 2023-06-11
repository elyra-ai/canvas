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
import { isEmpty } from "lodash";
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";

class CommonCanvasContextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.logger = new Logger("CC-Context-Toolbar");
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
	}

	onMouseLeave(evt) {
		this.props.canvasController.setMouseInContextToolbar(false);
		setTimeout(() => this.props.canvasController.closeContextToolbar(), 200);
	}

	onMouseEnter(evt) {
		this.props.canvasController.setMouseInContextToolbar(true);
	}

	getToolbarConfig({ toolbarItems, menuItems }) {
		const leftBar = [];
		toolbarItems.forEach((item) => {
			leftBar.push(this.getMenuItem(item));
		});
		menuItems.forEach((item) => {
			if (item.divider) {
				leftBar.push({ divider: true });
			} else {
				leftBar.push(this.getMenuItem(item));
			}
		});

		return {
			leftBar: leftBar,
			rightBar: []
		};
	}

	getMenuItem(menuItem) {
		const subMenu = menuItem.submenu ? this.getSubMenu(menuItem) : null;
		return { action: menuItem.action, label: menuItem.label, subMenu, enable: this.getEnable(menuItem), iconEnabled: menuItem.icon };
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

	toolbarActionHandler(action, editParam) {
		this.props.canvasController.setMouseInContextToolbar(false);
		this.props.canvasController.closeContextToolbar();
		this.props.canvasController.contextMenuActionHandler(action, editParam);
	}

	render() {
		this.logger.log("render");

		let contextToolbar = null;

		if (!isEmpty(this.props.contextMenuDef)) {
			const pos = this.props.canvasController.getContextMenuPos();
			const toolbarItems = this.props.contextMenuDef.filter((cmItem) => cmItem.toolbarItem && !cmItem.divider);
			const menuItems = this.props.contextMenuDef.filter((cmItem) => !cmItem.toolbarItem);
			const toolbarConfig = this.getToolbarConfig({ toolbarItems, menuItems });

			const overflowItemCount = menuItems.length > 0 ? 1 : 0;
			const toolbarItemsCount = toolbarItems.length + overflowItemCount;
			const reduction = menuItems.length > 0 ? 1 : 0;
			const width = (toolbarItemsCount * 34) - reduction;
			const x = pos.x - width;
			const y = (pos.y - 32) - 4;

			contextToolbar = (
				<div className={"context-toolbar"} style={{ left: x, top: y, width }}
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
	contextMenuDef: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => ({
	contextMenuDef: state.contextmenu.menuDef
});

export default connect(mapStateToProps)(CommonCanvasContextToolbar);
