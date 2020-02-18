/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import { STATES, TOOL_TIP_DELAY_ICON, CARBON_ICONS } from "./../../constants/constants.js";
import Button from "carbon-components-react/lib/components/Button";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import isEmpty from "lodash/isEmpty";
import uuid4 from "uuid/v4";
import Icon from "./../../../icons/icon.jsx";

import ActionFactory from "./../../actions/action-factory.js";

class ControlItem extends React.Component {
	constructor(props) {
		super(props);
		this.actionFactory = new ActionFactory(this.props.controller);
		this.uuid = uuid4();
	}

	render() {
		const hidden = this.props.state === STATES.HIDDEN;
		const disabled = this.props.state === STATES.DISABLED;
		const that = this;
		function generateNumber() {
			const generator = that.props.control.label.numberGenerator;
			const min = generator.range && generator.range.min ? generator.range.min : 10000;
			const max = generator.range && generator.range.max ? generator.range.max : 99999;
			const newValue = Math.floor(Math.random() * (max - min + 1) + min);
			that.props.controller.updatePropertyValue(that.props.propertyId, newValue);
		}

		let label;
		let description;
		if (this.props.control.label && this.props.control.labelVisible !== false) {
			let tooltip;
			if (this.props.control.description && !isEmpty(this.props.control.description.text)) {
				if (this.props.control.description.placement === "on_panel") {
					description = <div className="properties-control-description">{this.props.control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else {
					tooltip = (<Tooltip
						id={`${this.uuid}-tooltip-label-${this.props.control.name}`}
						tip={this.props.control.description.text}
						direction="top"
						delay={TOOL_TIP_DELAY_ICON}
						disable={hidden || disabled}
					>
						<Icon type={CARBON_ICONS.INFORMATION} className="properties-control-description-icon-info" />
					</Tooltip>);
				}
			}
			let requiredIndicator;
			if (this.props.control.required) {
				requiredIndicator = <span className="properties-required-indicator">*</span>;
			}
			let numberGenerator;
			if (this.props.control.label.numberGenerator) {
				numberGenerator = (<Button
					className={classNames("properties-number-generator", { "hide": hidden })}
					onClick={generateNumber}
					disabled={disabled}
					kind="ghost"
				>
					<span>{this.props.control.label.numberGenerator.label.default}</span>
				</Button>);
			}
			label = (
				<div className="properties-label-container">
					<label className="properties-control-label">{this.props.control.label.text}</label>
					{requiredIndicator}
					{numberGenerator}
					{tooltip}
				</div>);
		}

		const action = this.actionFactory.generateAction(0, this.props.control.action);

		const className = classNames("properties-control-item", { "hide": hidden });
		return (
			<div data-id={"properties-ci-" + this.props.control.name}
				className={className} disabled={disabled}
			>
				{label}
				{description}
				{action}
				{this.props.controlObj}
			</div>
		);
	}
}

ControlItem.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlObj: PropTypes.object,
	state: PropTypes.string // passed by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getControlState(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ControlItem);
