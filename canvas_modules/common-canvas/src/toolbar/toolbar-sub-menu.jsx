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

import { adjustSubAreaPosition, generateSubAreaStyle } from "./toolbar-sub-utils.js";

const ESC_KEY = 27;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;

class ToolbarActionSubArea extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusAction: "subarea"
		};

		this.areaRef = React.createRef();

		this.onClick = this.onClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		if (this.props.containingDivId) {
			adjustSubAreaPosition(this.areaRef,
				this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);
		}

		if (this.state.focusAction === "subarea") {
			if (this.props.subMenu) {
				this.setFocusOnFirstItem();
			}
		}
	}

	onClick() {
		if (this.props.closeSubArea && this.props.closeSubAreaOnClick) {
			this.props.closeSubArea();
		}
	}

	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY) {
			this.props.closeSubArea();

		} else if (this.props.subMenu) {
			if (evt.keyCode === UP_ARROW_KEY) {
				this.setFocusOnPreviousItem();

			} else if (evt.keyCode === DOWN_ARROW_KEY) {
				this.setFocusOnNextItem();

			} else if (evt.keyCode === LEFT_ARROW_KEY || evt.keyCode === RIGHT_ARROW_KEY) {
				evt.stopPropagation();
				this.props.closeSubArea();
			}
		}
	}

	setFocusOnFirstItem() {
		const focusableItems = this.getFocusableItems();
		if (focusableItems.length > 0) {
			const firstFocusAction = this.getItemAction(focusableItems[0]);
			this.setFocusAction(firstFocusAction);
		}
	}

	setFocusOnPreviousItem() {
		const focusableItems = this.getFocusableItems();
		const previousItem = this.getPreviousItem(focusableItems);
		if (previousItem) {
			const previousFocusAction = this.getItemAction(previousItem);
			this.setFocusAction(previousFocusAction);
		}
	}

	setFocusOnNextItem() {
		const focusableItems = this.getFocusableItems();
		const nextItem = this.getNextItem(focusableItems);
		if (nextItem) {
			const nextFocusAction = this.getItemAction(nextItem);
			this.setFocusAction(nextFocusAction);
		}
	}

	setFocusAction(focusAction) {
		this.setState({ focusAction });
	}

	getFocusableItems() {
		const focusableItems = [];
		const subMenuSelector = `${this.props.parentSelector} > .toolbar-popover-list.submenu`;
		const submenu = document.querySelector(subMenuSelector);
		const items = submenu.querySelectorAll(".toolbar-overflow-menu-item") || [];

		for (let i = 0; i < items.length; i++) {
			const btn = items[i].querySelector("button");
			const disabled = btn.disabled;
			if (!disabled) {
				focusableItems.push(items[i]);
			}
		}
		return focusableItems;
	}

	getPreviousItem(items) {
		const index = items.findIndex((item) => this.getItemAction(item) === this.state.focusAction);
		if (index > 0) {
			return items[index - 1];
		}
		return items[items.length - 1];
	}

	getNextItem(items) {
		const index = items.findIndex((item) => this.getItemAction(item) === this.state.focusAction);
		if (index < items.length - 1) {
			return items[index + 1];
		}
		return items[0];
	}

	getItemAction(item) {
		return item.getAttribute("data-toolbar-action");
	}

	render() {
		const style = generateSubAreaStyle(this.props.expandDirection, this.props.actionItemRect);

		if (this.props.subMenu) {
			this.subMenuItems = this.props.generateSubMenuItems(this.props.subMenu, this.state.focusAction, this.onKeyDown);

			return (
				<div ref={this.areaRef} style={style} className={"toolbar-popover-list submenu"} onClick={this.onClick} tabIndex={-1} onFocus={this.onFocus} >
					{this.subMenuItems}
				</div>
			);
		}
		return null;
	}
}

ToolbarActionSubArea.propTypes = {
	subMenu: PropTypes.array,
	generateSubMenuItems: PropTypes.func.isRequired,
	closeSubArea: PropTypes.func,
	closeSubAreaOnClick: PropTypes.bool.isRequired,
	actionItemRect: PropTypes.object.isRequired,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string,
	parentSelector: PropTypes.string
};

export default ToolbarActionSubArea;
