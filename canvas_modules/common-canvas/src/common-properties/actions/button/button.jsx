/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Button from "carbon-components-react/lib/components/Button";
import { STATES, TOOL_TIP_DELAY } from "./../../constants/constants.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import classNames from "classnames";
import uuid4 from "uuid/v4";

class ButtonAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
		this.uuid = uuid4();
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
		const className = classNames("properties-action-button", { "hide": this.props.state === STATES.HIDDEN });
		const disabled = this.props.state === STATES.DISABLED;
		const button = (
			<div className={className} data-id={this.props.action.name}>
				<Button
					type="button"
					size="small"
					kind="tertiary"
					onClick={this.applyAction}
					disabled={disabled}
				>
					{this.props.action.label.text}
				</Button>
			</div>
		);

		let display = button;
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
				{button}
			</Tooltip>);
		}

		return (
			display
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
