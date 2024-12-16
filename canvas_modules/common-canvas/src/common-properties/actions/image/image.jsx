/*
 * Copyright 2017-2025 Elyra Authors
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
import { STATES } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import classNames from "classnames";

class ImageAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
	}

	applyAction() {
		if (this.props.state !== STATES.DISABLED) { // this is needed to mimic disabled action button
			// fire event and let the application determine how to handle the action
			const actionHandler = this.props.controller.getHandlers().actionHandler;
			if (typeof actionHandler === "function") {
				actionHandler(this.props.action.name,
					this.props.controller.getAppData(), this.props.action.data);
			}
		}
	}

	render() {
		let height = {};
		let width = {};
		if (this.props.action.image.size) {
			height = this.props.action.image.size.height ? { "height": this.props.action.image.size.height } : {};
			width = this.props.action.image.size.width ? { "width": this.props.action.image.size.width } : {};
		}

		const disabled = this.props.state === STATES.DISABLED;
		const customClassName = this.props.action.className ? this.props.action.className : "";
		const className = classNames("properties-action-image", { "left": this.props.action.image.placement === "left" },
			{ "right": this.props.action.image.placement === "right" }, { "hide": this.props.state === STATES.HIDDEN },
			{ "disabled": disabled }, customClassName);

		const image = (
			<div data-id={this.props.action.name}>
				<img
					src={this.props.action.image.url}
					onClick={this.applyAction}
					{...height}
					{...width}
				/>
			</div>
		);

		let display = image;
		if (this.props.action.description) {
			const tooltipId = "tooltip-action-" + this.props.action.name;
			const tooltip = (
				<div className="properties-tooltips">
					{this.props.action.description.text}
				</div>
			);
			const directions = ["left", "right", "top", "bottom"];
			const tooltipDirection = this.props.action.image.tooltip_direction && directions.includes(this.props.action.image.tooltip_direction.toLowerCase())
				? this.props.action.image.tooltip_direction.toLowerCase()
				: "bottom";

			display = (<Tooltip
				id={tooltipId}
				tip={tooltip}
				direction={tooltipDirection}
				className="properties-tooltips"
				disable={disabled}
			>
				{image}
			</Tooltip>);
		}

		return (
			<div className={className}>
				{display}
			</div>
		);
	}
}

ImageAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getActionState(ownProps.controller.convertPropertyId(ownProps.action.name)),
});

export default connect(mapStateToProps, null)(ImageAction);
