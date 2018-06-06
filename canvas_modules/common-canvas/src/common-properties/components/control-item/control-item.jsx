/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class ControlItem extends React.Component {

	render() {
		const className = classNames("properties-control-item", { "hide": this.props.hide });
		return (
			<div data-id={this.props.id}
				className={className} disabled={this.props.disabled}
			>
				{this.props.label}
				{this.props.control}
			</div>
		);
	}
}

ControlItem.propTypes = {
	id: PropTypes.string,
	control: PropTypes.object,
	label: PropTypes.object,
	hide: PropTypes.bool,
	disabled: PropTypes.bool
};
