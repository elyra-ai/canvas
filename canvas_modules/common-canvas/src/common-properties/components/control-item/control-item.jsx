/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import { STATES, TOOL_TIP_DELAY } from "./../../constants/constants.js";
import IconButton from "./../icon-button";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import isEmpty from "lodash/isEmpty";
import uuid4 from "uuid/v4";

class ControlItem extends React.Component {

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

		let label = null;
		if (this.props.control.label && this.props.control.labelVisible !== false) {
			let description;
			let tooltip;
			if (this.props.control.description) {
				if (this.props.control.description.placement === "on_panel") {
					description = <div className="properties-control-description">{this.props.control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else {
					tooltip = this.props.control.description.text; // default to tooltip
				}
			}
			let requiredIndicator;
			if (this.props.control.required) {
				requiredIndicator = <span className="properties-required-indicator">*</span>;
			}
			let numberGenerator;
			if (this.props.control.label.numberGenerator) {
				numberGenerator = (<IconButton
					className="properties-number-generator"
					children={this.props.control.label.numberGenerator.label.default}
					onClick={generateNumber} hide={hidden}
					disabled={disabled}
				/>);
			}
			const tooltipId = uuid4() + "-tooltip-label-" + this.props.control.name;
			const tipContent = (
				<div className="properties-tooltips">
					{tooltip}
				</div>
			);
			label = (
				<div className="properties-tooltips-container">
					<Tooltip
						id={tooltipId}
						tip={tipContent}
						direction="right"
						delay={TOOL_TIP_DELAY}
						className="properties-tooltips"
						disable={isEmpty(tooltip) || hidden || disabled}
					>
						<div>
							<div className="properties-label-container">
								<label className="properties-control-label">{this.props.control.label.text}</label>
								{requiredIndicator}
								{numberGenerator}
							</div>
							{description}
						</div>
					</Tooltip>
				</div>);
		}

		const className = classNames("properties-control-item", { "hide": hidden });
		return (
			<div data-id={"properties-ci-" + this.props.control.name}
				className={className} disabled={disabled}
			>
				{label}
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
