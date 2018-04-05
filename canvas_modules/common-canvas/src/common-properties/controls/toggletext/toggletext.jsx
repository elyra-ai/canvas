/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import ControlUtils from "./../../util/control-utils";

export default class ToggletextControl extends React.Component {
	constructor(props) {
		super(props);
		this.valuesMap = {};
		this.iconsMap = {};
		for (let i = 0; i < this.props.values.length; ++i) {
			this.valuesMap[this.props.values[i]] = this.props.valueLabels[i];
			if (typeof this.props.valueIcons !== "undefined") {
				this.iconsMap[this.props.values[i]] = this.props.valueIcons[i];
			}
		}
	}

	onClick(evt) {
		evt.stopPropagation(); // prevents row selection change when clicking on toggletext
		const renderValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const newValue = (renderValue === this.props.values[0]) ? this.props.values[1] : this.props.values[0];
		this.props.controller.updatePropertyValue(this.props.propertyId, newValue);

	}

	render() {
		const renderValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "toggletext"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let rendered = this.valuesMap[renderValue];
		if (typeof rendered === "undefined") {
			rendered = renderValue;
		}
		let icon = "";
		if (typeof this.iconsMap[renderValue] !== "undefined") {
			icon = <img className="toggletext_icon" src={this.iconsMap[renderValue]} onClick={this.onClick.bind(this)} {...stateDisabled} style={stateStyle} />;
		}
		return (
			<div className="toggletext_control">
				{icon}
				<u onClick={this.onClick.bind(this)} className="toggletext_text" {...stateDisabled} style={stateStyle}>
					{rendered}
				</u>
			</div>
		);
	}
}

ToggletextControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	values: PropTypes.array.isRequired,
	valueLabels: PropTypes.array.isRequired,
	valueIcons: PropTypes.array,
};
