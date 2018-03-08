/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

export default class ValidationMessage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

	}

	render() {
		var errorMessage = <div className="validation-error-message" />;
		if (this.props.validateErrorMessage && this.props.validateErrorMessage.text !== "") {
			const errorType = this.props.validateErrorMessage.type;
			let controlTypeStyle = "";
			if (this.props.controlType) {
				controlTypeStyle = "validation-error-message-type-" + this.props.controlType;
			}

			errorMessage = (
				<div className="validation-error-message">

					<p className={"form__validation validation-error-message-color-" + errorType + " " + controlTypeStyle}
						style={{ "display": "block" }}
					>
						<span className={"form__validation--" + errorType}>{this.props.validateErrorMessage.text}</span>
					</p>
				</div>
			);
		}

		return errorMessage;
	}
}

ValidationMessage.propTypes = {
	validateErrorMessage: PropTypes.object.isRequired,
	controlType: PropTypes.string
};
