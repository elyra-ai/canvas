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
import Icon from "carbon-components-react/lib/components/Icon";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

export default class ValidationMessage extends React.Component {

	render() {
		if (!this.props.messageInfo) {
			return null;
		}
		const className = classNames("properties-validation-message",
			{ "hide": this.props.state === STATES.HIDDEN || this.props.state === STATES.DISABLED || this.props.inTable });
		return (
			<div className={className}>
				<div className="icon">
					<Icon className={this.props.messageInfo.type} name={this.props.messageInfo.type + "--glyph"} />
				</div>
				<span>{this.props.messageInfo.text}</span>
			</div>);
	}
}

ValidationMessage.propTypes = {
	messageInfo: PropTypes.shape({
		text: PropTypes.string,
		type: PropTypes.string
	}),
	state: PropTypes.string,
	inTable: PropTypes.bool
};
