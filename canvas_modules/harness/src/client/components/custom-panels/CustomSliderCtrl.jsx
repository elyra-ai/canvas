/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Slider from "ap-components-react/dist/components/Slider";
import Icon from "ap-components-react/dist/components/Icon";

export default class CustomSliderCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt, val) {
		var message;
		if (parseInt(val, 10) > 60 && parseInt(val, 10) <= 90) {
			message = { type: "warning", text: "Slider greater than 60" };
			this.props.controller.updateErrorMessage(this.props.propertyId, message);
		} else if (parseInt(val, 10) > 90) {
			message = { type: "error", text: "Slider greater than 90" };
			this.props.controller.updateErrorMessage(this.props.propertyId, message);
		} else {
			this.props.controller.updateErrorMessage(this.props.propertyId);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, val);
	}
	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const message = this.props.controller.getErrorMessage(this.props.propertyId);
		var messageText;
		var icon;
		if (message && message.text) {
			messageText = message.text;
			if (message.type === "warning") {
				icon = (<Icon type="warning" />);
			} else if (message.type === "error") {
				icon = (<Icon type="error-o" />);
			}
		}
		return (
			<div>
				<div className="custom-slider">
					<div className="slider">
						<Slider
							onChange={this.handleChange}
							start={controlValue}
							lower={0}
							upper={100}
							step={1}
						/>
					</div>
					<div className="icon">
						{icon}
					</div>
				</div>
				<div style={{ "marginTop": "-15px" }}>
					{messageText}
				</div>
			</div>
		);
	}
}

CustomSliderCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired
};
