/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// CONTROL structuretable
/* eslint max-depth: ["error", 5] */
import React from "react";
import PropTypes from "prop-types";
import ColumnStructureTableEditor from "./column-structure-table-editor.jsx";
import MoveableTableRows from "./moveable-table-rows.jsx";
import PropertyUtils from "../util/property-utils";
import { ParamRole } from "../constants/form-constants";
import { injectIntl, intlShape } from "react-intl";
import findIndex from "lodash/findIndex";
import reject from "lodash/reject";

class ColumnStructureTableControl extends ColumnStructureTableEditor {
	constructor(props) {
		super(props);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.stopEditingRow = this.stopEditingRow.bind(this);
		this.getDefaultRow = this.getDefaultRow.bind(this);
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
			this.setCurrentControlValue(allValues);
		}
	}

	indexOfRow(columnName) {
		const keyIndex = this.props.control.keyIndex;
		return findIndex(this.getCurrentControlValue(), function(row) {
			return row[keyIndex] === columnName;
		});
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		// logger.info("getSelectedColumns");
		const selected = this.props.controller.getSelectedRows(this.props.control.name);
		const controlValue = this.getCurrentControlValue();
		const columns = [];

		for (var i = 0; i < selected.length; i++) {
			const rowIndex = selected[i];
			columns.push(controlValue[rowIndex][this.props.control.keyIndex]);
		}
		// logger.info(columns);
		return columns;
	}

	addColumns(columnNames, callback) {
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
		this.setCurrentControlValue(rows);
	}

	removeColumns(columnNames, callback) {

		const rows = this.getCurrentControlValue();
		const keyIndex = this.props.control.keyIndex;

		const newRows = reject(rows, function(val) {
			return columnNames.indexOf(val[keyIndex]) >= 0;
		});
		this.setCurrentControlValue(newRows);
	}


	selectionChanged(selection) {
		ColumnStructureTableEditor.prototype.selectionChanged.call(this, selection);
		// this.setState({ enableRemoveIcon: (selection.length !== 0) });
	}

	/**
	* returns the default row for the control
	* @param field optional field to construct the defaultRow for where the parameter has role===COLUMN
	*/
	getDefaultRow(field) {
		const row = [];
		// if value is already in propertyValues, return that row
		const currentControlValues = this.props.controller.getPropertyValue(this.props.propertyId);
		if (currentControlValues && field) {
			const dataColumnIndex = PropertyUtils.getTableFieldIndex(this.props.control);
			for (let i = 0; i < currentControlValues.length; i++) {
				if ((this.props.control.defaultRow && currentControlValues[i][dataColumnIndex] === field) ||
						(currentControlValues[i] === field)) {
					return currentControlValues[i];
				}
			}
		}

		for (let idx = 0; idx < this.props.control.subControls.length; idx++) {
			const subControl = this.props.control.subControls[idx];
			if (subControl.role === ParamRole.COLUMN || subControl.role === ParamRole.NEW_COLUMN) {
				row.push(field);
			} else if (typeof this.props.control.defaultRow !== "undefined") {
				let defaultRowIndex = idx;
				// defaultRow does not contain the first column field, ex: aggregate.json
				if (this.props.control.subControls.length !== this.props.control.defaultRow.length) {
					defaultRowIndex -= 1;
				}
				const defaultRowValue = this.props.control.defaultRow[defaultRowIndex];
				// if the defaultRow value is a parameterRef, get the property value
				if (defaultRowValue && defaultRowValue.parameterRef) {
					row.push(this.props.controller.getPropertyValue({ name: defaultRowValue.parameterRef }));
				} else {
					row.push(defaultRowValue);
				}
			} else if (subControl.valueDef && subControl.valueDef.defaultValue) {
				// get the defaultValue from the parameter
				if (subControl.valueDef.defaultValue.parameterRef) {
					row.push(this.props.controller.getPropertyValue({ name: subControl.valueDef.defaultValue.parameterRef }));
				} else {
					row.push(subControl.valueDef.defaultValue);
				}
			} else {
				row.push(null);
			}
		}
		return row;
	}

	/**
	* Callback function invoked when closing field picker for structures
	* @param allSelectedFields all fields selected, includes newSelections
	* @param newSelections the newly selected rows
	*/
	onFieldPickerClose(allSelectedFields, newSelections) {
		if (allSelectedFields && newSelections) {
			const newControlValues = [];
			for (const field of allSelectedFields) {
				newControlValues.push(this.getDefaultRow(field));
			}
			this.setCurrentControlValueSelected(newControlValues, newSelections);
		}
	}

	render() {

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "structure-table"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		const tableButtonConfig = {
			fieldPickerCloseFunction: this.onFieldPickerClose
		};

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const disabled = typeof stateDisabled.disabled !== "undefined" || Object.keys(stateDisabled) > 0;

		const table = this.createTable(stateStyle, stateDisabled, tableButtonConfig);
		const content = (
			<div>
				<div id={controlIconContainerClass}>
					{table}
					{icon}
				</div>
				{errorMessage}
			</div>
		);
		const onPanelContainer = this.getOnPanelContainer(this.props.controller.getSelectedRows(this.props.control.name));
		return (
			<div>
				<div className="properties-column-structure">
					<MoveableTableRows
						tableContainer={content}
						control={this.props.control}
						controller={this.props.controller}
						propertyId={this.props.propertyId}
						setScrollToRow={this.setScrollToRow}
						getCurrentControlValue={this.getCurrentControlValue}
						setCurrentControlValueSelected={this.setCurrentControlValueSelected}
						stateStyle={stateStyle}
						disabled={disabled}
					/>
				</div>
				<div>
					{onPanelContainer}
				</div>
			</div>
		);
	}
}

ColumnStructureTableControl.propTypes = {
	buildUIItem: PropTypes.func,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	customContainer: PropTypes.bool,
	intl: intlShape,
	rightFlyout: PropTypes.bool
};

export default injectIntl(ColumnStructureTableControl);
