/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import { Button } from "ap-components-react/dist/ap-components-react";
import { OKAY, CANCEL } from "./constants/constants.js";

export default class PropertiesEditing extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined") ? OKAY : this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined") ? CANCEL : this.props.rejectLabel;
		const classSize = (typeof this.props.bsSize === "undefined") ? "large" : this.props.bsSize;
		const propertyEditingClass = "properties-editing properties-" + classSize;

		let buttons = (<div>
			<Button
				semantic href=""
				onClick={this.props.okHandler}
				style={{ "marginLeft": "10px" }}
			>
				{applyButtonLabel}
			</Button>

			<Button semantic href="" hyperlink onClick={this.props.cancelHandler}>
				{rejectButtonLabel}
			</Button>
		</div>);
		if (this.props.showPropertiesButtons === false) {
			buttons = <div></div>;
		}

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
				<div className="properties-buttons">
					{buttons}
				</div>
			</div>
		);
	}
}

PropertiesEditing.propTypes = {
	cancelHandler: React.PropTypes.func,
	okHandler: React.PropTypes.func,
	bsSize: React.PropTypes.string,
	title: React.PropTypes.string,
	applyLabel: React.PropTypes.string,
	rejectLabel: React.PropTypes.string,
	children: React.PropTypes.element,
	showPropertiesButtons: React.PropTypes.bool
};
