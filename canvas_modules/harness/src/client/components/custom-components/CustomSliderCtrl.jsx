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
import Slider from "carbon-components-react/lib/components/Slider";
import { WarningFilled16, ErrorFilled16 } from "@carbon/icons-react";
import { connect } from "react-redux";

class CustomSliderCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		let message;
		if (evt.value > 60 && evt.value <= 90) {
			message = { type: "warning", text: "Slider greater than 60" };
			this.props.controller.updateErrorMessage(this.props.propertyId, message);
		} else if (evt.value > 90) {
			message = { type: "error", text: "Slider greater than 90" };
			this.props.controller.updateErrorMessage(this.props.propertyId, message);
		} else {
			this.props.controller.updateErrorMessage(this.props.propertyId);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.value);
	}
	render() {
		let messageText;
		let icon;
		if (this.props.messageInfo && this.props.messageInfo.text) {
			messageText = this.props.messageInfo.text;
			if (this.props.messageInfo.type === "warning") {
				icon = (<WarningFilled16 className="warning" />);
			} else if (this.props.messageInfo.type === "error") {
				icon = (<ErrorFilled16 className="error" />);
			}
		}
		return (
			<div>
				<div className="harness-custom-control-custom-slider">
					<div className="harness-custom-control-slider">
						<Slider
							onChange={this.handleChange}
							value={this.props.controlValue}
							min={0}
							max={100}
							step={1}
							hideTextInput
						/>
					</div>
				</div>
				<div className="harness-custom-control-condition">
					<div className="icon">{icon}</div>
					<div>{messageText}</div>
				</div>
			</div>
		);
	}
}

CustomSliderCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controlValue: PropTypes.number, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomSliderCtrl);
