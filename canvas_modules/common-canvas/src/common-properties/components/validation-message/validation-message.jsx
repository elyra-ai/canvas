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
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { STATES, TOOL_TIP_DELAY } from "./../../constants/constants.js";
import classNames from "classnames";
import uuid4 from "uuid/v4";

export default class ValidationMessage extends React.Component {

	render() {
		if (!this.props.messageInfo) {
			return null;
		}
		const msgText = this.props.inTable ? null : <span>{this.props.messageInfo.text}</span>;
		const icon = (<div className="icon">
			<Icon className={this.props.messageInfo.type}
				description=""
				name={this.props.messageInfo.type + "--glyph"}
			/>
		</div>);
		const msgIcon = this.props.inTable
			? (<div className="properties-tooltips-container table-cell-msg-icon">
				<Tooltip
					id={uuid4() + "-table-cell-msg-icon"}
					tip={this.props.messageInfo.text}
					direction="top"
					delay={TOOL_TIP_DELAY}
					className="properties-tooltips"
				>
					{icon}
				</Tooltip>
			</div>)
			: icon;
		const className = classNames("properties-validation-message",
			{ "hide": this.props.state === STATES.HIDDEN || this.props.state === STATES.DISABLED, "inTable": this.props.inTable });
		return (
			<div className={className}>
				{msgIcon}
				{msgText}
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
