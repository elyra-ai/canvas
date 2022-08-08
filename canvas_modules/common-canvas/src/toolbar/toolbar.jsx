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

		this.onFocus = this.onFocus.bind(this);
		this.onToolbarResize = this.onToolbarResize.bind(this);
		this.toggleExtendedMenu = this.toggleExtendedMenu.bind(this);
		this.generateExtensionMenuItems = this.generateExtensionMenuItems.bind(this);
	}

	// When the toolbar is initially opened the tabindex for each element may not
	// be set correctly because of the time it takes to initially render the DOM.
	// Typically, this means the tabindex is not set correctly on whichever
	// overflow menu icon is displayed. Therefore, as the user moves the focus
	// to the first element in the toolbar (whose tabindex IS typically OK) we
	// set the tabindex for all elements again, this then sets the overflow
	// icon's tabindex correctly.
	onFocus() {
		this.setLeftBarItemsTabIndex();
		this.setRightBarItemsTabIndex();
	}

	// Prevents the inline-block elements of the left bar being scrolled to
	// reveal the wrapped elements, when the user tabs through the elements.
	onScroll(evt) {
		evt.currentTarget.scroll(0, 0);
		evt.preventDefault();
	}

	// Close the overflow menu, if it is open, when the toolbar is resized in
	// case a new menu needs to be displayed with the new toolbar width.
	onToolbarResize() {
		if (this.state.showExtendedMenuIndex > -1) {
			this.setState({ showExtendedMenuIndex: -1 });
		}

		this.setLeftBarItemsTabIndex();
		this.setRightBarItemsTabIndex();
	}

	// Sets the tabindex on all left bar items so tabbing works correctly. This
	// falls into two parts: 1. Set the tabindex for all overflow items to -1
	// except the overflow item that is displayed (if there is one). 2. Set the
	// tabindex of all hidden regular toolbar items to -1 and to 0 for all
	// displayed regular toolbar items.
	// Note: We detect the y coordinate of the 'top row' by using the top of
	// the first overflow icon. This is because the toolbar might be compressed
	// to the extent that the first overflow icon is the only item on the left
	// of the toolbar.
	setLeftBarItemsTabIndex() {
		const bar = this.getBar("left");
		if (!bar) {
			return;
		}

		const items = bar.querySelectorAll("[data-toolbar-item=true]") || [];
		const topRow = this.getTopOfFirstOverflowItem(bar);
		let lastTopRowElement = -1;

		for (let i = 0; i < items.length; i++) {
			const itemRect = items[i].getBoundingClientRect();

			this.setOverflowItemButtonTabIndex(i, -1, bar);

			if (itemRect.top === topRow) {
				lastTopRowElement = i;
				this.setToolbarItemButtonTabIndex(items[i], 0);
			} else {
				this.setToolbarItemButtonTabIndex(items[i], -1);
			}
		}

		if (lastTopRowElement < items.length) {
			this.setOverflowItemButtonTabIndex(lastTopRowElement + 1, 0, bar);
		}
	}

	// Sets the tabindex on all right bar items so tabbing works correctly. This
	// involves setting the tabindex of all hidden regular toolbar items to -1
	// and to 0 for all displayed regular toolbar items.
	setRightBarItemsTabIndex() {
		const items = this.getRightBarItems();
		let topRow = 0;

		for (let i = 0; i < items.length; i++) {
			const itemRect = items[i].getBoundingClientRect();

			if (i === 0) {
				topRow = itemRect.top;
			}

			if (itemRect.top === topRow) {
				this.setToolbarItemButtonTabIndex(items[i], 0);
			} else {
				this.setToolbarItemButtonTabIndex(items[i], -1);
			}
		}
	}

	getBar(side) {
		const id = this.props.instanceId;
		const part = document.querySelector(`.toolbar-div[instanceid='${id}'] > .toolbar-${side}-bar`) || [];
		return part;
	}

	getRightBarItems() {
		const bar = this.getBar("right");
		if (!bar) {
			return [];
		}
		return bar.querySelectorAll("[data-toolbar-item=true]") || [];
	}

	getTopOfFirstOverflowItem(bar) {
		const firstOverflowItem = this.getOverflowItem(0, bar);
		if (firstOverflowItem) {
			const rect = firstOverflowItem.getBoundingClientRect();
			return rect.top;
		}
		return 0;
	}

	getOverflowItem(index, bar) {
		const overflowClassName = "toolbar-index-" + index;
		return bar.getElementsByClassName(overflowClassName)[0];
	}

	setToolbarItemButtonTabIndex(item, tabIndex) {
		const button = item.querySelector("button");
		if (button) {
			button.setAttribute("tabindex", tabIndex);
		}
	}

	setOverflowItemButtonTabIndex(index, tabIndex, bar) {
		const overflowItem = this.getOverflowItem(index, bar);
		if (overflowItem) {
			const overflowButton = overflowItem.querySelector("button");
			if (overflowButton) {
				overflowButton.setAttribute("tabindex", tabIndex);
			}
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
						tooltipDirection={this.props.tooltipDirection}
						toolbarActionHandler={this.props.toolbarActionHandler}
						overflow={overflow}
						instanceId={this.props.instanceId}
						onFocus={this.onFocus}
						size={this.props.size}
					/>
				);
			}
		}
		return jsx;
	}

	generateOverflowIcon(index) {
		const label = this.props.additionalText ? this.props.additionalText.overflowMenuLabel : "";
		const jsx = (
			<ToolbarOverflowItem
				key={"toolbar-overflow-item-key-" + index}
				index={index}
				showExtendedMenu={this.state.showExtendedMenuIndex === index}
				toggleExtendedMenu={this.toggleExtendedMenu}
				generateExtensionMenuItems={this.generateExtensionMenuItems}
				onFocus={this.onFocus}
				label={label}
				size={this.props.size}
			/>
		);

		return jsx;
	}

	// Generates an array of action definition elements that correspond to the
	// hidden DOM items on the left and right of the toolbar. For any left bar
	// items we can use the leftIndex passed in to split the leftBar defintion
	// array, however for the right side we need to loop through the DOM items
	// and discover which is hidden and which is displayed.
	generateExtensionMenuItems(leftIndex) {
		const rightItems = this.generateRightOverflowItems();
		rightItems.reverse();

		const overflowMenuBarItems = this.leftBar.slice(leftIndex).concat(rightItems);
		const extensionItems = this.generateToolbarItems(overflowMenuBarItems, true, false);
		return extensionItems;
	}

	// Generates an array of right side defintion items that correspond to
	// right side DOM items that are hidden.
	generateRightOverflowItems() {
		const newDefItems = [];
		const items = this.getRightBarItems();
		let topRow = 0;

		for (let i = 0; i < items.length; i++) {
			const rect = items[i].getBoundingClientRect();

			if (i === 0) {
				topRow = rect.top;
			}

			if (rect.top !== topRow) {
				newDefItems.push(this.rightBar[i]);
			}
		}
		return newDefItems;
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
					<div className="toolbar-left-bar" onScroll={this.onScroll}>
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
	toolbarActionHandler: PropTypes.func,
	tooltipDirection: PropTypes.string,
	additionalText: PropTypes.object,
	size: PropTypes.oneOf(["md", "sm"])
};

export default Toolbar;
