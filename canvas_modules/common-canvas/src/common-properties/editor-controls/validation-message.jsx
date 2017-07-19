/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from "react";
import { Icon } from "ap-components-react/dist/ap-components-react";
import warnIcon from "../../../assets/images/warn_32.svg";

export default class ValidationMessage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.errorIcon = <Icon type="error-o" />;
		this.warningIcon = <img src={warnIcon} />;
	}

	render() {
		let icon = <div></div>;
		var errorMessage = <div className="validation-error-message"></div>;
		if (this.props.validateErrorMessage && this.props.validateErrorMessage.text !== "") {
			const errorType = this.props.validateErrorMessage.type;
			let controlTypeStyle = "";
			if (this.props.controlType) {
				controlTypeStyle = "validation-error-message-type-" + this.props.controlType;
			}

			errorMessage = (
				<div className="validation-error-message">

					<p className={"form__validation " +
						"validation-error-message-color-" + errorType + " " +
						controlTypeStyle}
						style={{ "display": "block" }}
					>
						<span className={"form__validation--" + errorType}>{this.props.validateErrorMessage.text}</span>
					</p>
				</div>
			);

			const controlTypeIconClass = typeof this.props.controlType === "undefined" ? "general" : this.props.controlType;
			icon = (<div
				className={
					"validation-error-message-icon " +
					"validation-" + errorType + "-message-icon-" + controlTypeIconClass
				}
			>
				{this[errorType + "Icon"]}
			</div>);
		}

		return (
			<div>
				{icon}
				{errorMessage}
				<div style={{ clear: "both" }}></div>
			</div>
		);
	}
}

ValidationMessage.propTypes = {
	validateErrorMessage: React.PropTypes.object.isRequired,
	controlType: React.PropTypes.string
};
