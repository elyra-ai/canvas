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
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

export default class FieldAllocatorControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name),
			selectedValues: []
		};

		this._update_callback = null;

		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
	}

	handleChange(evt) {
		if (evt.value !== "...") {
			this.setState({ selectedValues: evt.value, controlValue: evt.value });
			if (this.props.updateControlValue) {
				this.props.updateControlValue(this.props.control.name, evt.value);
			}
		}
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		return this.state.selectedValues;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		return this.getControlValue();
	}

	addColumns(columnNames, callback) {
		var currentColumns = this.state.controlValue;
		if (columnNames.length === 1) {
			currentColumns = columnNames;
		}
		this._update_callback = callback;

		var that = this;
		this.setState({
			controlValue: currentColumns,
			selectedValues: []
		}, function() {
			that.props.updateControlValue(that.props.control.name, currentColumns);
			that.validateInput();
		});
	}

	removeColumns(columnNames, callback) {
		var currentColumns = this.state.controlValue;
		currentColumns = [];

		this._update_callback = callback;

		var that = this;
		this.setState({
			controlValue: currentColumns,
			selectedValues: []
		}, function() {
			that.props.updateControlValue(that.props.control.name, currentColumns);
			that.validateInput();
		});
	}

	getControlValue() {
		// logger.info("getControlValue");
		// logger.info(this.state.controlValue);
		return this.state.controlValue;
	}

	render() {
		// logger.info("AllocationControl.render");
		let includeEmpty = false;
		includeEmpty = !this.state.controlValue || this.state.controlValue.length === 0;
		const availableFields = this.props.availableFieldsAccessor
			?	this.props.availableFieldsAccessor(this.props.control.name)
			: this.props.dataModel;
		const options = EditorControl.genColumnSelectDropdownOptions(availableFields.fields,
			this.state.selectedValues);

		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "selection"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}
		const currentSeln = includeEmpty ? "..." : this.state.controlValue;
		// help={this.props.control.additionalText}
		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<Dropdown {...stateDisabled}
						id={this.getControlID()}
						name={this.props.control.name}
						options={options}
						onChange={this.handleChange}
						onBlur={this.validateInput}
						value={currentSeln}
						placeholder={this.props.control.additionalText}
						ref="input"
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

FieldAllocatorControl.propTypes = {
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	updateControlValue: PropTypes.func
};
