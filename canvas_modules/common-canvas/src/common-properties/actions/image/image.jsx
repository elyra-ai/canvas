/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { STATES, TOOL_TIP_DELAY } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import classNames from "classnames";
import uuid4 from "uuid/v4";

class ImageAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
		this.uuid = uuid4();
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
		const className = classNames("properties-action-image", { "left": this.props.action.image.placement === "left" },
			{ "right": this.props.action.image.placement === "right" }, { "hide": this.props.state === STATES.HIDDEN },
			{ "disabled": disabled });

		const image = (
			<div className={className} data-id={this.props.action.name}>
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
			const tooltipId = this.uuid + "-tooltip-action-" + this.props.action.name;
			const tooltip = (
				<div className="properties-tooltips">
					{this.props.action.description.text}
				</div>
			);

			display = (<Tooltip
				id={tooltipId}
				tip={tooltip}
				direction="top"
				delay={TOOL_TIP_DELAY}
				className="properties-tooltips"
				disable={disabled}
			>
				{image}
			</Tooltip>);
		}

		return (
			display
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
