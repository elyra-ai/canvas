/*
 * Copyright 2020 IBM Corporation
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
import Icon from "../icons/icon.jsx";
import { Button } from "carbon-components-react";
import SVG from "react-inlinesvg";
import classNames from "classnames";

class ToolbarActionItem extends React.Component {
	constructor(props) {
		super(props);

		this.actionClickHandler = this.actionClickHandler.bind(this);
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
		const iconType = actionObj.iconTypeOverride ? actionObj.iconTypeOverride : actionObj.action;
		let icon = <Icon type={iconType} disabled={!actionObj.enable} noAddedClasses />;

		// Host application provided icon.
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

		const customClassname = actionObj.className ? actionObj.className : "";
		const iconClassName = "toolbar-icon " + customClassname;
		return (
			<div className={iconClassName}>
				{icon}
			</div>
		);
	}

	actionClickHandler() {
		this.props.toolbarActionHandler(this.props.actionObj.action);
	}

	render() {
		const actionObj = this.props.actionObj;

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
		const actionName = actionObj.action + "-action";
		const tooltipId = actionName + this.props.instanceId + "-tooltip";

		const itemClassName = classNames(
			{ "toolbar-overflow-menu-item": this.props.overflow,
				"toolbar-item": !this.props.overflow },
			actionObj.kind ? actionObj.kind : "default",
			actionName);

		const itemContentClassName = classNames(
			"toolbar-item-content",
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

		if (!this.props.overflow) {
			buttonContent = (
				<Tooltip id={tooltipId} tip={actionObj.label} disable={false} >
					{buttonContent}
				</Tooltip>
			);
		}

		const isToolbarItem = !this.props.overflow;

		return (
			<div className={itemClassName} data-toolbar-item={isToolbarItem}>
				<Button kind={kind}
					onClick={this.actionClickHandler}
					disabled={!actionObj.enable}
					onFocus={this.props.onFocus}
					aria-label={actionObj.label}
				>
					{buttonContent}
				</Button>
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
		iconEnabled: PropTypes.object,
		iconDisabled: PropTypes.obect,
		className: PropTypes.string,
		textContent: PropTypes.string,
		iconTypeOverride: PropTypes.string,
		kind: PropTypes.string
	}),
	toolbarActionHandler: PropTypes.func.isRequired,
	instanceId: PropTypes.number.isRequired,
	overflow: PropTypes.bool,
	onFocus: PropTypes.func
};

export default ToolbarActionItem;
