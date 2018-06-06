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
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";
import PropertyUtils from "./../../util/property-utils";

export default class ReadonlyControl extends React.Component {

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = "";
		} else if (typeof controlValue === "object" && controlValue.link_ref) {
			controlValue = PropertyUtils.stringifyFieldValue(controlValue, this.props.control);
		}
		const state = this.props.controller.getControlState(this.props.propertyId);

		return (
			<div
				className={classNames("properties-readonly", { "hide": state === STATES.HIDDEN })}
				data-id={ControlUtils.getDataId(this.props.propertyId)}
			>
				<span disabled={state === STATES.DISABLED}>
					{controlValue}
				</span>
				<ValidationMessage inTable={this.props.tableControl} state={state} messageInfo={this.props.controller.getErrorMessage(this.props.propertyId)} />
			</div>
		);
	}
}

ReadonlyControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
