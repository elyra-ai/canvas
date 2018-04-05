/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import PropertiesButtons from "./../properties-buttons";

export default class PropertiesEditor extends Component {

	render() {
		const classSize = (typeof this.props.bsSize === "undefined") ? "large" : this.props.bsSize;
		const propertyEditingClass = "properties-editing properties-" + classSize;
		const buttons = (<PropertiesButtons
			okHandler={this.props.okHandler}
			cancelHandler={this.props.cancelHandler}
			applyLabel={this.props.applyLabel}
			rejectLabel={this.props.rejectLabel}
			showPropertiesButtons={this.props.showPropertiesButtons}
		/>);

		return (
			<div className={propertyEditingClass} >
				<div className="properties-title"
					style={{ "paddingBottom": "10px" }}
				>
					<h2>
						<div>{this.props.title}</div>
					</h2>
				</div>
				<div className="properties-body">
					{this.props.children}
				</div>
				{buttons}
			</div>
		);
	}
}

PropertiesEditor.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	bsSize: PropTypes.string,
	title: PropTypes.string,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	children: PropTypes.element,
	showPropertiesButtons: PropTypes.bool
};
