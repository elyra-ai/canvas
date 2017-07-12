/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

export default class ControlItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.getControl = this.getControl.bind(this);
		this.getLabel = this.getLabel.bind(this);
	}

	getControl() {
		return this.props.control;
	}

	getLabel() {
		return this.props.label;
	}

	render() {
		return (
			<div>
				{this.props.label}
				{this.props.description}
				{this.props.control}
			</div>
		);
	}
}

ControlItem.propTypes = {
	control: React.PropTypes.object,
	label: React.PropTypes.object,
	description: React.PropTypes.object
};
