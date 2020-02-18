/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Button from "carbon-components-react/lib/components/Button";

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
