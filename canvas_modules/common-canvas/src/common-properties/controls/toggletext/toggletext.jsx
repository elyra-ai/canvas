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
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

export default class ToggletextControl extends React.Component {
	constructor(props) {
		super(props);
		this.valuesMap = {};
		this.iconsMap = {};
		for (let i = 0; i < props.control.values.length; ++i) {
			this.valuesMap[props.control.values[i]] = props.control.valueLabels[i];
			if (typeof props.control.valueIcons !== "undefined") {
				this.iconsMap[props.control.values[i]] = props.control.valueIcons[i];
			}
		}
	}

	onClick(evt) {
		const renderValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const newValue = (renderValue === this.props.control.values[0]) ? this.props.control.values[1] : this.props.control.values[0];
		this.props.controller.updatePropertyValue(this.props.propertyId, newValue);

	}

	render() {
		const renderValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);

		let rendered = this.valuesMap[renderValue];
		if (typeof rendered === "undefined") {
			rendered = renderValue;
		}
		let icon = null;
		if (typeof this.iconsMap[renderValue] !== "undefined") {
			icon = <img className="icon" src={this.iconsMap[renderValue]} onClick={this.onClick.bind(this)} />;
		}
		let button = <div />;
		if (typeof rendered !== "undefined") {
			button = (
				<button type="button" onClick={this.onClick.bind(this)}>
					{icon}
					<span className="text">{rendered}</span>
				</button>
			);
		}

		const className = classNames("properties-toggletext", { "hide": state === STATES.HIDDEN }, messageInfo ? messageInfo.type : null);

		return (
			<div className={className} disabled={state === STATES.DISABLED} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				{button}
				<ValidationMessage inTable={this.props.tableControl} state={state} messageInfo={messageInfo} />
			</div>
		);
	}
}

ToggletextControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
