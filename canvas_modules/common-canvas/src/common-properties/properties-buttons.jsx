/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "ap-components-react/dist/ap-components-react";
import { OKAY, CANCEL } from "./constants/constants.js";

export default class PropertiesButtons extends Component {

	render() {
		const applyButtonLabel = (typeof this.props.applyLabel === "undefined") ? OKAY : this.props.applyLabel;
		const rejectButtonLabel = (typeof this.props.rejectLabel === "undefined") ? CANCEL : this.props.rejectLabel;
		let buttons = (<div>
			<Button id="properties-cancel-button" semantic href="" hyperlink onClick={this.props.cancelHandler}>
				{rejectButtonLabel}
			</Button>
			<Button
				id="properties-apply-button"
				semantic href=""
				onClick={this.props.okHandler}
				style={{ "marginRight": "10px" }}
			>
				{applyButtonLabel}
			</Button>
		</div>);
		if (this.props.showPropertiesButtons && this.props.showPropertiesButtons === false) {
			buttons = <div />;
		}

		const className = typeof this.props.propertiesClassname !== "undefined" ? this.props.propertiesClassname : "";
		return (
			<div className={"modal__buttons " + className}>
				{buttons}
			</div>
		);
	}
}

PropertiesButtons.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	showPropertiesButtons: PropTypes.bool,
	propertiesClassname: PropTypes.string
};
