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

const ESC_KEY = 27;
const DOWN_ARROW_KEY = 40;
const TOOLBAR_ICON_WIDTH = 40;

class ToolbarActionItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subAreaDisplayed: false
		};

		this.divRef = React.createRef();

		this.actionClickHandler = this.actionClickHandler.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
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
		if (evt.keyCode === ESC_KEY) {
			this.closeSubArea();

		} else if (evt.keyCode === DOWN_ARROW_KEY) {
			if (this.hasSubArea()) {
				this.openSubArea();
			}
		}
		// Left and Right arrow clicks are caught in the
		// toolbar.jsx onKeyDown method.
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
		return this.props.actionObj.enable || this.props.actionObj.jsx;
	}

	// Called by toolbar.jsx and internally
	isSubAreaDisplayed() {
		if (this.props.actionObj.setExtIsSubAreaDisplayed &&
			typeof this.props.actionObj.extIsSubAreaDisplayed !== "undefined") {
			return this.props.actionObj.extIsSubAreaDisplayed;
		}
		return this.state.subAreaDisplayed;
	}

	clickOutside(evt) {
		if (this.isSubAreaDisplayed()) {
			const items = document.getElementsByClassName(this.generateActionName());
			const isOver = items && items.length > 0 ? items[0].contains(evt.target) : false;

			if (!isOver && !this.props.actionObj.leaveSubAreaOpenOnClickOutside) {
				this.closeSubArea();
			}
		}
	}

	hasSubArea() {
		return this.props.actionObj.subMenu || this.props.actionObj.subPanel;
	}

	openSubArea() {
		// If host app is controlling display of the sub-area call it to say
		// sub-area is closing.
		if (this.props.actionObj.setExtIsSubAreaDisplayed) {
			this.props.actionObj.setExtIsSubAreaDisplayed(true);
			return;
		}
		this.setState({ subAreaDisplayed: true });
	}

	closeSubArea(checkCloseSubAreaOnClick) {
		if (!checkCloseSubAreaOnClick || this.props.actionObj.closeSubAreaOnClick) {
			// If host app is controlling display of the sub-area call it to say
			// sub-area is closing.
			if (this.props.actionObj.setExtIsSubAreaDisplayed) {
				this.props.actionObj.setExtIsSubAreaDisplayed(false);
				return;
			}
			this.setState({ subAreaDisplayed: false });
		}
	}

	actionClickHandler(evt, chevronClicked) {
		if (this.hasSubArea() &&
			(this.props.actionObj.purpose !== "dual" || chevronClicked)) {
			if (this.isSubAreaDisplayed()) {
				document.removeEventListener("click", this.clickOutside, false);
				this.closeSubArea();
				this.props.setToolbarFocusAction(this.props.actionObj.action);

			} else {
				document.addEventListener("click", this.clickOutside, false);
				this.props.closeAnyOpenSubArea();
				this.props.setToolbarFocusAction(this.props.actionObj.action);
				this.openSubArea();
			}

		} else {
			this.closeSubArea();
			this.props.toolbarActionHandler(this.props.actionObj.action, evt);
			this.props.setToolbarFocusAction(this.props.actionObj.action);
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
		let actionItemRect = this.divRef.current ? this.divRef.current.getBoundingClientRect() : null;
		actionItemRect = (actionItemRect && this.props.actionObj.purpose === "dual")
			? this.adjustForDual(actionItemRect)
			: actionItemRect;

		if (this.props.actionObj.subPanel) {
			return (
				<ToolbarSubPanel
					subPanel={this.props.actionObj.subPanel}
					subPanelData={this.props.actionObj.subPanelData}
					closeSubArea={this.closeSubArea}
					setToolbarFocusAction={this.props.setToolbarFocusAction}
					actionItemRect={actionItemRect}
					expandDirection={"vertical"}
					containingDivId={this.props.containingDivId}
				/>
			);
		}
		return (
			<ToolbarSubMenu
				subMenuActions={this.props.actionObj.subMenu}
				instanceId={this.props.instanceId}
				toolbarActionHandler={this.props.toolbarActionHandler}
				closeSubArea={this.closeSubArea}
				setToolbarFocusAction={this.props.setToolbarFocusAction}
				actionItemRect={actionItemRect}
				expandDirection={"vertical"}
				containingDivId={this.props.containingDivId}
				parentSelector={this.generateSelector(this.props.actionObj)}
				isCascadeMenu={false}
				size={this.props.size}
			/>
		);
	}

	// For a dual-purpose toolbar button, adjusts the rectangle dimensions so
	// the sub-panel is opened based on the location of the right chevron of
	// the dual button.
	adjustForDual(actionItemRect) {
		return {
			height: actionItemRect.height,
			width: actionItemRect.width,
			top: actionItemRect.top,
			bottom: actionItemRect.bottom,
			left: actionItemRect.left + TOOLBAR_ICON_WIDTH,
			right: actionItemRect.right + TOOLBAR_ICON_WIDTH,
			x: actionItemRect.x + TOOLBAR_ICON_WIDTH,
			y: actionItemRect.y
		};
	}

	generateSelector(actionObj) {
		if (actionObj.jsx) {
			return ".toolbar-jsx-item";
		}
		return ".toolbar-item";
	}

	render() {
		const actionObj = this.props.actionObj;
		const actionName = this.generateActionName();
		const kindAsClass = actionObj.kind ? actionObj.kind : "default";

		const itemClassName = classNames(
			{
				"toolbar-item": !actionObj.jsx,
				"toolbar-jsx-item": actionObj.jsx,
				"toolbar-item-selected": actionObj.isSelected
			},
			kindAsClass,
			actionName,
			this.props.actionObj.className);

		const subArea = this.isSubAreaDisplayed() ? this.generateSubArea() : null;

		return (
			<div ref={this.divRef} className={itemClassName} data-toolbar-action={actionObj.action} data-toolbar-item
				onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onKeyDown={this.onKeyDown}
			>
				<div className="toolbar-button-item">
					<ToolbarButtonItem
						actionObj={actionObj}
						actionName={this.generateActionName()}
						tooltipDirection={this.props.tooltipDirection}
						instanceId={this.props.instanceId}
						isInMenu={false}
						subAreaDisplayed={this.isSubAreaDisplayed()}
						actionClickHandler={this.actionClickHandler}
						buttonFocusAction={this.isSubAreaDisplayed() ? null : this.props.toolbarFocusAction}
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
		purpose: PropTypes.oneOf(["single", "dual"]),
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
		setExtIsSubAreaDisplayed: PropTypes.func,
		extIsSubAreaDisplayed: PropTypes.bool,
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
	tooltipDirection: PropTypes.oneOf(["top", "bottom"]),
	toolbarActionHandler: PropTypes.func.isRequired,
	instanceId: PropTypes.number.isRequired,
	containingDivId: PropTypes.string,
	closeParentSubArea: PropTypes.func,
	toolbarFocusAction: PropTypes.string,
	setToolbarFocusAction: PropTypes.func,
	isFocusInToolbar: PropTypes.bool,
	closeAnyOpenSubArea: PropTypes.func,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarActionItem;
