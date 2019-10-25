/*
 * Copyright 2017-2019 IBM Corporation
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
import Icon from "./../../../icons/icon.jsx";
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
			{<Icon type={this.props.messageInfo.type} />}
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
