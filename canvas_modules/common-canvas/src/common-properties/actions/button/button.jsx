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
import { connect } from "react-redux";
import { Button } from "@carbon/react";
import { STATES, CARBON_BUTTON_KIND, CARBON_BUTTON_SIZE } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import classNames from "classnames";
import { has } from "lodash";

class ButtonAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
	}

	getActionButtonKind() {
		if (!has(this.props, "action.button.kind")) {
			return CARBON_BUTTON_KIND.TERTIARY;
		}
		switch (this.props.action.button.kind) {
		case CARBON_BUTTON_KIND.PRIMARY: return CARBON_BUTTON_KIND.PRIMARY;
		case CARBON_BUTTON_KIND.SECONDARY: return CARBON_BUTTON_KIND.SECONDARY;
		case CARBON_BUTTON_KIND.TERTIARY: return CARBON_BUTTON_KIND.TERTIARY;
		case CARBON_BUTTON_KIND.GHOST: return CARBON_BUTTON_KIND.GHOST;
		case CARBON_BUTTON_KIND.DANGER: return CARBON_BUTTON_KIND.DANGER;
		case CARBON_BUTTON_KIND.DANGER_TERTIARY: return CARBON_BUTTON_KIND.DANGER_TERTIARY;
		case CARBON_BUTTON_KIND.DANGER_GHOST: return CARBON_BUTTON_KIND.DANGER_GHOST;
		default: return CARBON_BUTTON_KIND.TERTIARY;
		}
	}

	getActionButtonSize() {
		if (!has(this.props, "action.button.size")) {
			return CARBON_BUTTON_SIZE.SMALL;
		}
		switch (this.props.action.button.size) {
		case CARBON_BUTTON_SIZE.SMALL: return CARBON_BUTTON_SIZE.SMALL;
		case CARBON_BUTTON_SIZE.MEDIUM: return CARBON_BUTTON_SIZE.MEDIUM;
		case CARBON_BUTTON_SIZE.LARGE: return CARBON_BUTTON_SIZE.LARGE;
		case CARBON_BUTTON_SIZE.EXTRA_LARGE: return CARBON_BUTTON_SIZE.EXTRA_LARGE;
		default: return CARBON_BUTTON_SIZE.SMALL;
		}
	}

	applyAction() {
		// fire event and let the application determine how to handle the action
		const actionHandler = this.props.controller.getHandlers().actionHandler;
		if (typeof actionHandler === "function") {
			actionHandler(this.props.action.name,
				this.props.controller.getAppData(), this.props.action.data);
		}
	}

	render() {
		const customClassName = this.props.action.className ? this.props.action.className : "";
		const className = classNames("properties-action-button", { "hide": this.props.state === STATES.HIDDEN }, customClassName);
		const disabled = this.props.state === STATES.DISABLED;
		const actionButtonKind = this.getActionButtonKind();
		const actionButtonSize = this.getActionButtonSize();
		const button = (
			<Button
				type="button"
				size={actionButtonSize}
				kind={actionButtonKind}
				onClick={this.applyAction}
				disabled={disabled}
				title={this.props.action.label.text}
			>
				{this.props.action.label.text}
			</Button>
		);

		let display = button;
		if (this.props.action.description) {
			const tooltipId = "tooltip-action-" + this.props.action.name;
			const tooltip = (
				<div className="properties-tooltips">
					{this.props.action.description.text}
				</div>
			);

			display = (<Tooltip
				id={tooltipId}
				tip={tooltip}
				direction="bottom"
				className="properties-tooltips"
				disable={disabled}
			>
				{button}
			</Tooltip>);
		}

		return (
			<div className={className} data-id={this.props.action.name}>
				{display}
			</div>
		);
	}
}

ButtonAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getActionState(ownProps.controller.convertPropertyId(ownProps.action.name)),
});

export default connect(mapStateToProps, null)(ButtonAction);
