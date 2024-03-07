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

import Tooltip from "../tooltip/tooltip.jsx";
import ArrangeHorizontally from "./../../assets/images/arrange_horizontally.svg";
import ArrangeVertically from "./../../assets/images/arrange_vertically.svg";
import ToggleNotificationPanel from "./../../assets/images/notification_counter_icon.svg";

import { Button } from "carbon-components-react";
import SVG from "react-inlinesvg";
import classNames from "classnames";
import { StopFilledAlt16, Play16, Undo16, Redo16, Chat16, ChatOff16, Result16,
	Cut16, Copy16, Paste16, Edit16,	ColorPalette16, Maximize16, Minimize16,
	Launch16, AddComment16, TrashCan16, ZoomIn16, ZoomOut16,
	ChevronRight16, ChevronDown16, ChevronUp16,
	CenterToFit16, OpenPanelFilledLeft16 } from "@carbon/icons-react";
import { TOOLBAR_STOP, TOOLBAR_RUN, TOOLBAR_UNDO, TOOLBAR_REDO,
	TOOLBAR_CUT, TOOLBAR_COPY, TOOLBAR_PASTE, TOOLBAR_CLIPBOARD,
	TOOLBAR_CREATE_COMMENT, TOOLBAR_CREATE_AUTO_COMMENT, TOOLBAR_COLOR_BACKGROUND,
	TOOLBAR_DELETE_SELECTED_OBJECTS, TOOLBAR_DELETE_LINK,
	TOOLBAR_ZOOM_IN, TOOLBAR_ZOOM_OUT, TOOLBAR_ZOOM_FIT,
	TOOLBAR_ARRANGE_HORIZONALLY, TOOLBAR_ARRANGE_VERTICALLY,
	TOOLBAR_OPEN_PALETTE, TOOLBAR_CLOSE_PALETTE, TOOLBAR_TOGGLE_PALETTE, TOOLBAR_TOGGLE_NOTIFICATION_PANEL,
	TOOLBAR_SHOW_COMMENTS, TOOLBAR_HIDE_COMMENTS,
	TOOLBAR_EXPAND_SUPERNODE_IN_PLACE, TOOLBAR_COLLAPSE_SUPERNODE_IN_PLACE,
	TOOLBAR_EXPAND_SUPERNODE_FULL_PAGE, TOOLBAR_SET_NODE_LABEL_EDIT, TOOLBAR_SET_COMMENT_EDIT_MODE }
	from "../common-canvas/constants/canvas-constants.js";

class ToolbarButtonItem extends React.Component {
	constructor(props) {
		super(props);

		this.buttonRef = React.createRef();
	}

	componentDidUpdate() {
		if (this.props.isFocusInToolbar &&
				this.props.buttonFocusAction === this.props.actionObj.action) {
			// If a Jsx object was provided, the class of the component should have
			// been set to toolbar-jsx-obj.
			const jsxItem = this.buttonRef.current.querySelector(".toolbar-jsx-obj");
			if (jsxItem) {
				jsxItem.focus();
				return;
			}

			this.buttonRef.current.focus();
		}
	}

	// Returns a default icon, if there is one, for the action passed in.
	// It also may be set to disabled state.
	getDefaultIcon(actionObj) {
		const disabled = !actionObj.enable;

		switch (actionObj.action) {
		case (TOOLBAR_STOP):
			return <StopFilledAlt16 disabled={disabled} />;
		case (TOOLBAR_RUN):
			return <Play16 disabled={disabled} />;
		case (TOOLBAR_EXPAND_SUPERNODE_IN_PLACE):
			return <Maximize16 disabled={disabled} />;
		case (TOOLBAR_COLLAPSE_SUPERNODE_IN_PLACE):
			return <Minimize16 disabled={disabled} />;
		case (TOOLBAR_EXPAND_SUPERNODE_FULL_PAGE):
			return <Launch16 disabled={disabled} />;
		case (TOOLBAR_UNDO):
			return <Undo16 disabled={disabled} />;
		case (TOOLBAR_REDO):
			return <Redo16 disabled={disabled} />;
		case (TOOLBAR_CLIPBOARD):
			return <Result16 disabled={disabled} />;
		case (TOOLBAR_CUT):
			return <Cut16 disabled={disabled} />;
		case (TOOLBAR_COPY):
			return <Copy16 disabled={disabled} />;
		case (TOOLBAR_PASTE):
			return <Paste16 disabled={disabled} />;
		case (TOOLBAR_CREATE_COMMENT):
		case (TOOLBAR_CREATE_AUTO_COMMENT):
			return <AddComment16 disabled={disabled} />;
		case (TOOLBAR_SHOW_COMMENTS):
			return <Chat16 disabled={disabled} />;
		case (TOOLBAR_HIDE_COMMENTS):
			return <ChatOff16 disabled={disabled} />;
		case (TOOLBAR_COLOR_BACKGROUND):
			return <ColorPalette16 disabled={disabled} />;
		case (TOOLBAR_DELETE_LINK):
		case (TOOLBAR_DELETE_SELECTED_OBJECTS):
			return <TrashCan16 disabled={disabled} />;
		case (TOOLBAR_SET_COMMENT_EDIT_MODE):
		case (TOOLBAR_SET_NODE_LABEL_EDIT):
			return <Edit16 disabled={disabled} />;
		case (TOOLBAR_ZOOM_IN):
			return <ZoomIn16 disabled={disabled} />;
		case (TOOLBAR_ZOOM_OUT):
			return <ZoomOut16 disabled={disabled} />;
		case (TOOLBAR_ZOOM_FIT):
			return <CenterToFit16 disabled={disabled} />;
		case (TOOLBAR_OPEN_PALETTE):
			return <OpenPanelFilledLeft16 disabled={disabled} />;
		case (TOOLBAR_CLOSE_PALETTE):
			return <OpenPanelFilledLeft16 disabled={disabled} />;
		case (TOOLBAR_TOGGLE_PALETTE):
			return <OpenPanelFilledLeft16 disabled={disabled} />;

		// Non-carbon icons
		case (TOOLBAR_ARRANGE_HORIZONALLY):
			return <SVG src={ArrangeHorizontally} disabled={disabled} />;
		case (TOOLBAR_ARRANGE_VERTICALLY):
			return <SVG src={ArrangeVertically} disabled={disabled} />;
		case (TOOLBAR_TOGGLE_NOTIFICATION_PANEL):
			return <SVG src={ToggleNotificationPanel} disabled={disabled} />;

		default:
			return null;
		}
	}

	generateLabel(label, disable, isInMenu, incLabelWithIcon) {
		let className = "toolbar-icon-label";
		className += this.generateLabelType(isInMenu, incLabelWithIcon);
		className += disable ? " disabled" : "";
		return (<div className={className}>{label}</div>);
	}

	generateLabelType(isInMenu, inLabelWithIcon) {
		if (isInMenu) {
			return " overflow";
		} else if (inLabelWithIcon === "before") {
			return " before";
		} else if (inLabelWithIcon === "after") {
			return " after";
		}
		return "";
	}

	generateIcon(actionObj) {
		let icon = this.getDefaultIcon(actionObj);

		// Host application provided icon. This will override any default icon.
		if (actionObj.iconEnabled) {
			const iconEnabled = actionObj.iconEnabled;
			const iconDisabled = actionObj.iconDisabled || actionObj.iconEnabled;
			const customIcon = actionObj.enable ? iconEnabled : iconDisabled;
			const id = "toolbar-icon-" + this.props.instanceId + " -" + actionObj.action;

			if (typeof customIcon === "string") {
				icon = (<SVG id={id} src={customIcon} disabled={!actionObj.enable} />);
			} else {
				icon = customIcon;
			}
		}

		if (icon) {
			return (
				<div className={"toolbar-icon"}>
					{icon}
				</div>
			);
		}
		return null;
	}

	generateRegularItem(actionObj) {
		let labelBefore = null;
		let labelAfter = null;

		if (this.props.isInMenu) {
			labelAfter = this.generateLabel(actionObj.label, !actionObj.enable, true);

		} else if (actionObj.incLabelWithIcon === "before") {
			labelBefore = this.generateLabel(actionObj.label, !actionObj.enable, false, actionObj.incLabelWithIcon);

		} else if (actionObj.incLabelWithIcon === "after") {
			labelAfter = this.generateLabel(actionObj.label, !actionObj.enable, false, actionObj.incLabelWithIcon);
		}

		const icon = this.generateIcon(actionObj);
		const textContent = actionObj.textContent ? (<div className="toolbar-text-content"> {actionObj.textContent} </div>) : null;

		const itemContentClassName = classNames(
			"toolbar-item-content",
			actionObj.className ? actionObj.className : null,
			{ "overflow": this.props.isInMenu, "disabled": !actionObj.enable, "default": !actionObj.kind });

		// If no 'kind' is set, use ghost and then override colors using the "default" class in innerDivClassName.
		const kind = actionObj.kind || "ghost";

		const chevronIcon = this.generateChevronIcon(actionObj);

		let buttonContent = (
			<div className={itemContentClassName}>
				{labelBefore}
				{icon}
				{labelAfter}
				{textContent}
				{chevronIcon}
			</div>
		);

		buttonContent = this.wrapInTooltip(buttonContent);

		// Only specify an aria label for the button if a label is not displayed
		// with the button icon.
		const ariaLabel = actionObj.incLabelWithIcon ? null : actionObj.label;
		const tabIndex = this.props.buttonFocusAction === actionObj.action ? 0 : -1;

		const button = (
			<Button kind={kind}
				ref={this.buttonRef}
				onClick={this.props.actionClickHandler}
				disabled={!actionObj.enable}
				aria-label={ariaLabel}
				size={this.props.size}
				tabIndex={tabIndex}
			>
				{buttonContent}
			</Button>
		);

		return button;
	}

	// Returns a chevron icon if the action icon is displaying a sub-menu or
	// sub-panel. The chevron will:
	//  * point right if this action item is in a drop down menu
	//  * point down if this action item is displayed with text in the toolbar
	//    and the menu isn't displayed
	//  * point up if this action item is displayed with text in the toolbar
	//    and the menu is displayed
	//  * be a mini-chevron (small triangle in the bottom right of icon) if this
	//    action item isn't displayed with text.
	generateChevronIcon(actionObj) {
		if (actionObj.subMenu || actionObj.subPanel) {
			if (this.props.isInMenu) {
				return (<ChevronRight16 />);
			}
			if (actionObj.incLabelWithIcon === "before" ||
					actionObj.incLabelWithIcon === "after") {
				const chev = this.props.subAreaDisplayed ? (<ChevronUp16 />) : (<ChevronDown16 />);
				return (<div className={"toolbar-up-down-chevron"}>{chev}</div>);
			}
			return this.generateChevronMini();
		}
		return null;
	}

	// Returns an svg to display the little triangle that appears in the bottom
	// right corner of icons that, when clicked, show a drop down menu.
	generateChevronMini() {
		const path = this.props.size === "sm" ? "M 29 29 L 29 23 23 29 Z" : "M 37 37 L 37 30 30 37 Z";
		return (
			<svg className="toolbar-tick-svg">
				<path d={path} className="toolbar-tick-mark" />
			</svg>
		);
	}

	// Creates a <div> containing the JSX in the actionObj.jsx field, wrapped in a tooltip
	// <div>, for display as an action item in the toolbar. The jsx field can be just
	// regular JSX OR a function that returns JSX. If the application has provided a
	// function we call it, passing in the tabIndex that the component in the JSX should
	// use, based on whether it is focused or not.
	generateJsxItem(actionObj) {
		let content = null;
		if (typeof actionObj.jsx === "function") {
			const tabIndex = this.props.buttonFocusAction === actionObj.action ? 0 : -1;
			content = actionObj.jsx(tabIndex);
		} else {
			content = actionObj.jsx;
		}
		const jsx = this.wrapInTooltip(content);
		const div = (<div ref={this.buttonRef}>{jsx}</div>);

		return div;
	}


	wrapInTooltip(content) {
		if (!this.props.isInMenu && (this.showLabelAsTip(this.props.actionObj) || this.props.actionObj.tooltip)) {
			const tip = this.props.actionObj.tooltip ? this.props.actionObj.tooltip : this.props.actionObj.label;
			const tooltipId = this.props.actionName + "-" + this.props.instanceId + "-tooltip";
			const enableTooltip = this.props.actionObj.enable || this.props.actionObj.jsx; // JSX 'tools' don't have enable attr so always display a tooltip for them.
			const direction = this.props.tooltipDirection ? this.props.tooltipDirection : "bottom";

			return (
				<Tooltip id={tooltipId} tip={tip} disable={!enableTooltip} className="icon-tooltip" direction={direction}>
					{content}
				</Tooltip>
			);
		}
		return content;
	}

	// Returns true if the label should be shown as a tooltip or false if not.
	// We do not show the label as a tooltip if it is already shown in the
	// toolbar next to the icon (i.e. incLabelWithIcon is set to something).
	showLabelAsTip(actionObj) {
		if (actionObj.label) {
			if (actionObj.incLabelWithIcon === "before" ||
					actionObj.incLabelWithIcon === "after") {
				return false;
			}
			return true;
		}
		return false;
	}

	render() {
		const actionObj = this.props.actionObj;

		const divContent = actionObj.jsx
			? this.generateJsxItem(actionObj)
			: this.generateRegularItem(actionObj);

		return divContent;
	}
}

ToolbarButtonItem.propTypes = {
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
	actionName: PropTypes.string.isRequired,
	tooltipDirection: PropTypes.oneOf(["top", "bottom"]),
	instanceId: PropTypes.number.isRequired,
	isInMenu: PropTypes.bool,
	subAreaDisplayed: PropTypes.bool,
	actionClickHandler: PropTypes.func,
	buttonFocusAction: PropTypes.string,
	isFocusInToolbar: PropTypes.bool,
	size: PropTypes.oneOf(["md", "sm"])
};

export default ToolbarButtonItem;
