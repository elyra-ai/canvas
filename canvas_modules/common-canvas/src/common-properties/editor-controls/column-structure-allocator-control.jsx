/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint max-depth: ["error", 5] */

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import StructureTableEditor from "./structure-table-editor.jsx";
import { EDITOR_CONTROL } from "../constants/constants.js";

var _ = require("underscore");

export default class ColumnStructureAllocatorControl extends StructureTableEditor {
	constructor(props) {
		super(props);

		this._update_callback = null;

		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);

		this.stopEditingRow = this.stopEditingRow.bind(this);

		this.indexOfRow = this.indexOfRow.bind(this);
	}

	stopEditingRow(rowIndex, applyChanges) {
		// logger.info("stopEditingRow: row=" + rowIndex + ", applyChanges=" + applyChanges);

		if (applyChanges) {
			const subControlId = this.getSubControlId();
			const allValues = this.getCurrentControlValue();
			for (var i = 0; i < this.props.control.subControls.length; i++) {
				if (i !== this.props.control.keyIndex) {
					const columnControl = this.props.control.subControls[i];
					const lookupKey = subControlId + columnControl.name;
					// logger.info("Accessing sub-control " + lookupKey);
					const control = this.refs[lookupKey];
					// logger.info(control);
					if (typeof control !== "undefined") {
						const controlValue = control.getControlValue();
						// logger.info("Control value=" + controlValue);
						allValues[rowIndex][i] = controlValue;
					}
				}
			}
			this.setCurrentControlValue(this.props.control.name, allValues, this.props.updateControlValue);
		}
	}

	indexOfRow(columnName) {
		const keyIndex = this.props.control.keyIndex;
		return _.findIndex(this.getCurrentControlValue(), function(row) {
			return row[keyIndex] === columnName;
		});
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		// logger.info("getSelectedColumns");
		const selected = this.getSelectedRows();
		const controlValue = this.getCurrentControlValue();
		const columns = [];

		for (var i = 0; i < selected.length; i++) {
			const rowIndex = selected[i];
			columns.push(controlValue[rowIndex][this.props.control.keyIndex]);
		}
		// logger.info(columns);
		return columns;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		// logger.info("getAllocatedColumns");
		const controlValue = this.getCurrentControlValue();
		const columns = [];
		for (var i = 0; i < controlValue.length; i++) {
			const value = controlValue[i];
			columns.push(value[this.props.control.keyIndex]);
		}
		// logger.info(columns);
		return columns;
	}

	addColumns(columnNames, callback) {
		// logger.info("addColumns");
		// logger.info(columnNames);
		// logger.info(this.props.control.defaultRow);

		const newRows = [];
		const isMap = this.props.control.valueDef.isMap;
		for (var i = 0; i < columnNames.length; i++) {
			const columnName = columnNames[i];

			// Sometimes the source list selection hasn"t changed so do an
			// explicit check for whether an entry for this column exists
			if (this.indexOfRow(columnName) < 0) {
				// Must be a better way of cloning the array but this will do for now
				const newRow = JSON.parse(JSON.stringify(this.props.control.defaultRow));

				// Set the column name.
				if (isMap) {
					// For maps, this means adding the column name to the start of the cloned list.
					newRow.unshift(columnName);
				} else {
					// For lists, this means assigning the column name to the correct location in the cloned list.
					newRow[this.props.control.keyIndex] = columnName;
				}
				newRows.push(newRow);
			}
		}

		const rows = this.getCurrentControlValue().concat(newRows);

		this._update_callback = callback;

		this.setCurrentControlValue(this.props.control.name, rows, this.props.updateControlValue);
	}

	removeColumns(columnNames, callback) {
		// logger.info("removeColumns");
		// logger.info(columnNames);

		const rows = this.getCurrentControlValue();
		const keyIndex = this.props.control.keyIndex;

		const newRows = _.reject(rows, function(val) {
			// logger.info("_reject: " + val[keyIndex]);
			// logger.info("_reject: " + (columnNames.indexOf(val[keyIndex]) >= 0));
			return columnNames.indexOf(val[keyIndex]) >= 0;
		});

		// logger.info(rows);
		// logger.info(newRows);

		this._update_callback = callback;

		this.setCurrentControlValue(this.props.control.name, newRows, this.props.updateControlValue);
	}

	render() {
		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
		const conditionProps = {
			controlName: controlName,
			controlType: "table"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		// const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "some-of-column-control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "some-of-column-control-icon-container-enabled";
		}

		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					{this.createTable()}
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

ColumnStructureAllocatorControl.propTypes = {
	buildUIItem: PropTypes.func,
	dataModel: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.array,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func
};
