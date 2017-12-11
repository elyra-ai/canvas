/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// selectcolumn control
import React from "react";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";

export default class FieldAllocatorControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			selectedValues: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.onBlur = this.onBlur.bind(this);

		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
	}

	handleChange(evt) {
		if (evt.value !== "...") {
			this.setState({ selectedValues: evt.value });
			this.props.controller.updatePropertyValue(this.props.propertyId, evt.value);
		}
	}
	onBlur() {
		this.props.controller.validateInput(this.props.propertyId);
	}

	onClick(evt) {
		this.props.controller.validateInput(this.props.propertyId);
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		return this.state.selectedValues;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		return this.props.controller.getPropertyValue(this.props.propertyId);
	}

	addColumns(columnNames, callback) {
		var currentColumns = this.props.controller.getPropertyValue(this.props.propertyId);
		if (columnNames.length === 1) {
			currentColumns = columnNames;
		}
		this._update_callback = callback;
		this.setState({ selectedValues: [] });
		this.props.controller.updatePropertyValue(this.props.propertyId, currentColumns);
	}

	removeColumns(columnNames, callback) {
		this._update_callback = callback;
		this.setState({ selectedValues: [] });
		this.props.controller.updatePropertyValue(this.props.propertyId, []);
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		let includeEmpty = false;
		includeEmpty = !controlValue || controlValue.length === 0;
		const options = EditorControl.genColumnSelectDropdownOptions(this.props.dataModel.fields,
			this.state.selectedValues);
		const conditionProps = {
			propertyId: this.props.propertyId,
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
		const currentSeln = includeEmpty ? "..." : controlValue;
		return (
			<div onClick={this.onClick.bind(this)} className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<Dropdown {...stateDisabled}
						id={this.getControlID()}
						name={this.props.control.name}
						options={options}
						onChange={this.handleChange}
						onBlur={this.onBlur}
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
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired
};
