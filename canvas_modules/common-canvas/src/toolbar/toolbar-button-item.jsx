/*
 * Copyright 2017-2026 Elyra Authors
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
import ToggleNotificationPanel from "./../../assets/images/notification_counter_icon.svg";

import { Button } from "@carbon/react";
import SVG from "react-inlinesvg";
import classNames from "classnames";
// Carbon icons - direct imports for tree-shaking optimization
import StopFilledAlt from "@carbon/icons-react/lib/StopFilledAlt";
import Play from "@carbon/icons-react/lib/Play";
import Undo from "@carbon/icons-react/lib/Undo";
import Redo from "@carbon/icons-react/lib/Redo";
import Chat from "@carbon/icons-react/lib/Chat";
import ChatOff from "@carbon/icons-react/lib/ChatOff";
import Result from "@carbon/icons-react/lib/Result";
import Cut from "@carbon/icons-react/lib/Cut";
import Copy from "@carbon/icons-react/lib/Copy";
import Paste from "@carbon/icons-react/lib/Paste";
import Edit from "@carbon/icons-react/lib/Edit";
import ColorPalette from "@carbon/icons-react/lib/ColorPalette";
import Maximize from "@carbon/icons-react/lib/Maximize";
import Minimize from "@carbon/icons-react/lib/Minimize";
import Launch from "@carbon/icons-react/lib/Launch";
import AddComment from "@carbon/icons-react/lib/AddComment";
import TrashCan from "@carbon/icons-react/lib/TrashCan";
import ZoomIn from "@carbon/icons-react/lib/ZoomIn";
import ZoomOut from "@carbon/icons-react/lib/ZoomOut";
import Checkmark from "@carbon/icons-react/lib/Checkmark";
import ChevronRight from "@carbon/icons-react/lib/ChevronRight";
import ChevronDown from "@carbon/icons-react/lib/ChevronDown";
import ChevronUp from "@carbon/icons-react/lib/ChevronUp";
import CenterToFit from "@carbon/icons-react/lib/CenterToFit";
import OpenPanelFilledLeft from "@carbon/icons-react/lib/OpenPanelFilledLeft";
import ConnectSource from "@carbon/icons-react/lib/ConnectSource";
import ConnectTarget from "@carbon/icons-react/lib/ConnectTarget";
import ArrangeVertical from "@carbon/icons-react/lib/ArrangeVertical";
import ArrangeHorizontal from "@carbon/icons-react/lib/ArrangeHorizontal";
import { ACTION_STOP, ACTION_RUN, ACTION_UNDO, ACTION_REDO,
	ACTION_CUT, ACTION_COPY, ACTION_PASTE, ACTION_CLIPBOARD,
	ACTION_CREATE_COMMENT, ACTION_CREATE_AUTO_COMMENT,
	ACTION_CREATE_WYSIWYG_COMMENT, ACTION_CREATE_AUTO_WYSIWYG_COMMENT,
	ACTION_COLOR_BACKGROUND,
	ACTION_DELETE_SELECTED_OBJECTS, ACTION_DELETE_LINK,
	ACTION_ZOOM_IN, ACTION_ZOOM_OUT, ACTION_ZOOM_FIT,
	ACTION_ARRANGE_HORIZONTALLY, ACTION_ARRANGE_VERTICALLY,
	ACTION_OPEN_PALETTE, ACTION_CLOSE_PALETTE, ACTION_TOGGLE_PALETTE,
	ACTION_TOGGLE_NOTIFICATION_PANEL, ACTION_CONNECT_FROM_PORT, ACTION_CONNECT_TO_PORT,
	ACTION_SHOW_COMMENTS, ACTION_HIDE_COMMENTS,
	ACTION_EXPAND_SUPERNODE_IN_PLACE, ACTION_COLLAPSE_SUPERNODE_IN_PLACE,
	ACTION_EXPAND_SUPERNODE_FULL_PAGE, ACTION_SET_NODE_LABEL_EDIT, ACTION_SET_COMMENT_EDIT_MODE }
	from "../common-canvas/constants/canvas-constants.js";

class ToolbarButtonItem extends React.Component {
	constructor(props) {
		super(props);

		this.buttonRef = React.createRef();
		this.tooltipRef = React.createRef();

		this.onButtonFocus = this.onButtonFocus.bind(this);
		this.onButtonBlur = this.onButtonBlur.bind(this);
	}

	componentDidUpdate(prevProps) {
		// Handle cascaded menu closing separately from regular focus changes
		if (this.handleCascadeMenuClosing(prevProps)) {
			return;
		}

		// Handle regular focus changes
		this.handleRegularFocusChanges(prevProps);
	}

	onButtonFocus(evt) {
		// Show tooltip when button receives focus (including via Tab key)
		this.showTooltip();
	}

	onButtonBlur(evt) {
		// Hide tooltip when button loses focus (including via Tab key)
		this.hideTooltip();
	}

	// Returns a default icon, if there is one, for the action passed in.
	// It also may be set to disabled state.
	getDefaultIcon(actionObj) {
		const disabled = !actionObj.enable;

		switch (actionObj.action) {
		case (ACTION_STOP):
			return <StopFilledAlt disabled={disabled} />;
		case (ACTION_RUN):
			return <Play disabled={disabled} />;
		case (ACTION_EXPAND_SUPERNODE_IN_PLACE):
			return <Maximize disabled={disabled} />;
		case (ACTION_COLLAPSE_SUPERNODE_IN_PLACE):
			return <Minimize disabled={disabled} />;
		case (ACTION_EXPAND_SUPERNODE_FULL_PAGE):
			return <Launch disabled={disabled} />;
		case (ACTION_UNDO):
			return <Undo disabled={disabled} />;
		case (ACTION_REDO):
			return <Redo disabled={disabled} />;
		case (ACTION_CLIPBOARD):
			return <Result disabled={disabled} />;
		case (ACTION_CUT):
			return <Cut disabled={disabled} />;
		case (ACTION_COPY):
			return <Copy disabled={disabled} />;
		case (ACTION_PASTE):
			return <Paste disabled={disabled} />;
		case (ACTION_CONNECT_FROM_PORT):
			return <ConnectSource disabled={disabled} />;
		case (ACTION_CONNECT_TO_PORT):
			return <ConnectTarget disabled={disabled} />;
		case (ACTION_CREATE_COMMENT):
		case (ACTION_CREATE_AUTO_COMMENT):
		case (ACTION_CREATE_WYSIWYG_COMMENT):
		case (ACTION_CREATE_AUTO_WYSIWYG_COMMENT):
			return <AddComment disabled={disabled} />;
		case (ACTION_SHOW_COMMENTS):
			return <Chat disabled={disabled} />;
		case (ACTION_HIDE_COMMENTS):
			return <ChatOff disabled={disabled} />;
		case (ACTION_COLOR_BACKGROUND):
			return <ColorPalette disabled={disabled} />;
		case (ACTION_DELETE_LINK):
		case (ACTION_DELETE_SELECTED_OBJECTS):
			return <TrashCan disabled={disabled} />;
		case (ACTION_SET_COMMENT_EDIT_MODE):
		case (ACTION_SET_NODE_LABEL_EDIT):
			return <Edit disabled={disabled} />;
		case (ACTION_ZOOM_IN):
			return <ZoomIn disabled={disabled} />;
		case (ACTION_ZOOM_OUT):
			return <ZoomOut disabled={disabled} />;
		case (ACTION_ZOOM_FIT):
			return <CenterToFit disabled={disabled} />;
		case (ACTION_OPEN_PALETTE):
			return <OpenPanelFilledLeft disabled={disabled} />;
		case (ACTION_CLOSE_PALETTE):
			return <OpenPanelFilledLeft disabled={disabled} />;
		case (ACTION_TOGGLE_PALETTE):
			return <OpenPanelFilledLeft disabled={disabled} />;
		case (ACTION_ARRANGE_HORIZONTALLY):
			return <ArrangeHorizontal disabled={disabled} />;
		case (ACTION_ARRANGE_VERTICALLY):
			return <ArrangeVertical disabled={disabled} />;
		case (ACTION_TOGGLE_NOTIFICATION_PANEL):
			return <SVG src={ToggleNotificationPanel} disabled={disabled} />;

		default:
			return null;
		}
	}

	// Sets focus on the button or JSX item. For JSX items, if the item itself
	// cannot receive focus (e.g., wrapper has tabIndex={-1}), searches for and
	// focuses the first focusable child element within the wrapper.
	setButtonFocus() {
		const jsxItem = this.buttonRef.current.querySelector(".toolbar-jsx-obj");
		if (jsxItem) {
			jsxItem.focus();
			if (document.activeElement !== jsxItem) {
				const focusableElement = this.buttonRef.current.querySelector(
					"button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
				);
				if (focusableElement) {
					focusableElement.focus();
				}
			}
		} else {
			this.buttonRef.current.focus();
		}
	}

	// Handles focus restoration when a cascaded menu closes. If a cascaded menu
	// just closed while this button still has focus, restores focus to the button
	// and ensures the tooltip remains visible.
	handleCascadeMenuClosing(prevProps) {
		const isThisButtonFocused = this.props.buttonFocusAction === this.props.actionObj.action;
		const cascadeMenuJustClosed = prevProps.subAreaDisplayed && !this.props.subAreaDisplayed && isThisButtonFocused;

		if (cascadeMenuJustClosed) {
			this.setButtonFocus();
			this.showTooltip();
			return true;
		}
		return false;
	}

	// Handles regular focus changes for toolbar buttons. Sets focus on the button
	// when it becomes the focused item during keyboard navigation, and hides the
	// tooltip when focus moves away.
	handleRegularFocusChanges(prevProps) {
		const isThisButtonFocused = this.props.buttonFocusAction === this.props.actionObj.action;
		const wasThisButtonFocused = prevProps.buttonFocusAction === this.props.actionObj.action;

		const hasFocus = this.props.isFocusInToolbar && isThisButtonFocused;
		const hadFocus = prevProps.isFocusInToolbar && wasThisButtonFocused;

		if ((hasFocus && !hadFocus) ||
			(isThisButtonFocused && !wasThisButtonFocused && this.props.isFocusInToolbar)) {
			this.setButtonFocus();

		} else if (hadFocus && !hasFocus) {
			// Button is losing focus
			this.hideTooltip();
		}

		// Hide tooltip if this button is no longer the focused button (even if it still has DOM focus)
		if (wasThisButtonFocused && !isThisButtonFocused) {
			this.hideTooltip();
		}
	}

	showTooltip() {
		this.tooltipRef.current?.setTooltipVisible?.(true);
	}

	hideTooltip() {
		this.tooltipRef.current?.setTooltipVisible?.(false);
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
		} else if (inLabelWithIcon === "label-only") {
			return " label-only";
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
			const ariaLabel = actionObj.incLabelWithIcon ? null : actionObj.label;
			const id = "toolbar-icon-" + this.props.instanceId + " -" + actionObj.action;

			if (typeof customIcon === "string") {
				icon = (<SVG id={id} src={customIcon} disabled={!actionObj.enable} aria-label={ariaLabel} />);
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
		let labelOnly = null;

		if (this.props.isInMenu) {
			labelAfter = this.generateLabel(actionObj.label, !actionObj.enable, true);

		} else if (actionObj.incLabelWithIcon === "before") {
			labelBefore = this.generateLabel(actionObj.label, !actionObj.enable, false, actionObj.incLabelWithIcon);

		} else if (actionObj.incLabelWithIcon === "after") {
			labelAfter = this.generateLabel(actionObj.label, !actionObj.enable, false, actionObj.incLabelWithIcon);

		} else if (actionObj.incLabelWithIcon === "label-only") {
			labelOnly = this.generateLabel(actionObj.label, !actionObj.enable, false, actionObj.incLabelWithIcon);
		}

		const icon = actionObj.incLabelWithIcon === "label-only" ? null : this.generateIcon(actionObj);
		const textContent = actionObj.textContent ? (<div className="toolbar-text-content"> {actionObj.textContent} </div>) : null;

		const itemContentClassName = classNames(
			"toolbar-item-content",
			{ "is-in-menu": this.props.isInMenu, "disabled": !actionObj.enable, "default": !actionObj.kind });

		// If no 'kind' is set, use ghost and then override colors using the "default" class in innerDivClassName.
		const kind = actionObj.kind || "ghost";

		const chevronDiv = this.generateChevronDiv(actionObj);

		let mainClassName = actionObj.purpose ? "content-main dual" : "content-main";
		mainClassName += labelBefore || labelAfter || labelOnly ? " with-label" : "";

		const checkMark = this.props.actionObj.isSelected && this.props.isInMenu ? (<div className={"checkmark"}> <Checkmark /></div>) : null;

		let buttonContent = (
			<div className={itemContentClassName}>
				<div className={mainClassName}>
					{labelBefore}
					{icon}
					{labelAfter}
					{labelOnly}
					{textContent}
				</div>
				{chevronDiv}
				{checkMark}
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
				onFocus={this.onButtonFocus}
				onBlur={this.onButtonBlur}
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

	// Returns a <div> containing a chevron icon. If the action icon is displaying
	// a sub-menu or sub-panel. The chevron will:
	//  * point right if this action item is in a drop down menu.
	//  * point down and be regular size if this action item is displayed with
	//    text in the toolbar and the menu isn't displayed.
	//  * point up and be regular size if this action item is displayed with
	//    text in the toolbar and the menu is displayed.
	//  * point down and be a mini-chevron if this action item is displayed without
	//    text in the toolbar and the menu isn't displayed.
	//  * point up and be a mini-chevron if this action item is displayed without
	//    text in the toolbar and the menu is displayed.
	generateChevronDiv(actionObj) {
		if (actionObj.subMenu || actionObj.subPanel) {
			if (this.props.isInMenu) {
				return <div className={"toolbar-right-chevron"}><ChevronRight /></div>;
			}
			if (actionObj.incLabelWithIcon === "before" ||
					actionObj.incLabelWithIcon === "after" ||
					actionObj.incLabelWithIcon === "label-only") {
				const chevron = this.props.subAreaDisplayed ? (<ChevronUp />) : (<ChevronDown />);
				return (<div className={"toolbar-up-down-chevron"}>{chevron}</div>);
			}
			if (actionObj.purpose === "dual") {
				const chevronMini = this.props.subAreaDisplayed ? (<ChevronUp size={12} />) : (<ChevronDown size={12} />);
				return (<div className={"toolbar-up-down-chevron-mini"} onClick={this.miniChevronClicked.bind(this)}>{chevronMini}</div>);
			}
			return (
				<svg className="toolbar-tick-svg" viewBox="0 0 32 32" aria-hidden="true">
					<path d="M 30 30 L 30 24 24 30 Z" className="toolbar-tick-mark" />
				</svg>
			);
		}
		return null;
	}

	miniChevronClicked(evt) {
		this.props.actionClickHandler(evt, true);
		evt.stopPropagation();
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
		const div = (
			<div ref={this.buttonRef} onFocus={this.onButtonFocus} onBlur={this.onButtonBlur}>
				{jsx}
			</div>
		);

		return div;
	}


	wrapInTooltip(content) {
		if (!this.props.isInMenu && (this.showLabelAsTip(this.props.actionObj) || this.props.actionObj.tooltip)) {
			const tip = this.props.actionObj.tooltip ? this.props.actionObj.tooltip : this.props.actionObj.label;
			const tooltipId = this.props.actionName + "-" + this.props.instanceId + "-tooltip";
			const enableTooltip = this.props.actionObj.enable || this.props.actionObj.jsx; // JSX 'tools' don't have enable attr so always display a tooltip for them.
			const direction = this.props.tooltipDirection ? this.props.tooltipDirection : "bottom";

			return (
				<Tooltip ref={this.tooltipRef} id={tooltipId} tip={tip} disable={!enableTooltip} className="icon-tooltip" direction={direction} hoverable>
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
					actionObj.incLabelWithIcon === "after" ||
					actionObj.incLabelWithIcon === "label-only") {
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
		incLabelWithIcon: PropTypes.oneOf(["no", "before", "after", "label-only"]),
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
	size: PropTypes.oneOf(["md", "sm", "lg"])
};

export default ToolbarButtonItem;

