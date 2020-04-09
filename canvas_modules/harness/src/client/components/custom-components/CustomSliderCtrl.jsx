/*
 * Copyright 2017-2020 IBM Corporation
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
import { WarningFilled16, ErrorFilled16 } from "@carbon/icons-react";
import { Slider } from "carbon-components-react";
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
