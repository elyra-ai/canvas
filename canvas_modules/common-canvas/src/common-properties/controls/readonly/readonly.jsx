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

export default class ReadonlyControl extends React.Component {

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = "";
		}

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "textfield"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

		const errorMessage = this.props.tableControl ? null : conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;
		stateStyle.paddingBottom = "2px";

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		return (
			<div className="readonly-control" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<text {...stateDisabled} id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}>
						{controlValue}
					</text>
					{icon}
				</div>
				{errorMessage}
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
