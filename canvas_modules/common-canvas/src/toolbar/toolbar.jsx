/*
 * Copyright 2017-2020 IBM Corporation
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
import ReactResizeDetector from "react-resize-detector";

import ToolbarActionItem from "./toolbar-action-item.jsx";
import ToolbarOverflowItem from "./toolbar-overflow-item.jsx";
import ToolbarDividerItem from "./toolbar-divider-item.jsx";

class Toolbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showExtendedMenuIndex: -1
		};

		this.leftBar = [];
		this.rightBar = [];

		this.onToolbarResize = this.onToolbarResize.bind(this);
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
		this.generateExtensionMenuItems = this.generateExtensionMenuItems.bind(this);
	}

	// Close the overflow menu, if it is open, when the toolbar is resized in
	// case a new menu needs to be displayed with the new toolbar width.
	onToolbarResize() {
		if (this.state.showExtendedMenuIndex > -1) {
			this.setState({ showExtendedMenuIndex: -1 });
		}
	}

	generateToolbarItems(actionDefinitions, overflow, withSpacer) {
		const newItems = [];

		for (let i = 0; i < actionDefinitions.length; i++) {
			const actionObj = actionDefinitions[i];
			if (actionObj) {
				if (withSpacer && !actionObj.divider) {
					newItems.push(this.generateOverflowIcon(i));
				}
				newItems.push(this.generateToolbarItem(actionObj, i, overflow));
			}
		}
		return newItems;
	}

	generateToolbarItem(actionObj, i, overflow) {
		let jsx = null;
		if (actionObj) {
			if (actionObj.divider) {
				jsx = (
					<ToolbarDividerItem
						key={"toolbar-item-key-" + i}
						overflow={overflow}
					/>
				);
			} else {
				jsx = (
					<ToolbarActionItem
						key={"toolbar-item-key-" + i}
						actionObj={actionObj}
						toolbarActionHandler={this.props.toolbarActionHandler}
						overflow={overflow}
						instanceId={this.props.instanceId}
					/>
				);
			}
		}
		return jsx;
	}

	generateOverflowIcon(index) {
		const jsx = (
			<ToolbarOverflowItem
				key={"toolbar-overflow-item-key-" + index}
				index={index}
				showExtendedMenu={this.state.showExtendedMenuIndex === index}
				toggleExtendedMenu={this.toggleExtendedMenu}
				generateExtensionMenuItems={this.generateExtensionMenuItems}
			/>
		);

		return jsx;
	}

	generateExtensionMenuItems(leftIndex) {
		const rightItems = this.generateRightOverflowItems();
		rightItems.reverse();

		const overflowMenuBarItems = this.leftBar.slice(leftIndex).concat(rightItems);
		const extensionItems = this.generateToolbarItems(overflowMenuBarItems, true, false);
		return extensionItems;
	}

	generateRightOverflowItems() {
		const newItems = [];
		const id = this.props.instanceId;
		const part = document.querySelector(`.toolbar-div[instanceid='${id}'] > .toolbar-right-bar`) || [];
		if (!part) {
			return [];
		}

		const items = part.querySelectorAll("[data-toolbar-item=true]") || [];
		let topRow = 0;

		for (let i = 0; i < items.length; i++) {
			const rect = items[i].getBoundingClientRect();

			if (i === 0) {
				topRow = rect.top;
			}

			if (rect.top !== topRow) {
				newItems.push(this.rightBar[i]);
			}
		}
		return newItems;
	}

	toggleExtendedMenu(index) {
		const newIndex = index === this.state.showExtendedMenuIndex ? -1 : index;
		this.setState({ showExtendedMenuIndex: newIndex });
	}

	render() {
		this.leftBar = this.props.config.leftBar || [];
		this.rightBar = this.props.config.rightBar || [];
		this.rightBar = [...this.rightBar].reverse() || [];

		const leftItems = this.generateToolbarItems(this.leftBar, false, true);
		const rightItems = this.generateToolbarItems(this.rightBar, false, false);

		const canvasToolbar = (
			<ReactResizeDetector handleWidth onResize={this.onToolbarResize}>
				<div className="toolbar-div" instanceid={this.props.instanceId}>
					<div className="toolbar-left-bar">
						{leftItems}
					</div>
					<div className="toolbar-right-bar">
						{rightItems}
					</div>
				</div>
			</ReactResizeDetector>
		);
		return canvasToolbar;
	}
}

Toolbar.propTypes = {
	config: PropTypes.object.isRequired,
	instanceId: PropTypes.number,
	toolbarActionHandler: PropTypes.func
};

export default Toolbar;
