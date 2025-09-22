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
import { Button } from "@carbon/react";
import SVG from "react-inlinesvg";
import { STATES } from "../../constants/constants.js";
import classNames from "classnames";

class SVGAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
		this.renderIcon = this.renderIcon.bind(this);

		this.svgDimensions = this.props.action?.svg?.size
			? {
				height: `${this.props.action.svg.size.height}px`,
				width: `${this.props.action.svg.size.width}px`
			}
			: {};
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

	renderIcon() {
		const icon = (<SVG
			src={this.props.action.svg.url}
			aria-label={this.props.action.name}
			{...this.svgDimensions}
		/>);
		return icon;
	}

	render() {
		const disabled = this.props.state === STATES.DISABLED;
		const customClassName = this.props.action.className ? this.props.action.className : "";
		const className = classNames("properties-action-svg", { "left": this.props.action.svg.placement === "left" },
			{ "right": this.props.action.svg.placement === "right" }, { "hide": this.props.state === STATES.HIDDEN },
			{ "disabled": disabled }, customClassName);

		const svg = (
			<Button
				data-id={this.props.action.name}
				renderIcon={this.renderIcon}
				className="properties-action-svg-button"
				onClick={this.applyAction}
				kind="ghost"
				iconDescription={this.props.action?.description?.text} // Text to appear in Tooltip
				autoAlign
				style={this.svgDimensions}
				disabled={disabled}
				// Ensures the button is treated as icon-only when a description is present,
				// preventing an empty tooltip from appearing.
				hasIconOnly={Boolean(this.props.action.description?.text)}
			/>
		);


		return (
			<div className={className}>
				{svg}
			</div>
		);
	}
}

SVGAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getActionState(ownProps.controller.convertPropertyId(ownProps.action.name)),
});

export default connect(mapStateToProps, null)(SVGAction);
