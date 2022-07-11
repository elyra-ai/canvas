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

import Tooltip from "../tooltip/tooltip.jsx";
import ArrangeHorizontally from "./../../assets/images/arrange_horizontally.svg";
import ArrangeVertically from "./../../assets/images/arrange_vertically.svg";
import ToggleNotificationPanel from "./../../assets/images/notification_counter_icon.svg";
import PaletteClose from "./../../assets/images/palette/palette_close.svg";
import PaletteOpen from "./../../assets/images/palette/palette_open.svg";
import ZoomToFit from "./../../assets/images/zoom_to_fit.svg";

import { Button } from "carbon-components-react";
import SVG from "react-inlinesvg";
import classNames from "classnames";
import { StopFilledAlt16, Play16, Undo16, Redo16, Cut16, Copy16, Paste16,
	AddComment16, TrashCan16, ZoomIn16, ZoomOut16 } from "@carbon/icons-react";
import { TOOLBAR_STOP, TOOLBAR_RUN, TOOLBAR_UNDO, TOOLBAR_REDO, TOOLBAR_CUT,
	TOOLBAR_COPY, TOOLBAR_PASTE, TOOLBAR_CREATE_AUTO_COMMENT,
	TOOLBAR_DELETE_SELECTED_OBJECTS, TOOLBAR_ZOOM_IN, TOOLBAR_ZOOM_OUT, TOOLBAR_ZOOM_FIT,
	TOOLBAR_ARRANGE_HORIZONALLY, TOOLBAR_ARRANGE_VERTICALLY, TOOLBAR_OPEN_PALETTE,
	TOOLBAR_CLOSE_PALETTE, TOOLBAR_TOGGLE_NOTIFICATION_PANEL }
	from "../common-canvas/constants/canvas-constants.js";

class ToolbarActionItem extends React.Component {
	constructor(props) {
		super(props);

		this.actionClickHandler = this.actionClickHandler.bind(this);
	}

	// Returns a default icon, if there is one, for the action passed in. The
	// icon may be overridden by the iconTypeOverride field if it is provided.
	// It also may be set to disabled state.
	getDefaultIcon(actionObj) {
		const iconType = actionObj.iconTypeOverride ? actionObj.iconTypeOverride : actionObj.action;
		const disabled = !actionObj.enable;

		switch (iconType) {
		case (TOOLBAR_STOP):
			return <StopFilledAlt16 disabled={disabled} />;
		case (TOOLBAR_RUN):
			return <Play16 disabled={disabled} />;
		case (TOOLBAR_UNDO):
			return <Undo16 disabled={disabled} />;
		case (TOOLBAR_REDO):
			return <Redo16 disabled={disabled} />;
		case (TOOLBAR_CUT):
			return <Cut16 disabled={disabled} />;
		case (TOOLBAR_COPY):
			return <Copy16 disabled={disabled} />;
		case (TOOLBAR_PASTE):
			return <Paste16 disabled={disabled} />;
		case (TOOLBAR_CREATE_AUTO_COMMENT):
			return <AddComment16 disabled={disabled} />;
		case (TOOLBAR_DELETE_SELECTED_OBJECTS):
			return <TrashCan16 disabled={disabled} />;
		case (TOOLBAR_ZOOM_IN):
			return <ZoomIn16 disabled={disabled} />;
		case (TOOLBAR_ZOOM_OUT):
			return <ZoomOut16 disabled={disabled} />;

		case (TOOLBAR_ZOOM_FIT):
			return <SVG src={ZoomToFit} disabled={disabled} />;
		case (TOOLBAR_ARRANGE_HORIZONALLY):
			return <SVG src={ArrangeHorizontally} disabled={disabled} />;
		case (TOOLBAR_ARRANGE_VERTICALLY):
			return <SVG src={ArrangeVertically} disabled={disabled} />;
		case (TOOLBAR_OPEN_PALETTE):
			return <SVG src={PaletteOpen} disabled={disabled} />;
		case (TOOLBAR_CLOSE_PALETTE):
			return <SVG src={PaletteClose} disabled={disabled} />;
		case (TOOLBAR_TOGGLE_NOTIFICATION_PANEL):
			return <SVG src={ToggleNotificationPanel} disabled={disabled} />;

		default:
			return null;
		}
	}

	generateLabel(label, disable, overflow, incLabelWithIcon) {
		let className = "toolbar-icon-label";
		className += this.generateLabelType(overflow, incLabelWithIcon);
		className += disable ? " disabled" : "";
		return (<div className={className}>{label}</div>);
	}

	generateLabelType(overflow, inLabelWithIcon) {
		if (overflow) {
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

	actionClickHandler(evt) {
		this.props.toolbarActionHandler(this.props.actionObj.action, evt);
	}

	generateButton(actionObj) {
		let labelBefore = null;
		let labelAfter = null;

		if (this.props.overflow) {
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
			{ "overflow": this.props.overflow, "disabled": !actionObj.enable, "default": !actionObj.kind });

		// If no 'kind' is set, use ghost and then override colors using the "default" class in innerDivClassName.
		const kind = actionObj.kind || "ghost";

		let buttonContent = (
			<div className={itemContentClassName}>
				{labelBefore}
				{icon}
				{labelAfter}
				{textContent}
			</div>
		);

		buttonContent = this.wrapInTooltip(buttonContent);

		buttonContent = (
			<Button kind={kind}
				onClick={this.actionClickHandler}
				disabled={!actionObj.enable}
				onFocus={this.props.onFocus}
				aria-label={actionObj.label}
			>
				{buttonContent}
			</Button>
		);

		return buttonContent;
	}

	generateActionName(actionObj) {
		return this.props.actionObj.action + "-action";
	}

	wrapInTooltip(content) {
		if (!this.props.overflow && (this.showLabelAsTip(this.props.actionObj) || this.props.actionObj.tooltip)) {
			const actionName = this.generateActionName();
			const tip = this.props.actionObj.tooltip ? this.props.actionObj.tooltip : this.props.actionObj.label;
			const tooltipId = actionName + "-" + this.props.instanceId + "-tooltip";
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
		const actionName = this.generateActionName();
		let divContent = null;

		if (actionObj.jsx) {
			divContent = this.wrapInTooltip(actionObj.jsx);
		} else {
			divContent = this.generateButton(actionObj);
		}

		const isToolbarItem = this.props.overflow ? null : true; // null wil make data-toolbar-item be removed
		const kindAsClass = actionObj.kind ? actionObj.kind : "default";

		const itemClassName = classNames(
			{ "toolbar-overflow-menu-item": this.props.overflow,
				"toolbar-item": !this.props.overflow && !actionObj.jsx,
				"toolbar-jsx-item": !this.props.overflow && actionObj.jsx,
				"toolbar-overflow-jsx-item": this.props.overflow && actionObj.jsx,
				"toolbar-item-selected": actionObj.isSelected },
			kindAsClass,
			actionName);

		return (
			<div className={itemClassName} data-toolbar-item={isToolbarItem}>
				{divContent}
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
		iconTypeOverride: PropTypes.string,
		isSelected: PropTypes.bool,
		kind: PropTypes.string,
		jsx: PropTypes.object,
		tooltip: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
			PropTypes.func
		])
	}),
	tooltipDirection: PropTypes.oneOf(["top", "bottom"]),
	toolbarActionHandler: PropTypes.func.isRequired,
	instanceId: PropTypes.number.isRequired,
	overflow: PropTypes.bool,
	onFocus: PropTypes.func
};

export default ToolbarActionItem;
