/*
 * Copyright 2017-2024 Elyra Authors
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

class ToolbarSubMenuItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subAreaDisplayed: false
		};

		this.divRef = React.createRef();

		this.actionClickHandler = this.actionClickHandler.bind(this);
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

	onMouseEnter(evt) {
		if (this.props.actionObj.subMenu || this.props.actionObj.subPanel) {
			this.openSubArea();
		}
	}

	onMouseLeave(evt) {
		if (this.props.actionObj.subMenu || this.props.actionObj.subPanel) {
			this.closeSubArea();
		}
	}

	clickOutside(evt) {
		if (this.state.subAreaDisplayed) {
			const toolbarSelector = `.toolbar-div[instanceid='${this.props.instanceId}']`;
			const toolbarElement = document.querySelector(toolbarSelector);
			const items = toolbarElement.getElementsByClassName(this.generateActionName());
			const isOver = items?.length > 0 ? items[0].contains(evt.target) : false;

			if (!isOver && !this.props.actionObj.leaveSubAreaOpenOnClickOutside) {
				this.closeSubArea();
			}
		}
	}

	openSubArea() {
		this.setState({ subAreaDisplayed: true });
	}

	closeSubArea(checkCloseSubAreaOnClick) {
		if (!checkCloseSubAreaOnClick || this.props.actionObj.closeSubAreaOnClick) {
			this.setState({ subAreaDisplayed: false });
		}
	}

	actionClickHandler(evt) {
		if (this.props.actionObj.subMenu || this.props.actionObj.subPanel) {
			if (this.state.subAreaDisplayed) {
				document.removeEventListener("click", this.clickOutside, false);
				this.closeSubArea();
			} else {
				document.addEventListener("click", this.clickOutside, false);
				this.openSubArea();
			}

		} else {
			evt.stopPropagation();
			if (this.props.isInCascadeMenu) {
				this.props.closeParentSubArea(true); // true = close only if closeSubAreaOnClick is checked
				this.props.setSubMenuFocus();

			} else if (this.props.isInOverflowMenu) {
				this.props.setSubMenuFocus(this.props.actionObj.action);

			} else {
				this.props.closeParentSubArea(true); // true = close only if closeSubAreaOnClick is checked
				this.props.setToolbarFocusAction(); // Resets the toolbar focus action
			}
			this.props.toolbarActionHandler(this.props.actionObj.action, evt);
		}
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
					actionItemRect={actionItemRect}
					expandDirection={"horizontal"}
					containingDivId={this.props.containingDivId}
					isCascadeMenu
				/>
			);
		}
		return (
			<ToolbarSubMenu
				subMenuActions={this.props.actionObj.subMenu}
				instanceId={this.props.instanceId}
				toolbarActionHandler={this.props.toolbarActionHandler}
				setSubMenuFocus={this.props.setSubMenuFocus}
				closeSubArea={this.closeSubArea}
				actionItemRect={actionItemRect}
				expandDirection={"horizontal"}
				containingDivId={this.props.containingDivId}
				parentSelector={this.generateSelector()}
				isCascadeMenu
				size={this.props.size}
			/>
		);
	}

	generateSelector() {
		return ".toolbar-sub-menu-item";
	}

	render() {
		const actionObj = this.props.actionObj;
		const actionName = this.generateActionName();
		const kindAsClass = actionObj.kind ? actionObj.kind : "default";

		const itemClassName = classNames(
			{ "toolbar-sub-menu-item": true,
				"toolbar-sub-menu-jsx-item": actionObj.jsx,
				"toolbar-item-selected": actionObj.isSelected },
			kindAsClass,
			actionName);

		const subArea = this.state.subAreaDisplayed ? this.generateSubArea() : null;

		return (
			<div ref={this.divRef} className={itemClassName} data-toolbar-action={actionObj.action}
				onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onKeyDown={this.onKeyDown}
			>
				<div>
					<ToolbarButtonItem
						actionObj={actionObj}
						actionName={this.generateActionName()}
						instanceId={this.props.instanceId}
						isInMenu
						subAreaDisplayed={this.state.subAreaDisplayed}
						actionClickHandler={this.actionClickHandler}
						buttonFocusAction={this.props.subMenuFocusAction}
						isFocusInToolbar // Focus must be in toolbar for this sub-menu item to appear
						size={this.props.size}
					/>
				</div>
				{subArea}
			</div>
		);
	}
}

ToolbarSubMenuItem.propTypes = {
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
		leaveSubAreaOpenOnClickOutside: PropTypes.bool,
		subMenu: PropTypes.array,
		subPanel: PropTypes.any,
		subPanelData: PropTypes.object,
		jsx: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.func
		]),
		tooltip: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
			PropTypes.func
		])
	}),
	toolbarActionHandler: PropTypes.func.isRequired,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	closeParentSubArea: PropTypes.func,
	subMenuFocusAction: PropTypes.string,
	setToolbarFocusAction: PropTypes.func,
	setSubMenuFocus: PropTypes.func,
	isInOverflowMenu: PropTypes.bool,
	isInCascadeMenu: PropTypes.bool,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarSubMenuItem;
