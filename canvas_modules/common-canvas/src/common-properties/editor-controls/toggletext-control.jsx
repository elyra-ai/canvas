/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class ToggletextControl extends EditorControl {
	constructor(props) {
		super(props);
		if (!props.tableControl) {
			this.state = { controlValue: props.valueAccessor(props.control.name)[0] };
		}
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
		const renderValue = (this.props.tableControl) ? this.props.value : this.state.controlValue;
		const newValue = (renderValue === this.props.values[0]) ? this.props.values[1] : this.props.values[0];
		if (this.props.tableControl) {
			var newControlValue = this.props.controlValue;
			newControlValue[this.props.rowIndex][this.props.columnIndex] = newValue;
			this.props.setCurrentControlValueSelected(this.props.control.name, newControlValue, this.props.updateControlValue, this.props.getSelectedRows());
		} else {
			this.notifyValueChanged(this.props.control.name, newValue);
			this.setState({ controlValue: newValue });
			this.props.updateControlValue(this.props.control.name, newValue);
		}
	}

	render() {
		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "toggletext"
		};
		const conditionState = this.getConditionMsgState(conditionProps);
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		const renderValue = (this.props.tableControl) ? this.props.value : this.state.controlValue;
		let rendered = this.valuesMap[renderValue];
		if (typeof rendered === "undefined") {
			rendered = renderValue;
		}

		let icon = "";
		if (typeof this.iconsMap[renderValue] !== "undefined") {
			icon = <img className="toggletext_icon" src={this.iconsMap[renderValue]} onClick={this.onClick.bind(this)} />;

		}
		let uValue;
		if (!this.props.disabled) {
			uValue = (<u onClick={this.onClick.bind(this)} className="toggletext_text">
				{rendered}
			</u>);
		} else {
			uValue = (<u {...stateDisabled} style={stateStyle}>
				{rendered}
			</u>);
		}

		return (
			<div className="toggletext_control">
				{icon}
				{uValue}
			</div>
		);
	}
}

ToggletextControl.propTypes = {
	rowIndex: PropTypes.number, 										// required when tableControl yes
	columnIndex: PropTypes.number, 									// required when tableControl yes
	control: PropTypes.object.isRequired,
	controlValue: PropTypes.array.isRequired,
	values: PropTypes.array.isRequired,
	valueLabels: PropTypes.array.isRequired,
	valueIcons: PropTypes.array,
	value: PropTypes.string, 												// required when tableControl yes
	updateControlValue: PropTypes.func.isRequired,
	setCurrentControlValueSelected: PropTypes.func,	// required when tableControl yes
	getSelectedRows: PropTypes.func, 								// required when tableControl yes
	valueAccessor: PropTypes.func, 									// required when tableControl no
	tableControl: PropTypes.bool
};
