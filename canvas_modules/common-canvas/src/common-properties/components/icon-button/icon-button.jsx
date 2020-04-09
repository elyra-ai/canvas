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

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Button } from "carbon-components-react";

export default class IconButton extends Component {

	render() {
		const icon = this.props.icon ? this.props.icon : null;
		const label = <span disabled={this.props.disabled} className="properties-icon-button-label">{this.props.children}</span>;
		const className = classNames("properties-icon-button", this.props.className, { "hide": this.props.hide });

		return (
			<Button
				className={className}
				disabled={this.props.disabled}
				onClick={this.props.onClick}
				size="small"
				kind="ghost"
			>
				{label}
				{icon}
			</Button>
		);
	}
}

IconButton.propTypes = {
	icon: PropTypes.object,
	children: PropTypes.string,
	onClick: PropTypes.func,
	hide: PropTypes.bool,
	disabled: PropTypes.bool,
	className: PropTypes.string
};
