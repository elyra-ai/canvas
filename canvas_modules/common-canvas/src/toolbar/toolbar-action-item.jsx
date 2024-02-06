/*
 * Copyright 2017-2023 Elyra Authors
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

import ToolbarButtonItem from "./toolbar-button-item.jsx";

import classNames from "classnames";
import ToolbarSubMenu from "./toolbar-sub-menu.jsx";
import ToolbarSubPanel from "./toolbar-sub-panel.jsx";

const ESC_KEY = 27;
const RIGHT_ARROW_KEY = 39;

class ToolbarActionItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subAreaDisplayed: false
		};

		this.divRef = React.createRef();

		this.actionClickHandler = this.actionClickHandler.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.openSubArea = this.openSubArea.bind(this);
		this.closeSubArea = this.closeSubArea.bind(this);
		this.clickOutside = this.clickOutside.bind(this);
	}

	// We must remove the eventListener in case this class is unmounted due
	// to the toolbar getting redrawn.
	componentWillUnmount() {
		document.removeEventListener("click", this.clickOutside, false);
	}

	onKeyDown(evt) {
		if (evt.keyCode === ESC_KEY && !this.props.isOverflowItem) {
			this.closeSubArea();
			return;

		} else if (evt.keyCode === RIGHT_ARROW_KEY &&
			((this.props.actionObj.subMenu || this.props.actionObj.subPanel) && this.props.isOverflowItem)) {
			evt.stopPropagation();
			this.openSubArea();

		}

		// This will call toolbar.jsx for a regular toolbar item and toolbar-action-sub-area.jsx
		// for an item in a sub-menu.
		this.props.onKeyDown(evt);
	}

	onMouseEnter(evt) {
		if ((this.props.actionObj.subMenu || this.props.actionObj.subPanel) && this.props.isOverflowItem) {
			this.openSubArea();
		}
	}

	onMouseLeave(evt) {
		if ((this.props.actionObj.subMenu || this.props.actionObj.subPanel) && this.props.isOverflowItem) {
			this.closeSubArea();
		}
	}

	// Called by toolbar.jsx
	getBoundingRect() {
		return this.divRef.current.getBoundingClientRect();
	}

	// Called by toolbar.jsx
	getAction() {
		return this.props.actionObj.action;
	}

	// Called by toolbar.jsx
	isEnabled() {
		return this.props.actionObj.enable;
	}

	clickOutside(evt) {
		if (this.state.subAreaDisplayed) {
			const items = document.getElementsByClassName(this.generateActionName());
			const isOver = items && items.length > 0 ? items[0].contains(evt.target) : false;

			if (!isOver) {
				this.closeSubArea();
			}
		}
	}

	openSubArea() {
		this.setState({ subAreaDisplayed: true });
	}

	closeSubArea() {
		this.setState({ subAreaDisplayed: false });
	}

	actionClickHandler(evt) {
		if (this.props.actionObj.subMenu || this.props.actionObj.subPanel) {
			if (this.state.showExtendedMenu) {
				document.removeEventListener("click", this.clickOutside, false);
			} else {
				document.addEventListener("click", this.clickOutside, false);
			}

			if (this.props.setResizeHandler) {
				if (this.state.subAreaDisplayed) {
					this.props.setResizeHandler(null);
				} else {
					this.props.setResizeHandler(this.closeSubArea);
				}
			}

			if (!this.props.isOverflowItem) {
				this.closeSubArea();
			}

			this.setState({ subAreaDisplayed: !this.state.subAreaDisplayed });
			return;
		}

		this.props.setFocusAction(this.props.actionObj.action);
		this.props.toolbarActionHandler(this.props.actionObj.action, evt);
	}

	generateActionName() {
		return this.props.actionObj.action + "-action";
	}

	// Returns a sub-area for a cascading menu item. The sub-area can be either a
	// sub-panel which is a div contaiing whatever the caller passes in within the
	// supPanel field  OR a sub-menu which is a list of options which is created
	// from the array of items the caller passes in the subMenu field.
	generateSubArea() {
		const actionItemRect = this.divRef.current.getBoundingClientRect();

		if (this.props.actionObj.subPanel) {
			return (
				<ToolbarSubPanel
					subPanel={this.props.actionObj.subPanel}
					subPanelData={this.props.actionObj.subPanelData}
					closeSubArea={this.closeSubArea}
					closeSubAreaOnClick={!(typeof this.props.actionObj.closeSubAreaOnClick === "undefined")}
					actionItemRect={actionItemRect}
					expandDirection={this.props.isOverflowItem ? "horizontal" : "vertical" }
					containingDivId={this.props.containingDivId}
				/>
			);
		}
		return (
			<ToolbarSubMenu
				subMenu={this.props.actionObj.subMenu}
				generateSubMenuItems={this.props.generateSubMenuItems}
				closeSubArea={this.closeSubArea}
				closeSubAreaOnClick={!(typeof this.props.actionObj.closeSubAreaOnClick === "undefined")}
				actionItemRect={actionItemRect}
				expandDirection={this.props.isOverflowItem ? "horizontal" : "vertical" }
				containingDivId={this.props.containingDivId}
				parentSelector={this.generateSelector(this.props.actionObj)}
				isCascadeMenu
			/>
		);
	}

	generateSelector(actionObj) {
		if (this.props.isOverflowItem) {
			return ".toolbar-overflow-menu-item";
		} else if (actionObj.jsx) {
			return ".toolbar-jsx-item";
		}
		return ".toolbar-item";
	}

	render() {
		const actionObj = this.props.actionObj;
		const actionName = this.generateActionName();


		const isToolbarItem = this.props.isOverflowItem ? null : true; // null wil make data-toolbar-item be removed
		const kindAsClass = actionObj.kind ? actionObj.kind : "default";

		const itemClassName = classNames(
			{ "toolbar-overflow-menu-item": this.props.isOverflowItem,
				"toolbar-item": !this.props.isOverflowItem && !actionObj.jsx,
				"toolbar-jsx-item": !this.props.isOverflowItem && actionObj.jsx,
				"toolbar-overflow-jsx-item": this.props.isOverflowItem && actionObj.jsx,
				"toolbar-item-selected": actionObj.isSelected },
			kindAsClass,
			actionName);

		const subArea = this.state.subAreaDisplayed ? this.generateSubArea() : null;

		return (
			<div ref={this.divRef} className={itemClassName} data-toolbar-action={actionObj.action} data-toolbar-item={isToolbarItem}
				onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onKeyDown={this.onKeyDown}
			>
				<div>
					<ToolbarButtonItem
						actionObj={actionObj}
						actionName={this.generateActionName()}
						tooltipDirection={this.props.tooltipDirection}
						instanceId={this.props.instanceId}
						containingDivId={this.props.containingDivId}
						isOverflowItem={this.props.isOverflowItem}
						subAreaDisplayed={this.state.subAreaDisplayed}
						actionClickHandler={this.actionClickHandler}
						toolbarFocusAction={this.props.toolbarFocusAction}
						isFocusInToolbar={this.props.isFocusInToolbar}
						size={this.props.size}
					/>
				</div>
				{subArea}
			</div>
		);
	}
}

ToolbarActionItem.propTypes = {
	actionObj: PropTypes.shape({
		action: PropTypes.string.isRequired,
		label: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		incLabelWithIcon: PropTypes.oneOf(["no", "before", "after"]),
		enable: PropTypes.bool,
		iconEnabled: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		iconDisabled: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		]),
		className: PropTypes.string,
		textContent: PropTypes.string,
		isSelected: PropTypes.bool,
		kind: PropTypes.string,
		closeSubAreaOnClick: PropTypes.bool,
		subMenu: PropTypes.array,
		subPanel: PropTypes.any,
		subPanelData: PropTypes.object,
		jsx: PropTypes.object,
		tooltip: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
			PropTypes.func
		])
	}),
	tooltipDirection: PropTypes.oneOf(["top", "bottom"]),
	toolbarActionHandler: PropTypes.func.isRequired,
	generateSubMenuItems: PropTypes.func.isRequired,
	setResizeHandler: PropTypes.func,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	isOverflowItem: PropTypes.bool,
	onKeyDown: PropTypes.func,
	toolbarFocusAction: PropTypes.string,
	setFocusAction: PropTypes.func,
	isFocusInToolbar: PropTypes.bool,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarActionItem;
