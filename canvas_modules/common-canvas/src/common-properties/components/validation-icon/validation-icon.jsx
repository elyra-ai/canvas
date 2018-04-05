/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import APIcon from "ap-components-react/dist/components/Icon";
import Icon from "./../../../icons/icon.jsx";

export default class ValidationIcon extends React.Component {
	constructor(props) {
		super(props);
		this.errorIcon = <APIcon type="error-o" />;
		this.warningIcon = <Icon type="warn" />;
	}

	render() {
		let icon = <div />;
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
	validateErrorMessage: PropTypes.object.isRequired,
	controlType: PropTypes.string
};
