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
import ToolbarSubMenuItem from "./toolbar-sub-menu-item.jsx";
import ToolbarDividerItem from "./toolbar-divider-item";

import { adjustSubAreaPosition, generateSubAreaStyle } from "./toolbar-sub-utils.js";

const ESC_KEY = 27;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;

class ToolbarSubMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusAction: "subarea"
		};

		this.areaRef = React.createRef();

		this.onKeyDown = this.onKeyDown.bind(this);
		this.setFocusAction = this.setFocusAction.bind(this);
		this.setSubMenuFocus = this.setSubMenuFocus.bind(this);
	}

	componentDidMount() {
		if (this.props.containingDivId && this.props.subMenuActions.length > 0) {
			adjustSubAreaPosition(this.areaRef,
				this.props.containingDivId, this.props.expandDirection, this.props.actionItemRect);
		}

		if (this.state.focusAction === "subarea") {
			this.setFocusOnFirstItem();
		}
	}

	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY) {
			this.props.closeSubArea();
			evt.stopPropagation(); // Stop propagation in a case we are a cascade menu

		} else if (evt.keyCode === UP_ARROW_KEY) {
			this.setFocusOnPreviousItem();
			evt.stopPropagation(); // Stop propagation in a case we are a cascade menu

		} else if (evt.keyCode === DOWN_ARROW_KEY) {
			this.setFocusOnNextItem();
			evt.stopPropagation(); // Stop propagation in a case we are a cascade menu

		} else if (evt.keyCode === LEFT_ARROW_KEY) {
			evt.stopPropagation(); // Stop propagation in a case we are a cascade menu

		} else if (evt.keyCode === RIGHT_ARROW_KEY) {
			evt.stopPropagation(); // Stop propagation in a case we are a cascade menu
		}
	}

	setFocusOnFirstItem() {
		const focusableActions = this.getFocusableActions();
		if (focusableActions.length > 0) {
			this.setFocusAction(focusableActions[0].action);
		}
	}

	setFocusOnPreviousItem() {
		const focusableActions = this.getFocusableActions();
		const previousFocusAction = this.getPreviousFocusAction(focusableActions);
		if (previousFocusAction) {
			this.setFocusAction(previousFocusAction.action);
		}
	}

	setFocusOnNextItem() {
		const focusableActions = this.getFocusableActions();
		const nextFocusAction = this.getNextFocusAction(focusableActions);
		if (nextFocusAction) {
			this.setFocusAction(nextFocusAction.action);
		}
	}

	setFocusAction(focusAction) {
		this.setState({ focusAction });
	}

	setSubMenuFocus() {
		this.setFocusAction(this.state.focusAction);
	}

	getFocusableActions() {
		const focusableActions = [];

		for (let i = 0; i < this.props.subMenuActions.length; i++) {
			if (this.props.subMenuActions[i].enable) {
				focusableActions.push(this.props.subMenuActions[i]);
			}
		}

		return focusableActions;
	}

	getPreviousFocusAction(focuableActions) {
		const index = focuableActions.findIndex((fa) => fa.action === this.state.focusAction);
		if (index > 0) {
			return focuableActions[index - 1];
		}
		return focuableActions[focuableActions.length - 1];
	}

	getNextFocusAction(focuableActions) {
		const index = focuableActions.findIndex((fa) => fa.action === this.state.focusAction);
		if (index < focuableActions.length - 1) {
			return focuableActions[index + 1];
		}
		return focuableActions[0];
	}

	// Generates an array of JSX objects for a sub-menu defined by the
	// prop subMenuActions parameter array.
	generateSubMenuItems() {
		const newItems = [];

		for (let i = 0; i < this.props.subMenuActions.length; i++) {
			const actionObj = this.props.subMenuActions[i];
			if (actionObj) {
				newItems.push(this.generateSubMenuItem(actionObj, i));
			}
		}
		return newItems;
	}

	// Returns JSX for a toolbar item based on the actionObj passed in.
	generateSubMenuItem(actionObj, i) {
		let jsx = null;

		if (actionObj) {
			if (actionObj.divider) {
				jsx = (
					<ToolbarDividerItem
						key={"toolbar-item-key-" + i}
						isInMenu
					/>
				);
			} else {
				jsx = (
					<ToolbarSubMenuItem
						key={"toolbar-item-key-" + i}
						actionObj={actionObj}
						toolbarActionHandler={this.props.toolbarActionHandler}
						closeParentSubArea={this.props.closeSubArea}
						instanceId={this.props.instanceId}
						containingDivId={this.props.containingDivId}
						subMenuFocusAction={this.state.focusAction}
						setToolbarFocus={this.props.setToolbarFocus}
						setSubMenuFocus={this.props.setSubMenuFocus ? this.props.setSubMenuFocus : this.setSubMenuFocus}
						size={this.props.size}
						isInCascadeMenu
					/>
				);
			}
		}
		return jsx;
	}

	render() {
		if (this.props.subMenuActions.length > 0) {
			const style = this.props.isCascadeMenu
				? generateSubAreaStyle(this.props.expandDirection, this.props.actionItemRect)
				: null;

			this.subMenuItems = this.generateSubMenuItems();

			return (
				<div ref={this.areaRef} style={style} className={"toolbar-popover-list submenu"}
					onClick={this.onClick} tabIndex={-1} onFocus={this.onFocus} onKeyDown={this.onKeyDown}
				>
					{this.subMenuItems}
				</div>
			);
		}
		return null;
	}
}

ToolbarSubMenu.propTypes = {
	subMenuActions: PropTypes.array.isRequired,
	instanceId: PropTypes.number.isRequired,
	toolbarActionHandler: PropTypes.func,
	closeSubArea: PropTypes.func,
	setToolbarFocus: PropTypes.func,
	setSubMenuFocus: PropTypes.func,
	actionItemRect: PropTypes.object.isRequired,
	expandDirection: PropTypes.string.isRequired,
	containingDivId: PropTypes.string,
	parentSelector: PropTypes.string,
	isCascadeMenu: PropTypes.bool,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarSubMenu;
