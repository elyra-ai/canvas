/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React, { Component } from "react";
import { Button } from "ap-components-react/dist/ap-components-react";
import { OKAY, CANCEL } from "./constants/constants.js";

export default class PropertiesEditing extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined") ? OKAY : this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined") ? CANCEL : this.props.rejectLabel;
		const classSize = (typeof this.props.bsSize === "undefined") ? "large" : this.props.bsSize;
		const propertyEditingClass = "properties-editing properties-" + classSize;

		return (
			<div className={propertyEditingClass} >
				<div className="properties-title"
					style={{ "paddingBottom": "10px" }}
				>
					<h2>
						{this.props.title}
					</h2>
				</div>
				<div className="properties-body">
					{this.props.children}
				</div>
				<div className="properties-buttons">
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
				</div>
			</div>
		);
	}
}

PropertiesEditing.propTypes = {
	cancelHandler: React.PropTypes.func,
	okHandler: React.PropTypes.func,
	bsSize: React.PropTypes.string,
	title: React.PropTypes.object,
	applyLabel: React.PropTypes.string,
	rejectLabel: React.PropTypes.string,
	children: React.PropTypes.element
};
