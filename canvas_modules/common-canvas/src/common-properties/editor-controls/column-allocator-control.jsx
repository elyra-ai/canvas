/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { FormControl } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import ReactDOM from "react-dom";
import { EDITOR_CONTROL } from "../constants/constants.js";

var _ = require("underscore");

export default class ColumnAllocatorControl extends EditorControl {
	constructor(props) {
		super(props);
		// Convert all values to arrays
		var controlValue = props.valueAccessor(props.control.name);
		if (!Array.isArray(controlValue)) {
			controlValue = [controlValue];
		}
		this.state = {
			controlValue: controlValue,
			selectedValues: []
		};

		this._update_callback = null;

		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.handleChangeMultiColumn = this.handleChangeMultiColumn.bind(this);
	}

	handleChangeMultiColumn(evt) {
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		this.setState({ selectedValues: values });
	}

	handleChange(evt) {
		this.setState({ selectedValues: evt.target.value, controlValue: [evt.target.value] });
		if (this.props.updateControlValue) {
			this.props.updateControlValue(this.props.control.name, [evt.target.value]);
		}
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		// logger.info("getSelectedColumns");
		// logger.info(this.state.selectedValues);
		return this.state.selectedValues;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		// needs to be an array
		return this.state.controlValue;
	}

	addColumns(columnNames, callback) {
		// logger.info("addColumns");
		var currentColumns = this.state.controlValue;
		// logger.info(currentColumns);
		if (this.props.multiColumn) {
			currentColumns = _.union(currentColumns, columnNames);
		} else if (columnNames.length === 1) {
			currentColumns = columnNames;
		}
		// logger.info(currentColumns);

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
		// logger.info("removeColumns");
		var currentColumns = this.state.controlValue;
		// logger.info(currentColumns);
		if (this.props.multiColumn) {
			currentColumns = _.difference(currentColumns, columnNames);
		} else {
			// Always remove the current value
			currentColumns = [];
		}
		// logger.info(currentColumns);

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
		if (this.props.multiColumn) {
			return this.state.controlValue;
		}
		if (this.state.controlValue[0]) {
			return this.state.controlValue[0];
		}
		return "";
	}

	render() {
		// logger.info("AllocationControl.render");
		const options = EditorControl.genStringSelectOptions(this.state.controlValue, this.state.selectedValues);

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
		if (this.props.multiColumn) {
			// help={this.props.control.additionalText}
			return (
				<div className="editor_control_area" style={stateStyle}>
					<FormControl {...stateDisabled}
						id={this.getControlID()}
						className={"column-allocator multi"}
						componentClass="select"
						multiple
						rows={4}
						name={this.props.control.name}
						style={stateStyle}
						onChange={this.handleChangeMultiColumn}
						value={this.state.selectedValues}
						ref="input"
					>
						{options}
					</FormControl>
					{errorMessage}
				</div>
			);
		}
		return (
			<div className="editor_control_area" style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl {...stateDisabled}
						id={this.getControlID()}
						className={"column-allocator single"}
						componentClass="select"
						rows={1}
						name={this.props.control.name}
						style={stateStyle}
						onChange={this.handleChange}
						value={this.state.controlValue[0]}
						ref="input"
					>
						{options}
					</FormControl>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

ColumnAllocatorControl.propTypes = {
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.object,
	requiredParameters: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
