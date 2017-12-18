/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import EditorControl from "./editor-control.jsx";

export default class ReadonlyControl extends EditorControl {

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const value = controlValue ? controlValue : "";

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "textfield"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

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
			<div className="editor_control_readonly" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<text {...stateDisabled} id={this.getControlID()}>
						{value}
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
	controller: PropTypes.object.isRequired
};
