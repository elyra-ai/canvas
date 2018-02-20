/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { Table } from "reactable";

export default class CustomTableCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.getValues = this.getValues.bind(this);
	}
	getValues() {
		const values = [];
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (Array.isArray(controlValue)) {
			values.push(
				{
					Age: controlValue[0],
					Value: controlValue[1]
				}
			);
		}
		return values;
	}
	render() {
		const state = this.props.controller.getControlState(this.props.propertyId);
		let visibility;
		if (state === "hidden") {
			visibility = { visibility: "hidden" };
		}

		let content = this.props.controller.getPropertyValue(this.props.propertyId);
		if (Array.isArray(content)) {
			content = (<div className="text">{content.join("-")}</div>);
		}
		if (this.props.editStyle !== "summary") {
			content = (
				<div className="custom-table" >
					<Table className="table" data={this.getValues()} />
				</div>
			);
		}
		return (
			<div style={visibility}>
				{content}
			</div>
		);
	}
}

CustomTableCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	editStyle: PropTypes.string
};
