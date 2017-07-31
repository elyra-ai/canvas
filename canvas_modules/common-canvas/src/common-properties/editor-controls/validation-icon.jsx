/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { Icon } from "ap-components-react/dist/ap-components-react";
import warnIcon from "../../../assets/images/warn_32.svg";

export default class ValidationIcon extends React.Component {
	constructor(props) {
		super(props);

		this.errorIcon = <Icon type="error-o" />;
		this.warningIcon = <img src={warnIcon} />;
	}

	render() {
		let icon = <div></div>;
		if (this.props.validateErrorMessage && this.props.validateErrorMessage.text !== "") {
			const errorType = this.props.validateErrorMessage.type;

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

		return icon;
	}
}

ValidationIcon.propTypes = {
	validateErrorMessage: React.PropTypes.object.isRequired,
	controlType: React.PropTypes.string
};
