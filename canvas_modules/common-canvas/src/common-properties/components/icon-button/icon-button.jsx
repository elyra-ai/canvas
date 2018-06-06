/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
