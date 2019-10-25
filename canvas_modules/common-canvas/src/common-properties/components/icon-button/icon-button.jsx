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

import React, { Component } from "react";
import PropTypes from "prop-types";
import Icon from "carbon-components-react/lib/components/Icon";
import classNames from "classnames";


export default class IconButton extends Component {

	render() {
		const icon = this.props.icon ? <Icon disabled={this.props.disabled} name={this.props.icon} /> : null;
		const label = <span disabled={this.props.disabled} className="properties-icon-button-label">{this.props.children}</span>;
		const className = classNames("properties-icon-button", this.props.className, { "hide": this.props.hide });

		return (
			<button type="button" disabled={this.props.disabled} onClick={this.props.onClick} className={className}>
				{icon}
				{label}
			</button>
		);
	}
}

IconButton.propTypes = {
	icon: PropTypes.string,
	children: PropTypes.string,
	onClick: PropTypes.func,
	hide: PropTypes.bool,
	disabled: PropTypes.bool,
	className: PropTypes.string
};
