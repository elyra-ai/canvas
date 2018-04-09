/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// CONTROL structuretable
import React from "react";
import PropTypes from "prop-types";
import AbstractTable from "./../abstract-table.jsx";
import MoveableTableRows from "./../../components/moveable-table-rows";
import PropertyUtils from "./../../util/property-utils";
import { ParamRole } from "./../../constants/form-constants";
import { injectIntl, intlShape } from "react-intl";
import findIndex from "lodash/findIndex";
import reject from "lodash/reject";
import ControlUtils from "./../../util/control-utils";

class StructureTableControl extends AbstractTable {
	constructor(props) {
		super(props);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.getDefaultRow = this.getDefaultRow.bind(this);
		this.indexOfRow = this.indexOfRow.bind(this);
	}

	indexOfRow(columnName) {
		const keyIndex = this.props.control.keyIndex;
		return findIndex(this.props.controller.getPropertyValue(this.props.propertyId), function(row) {
			return row[keyIndex] === columnName;
		});
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

		const rows = this.props.controller.getPropertyValue(this.props.propertyId).concat(newRows);
		this.setCurrentControlValueSelected(rows);
	}

	removeColumns(columnNames, callback) {

		const rows = this.props.controller.getPropertyValue(this.props.propertyId);
		const keyIndex = this.props.control.keyIndex;

		const newRows = reject(rows, function(val) {
			return columnNames.indexOf(val[keyIndex]) >= 0;
		});
		this.setCurrentControlValueSelected(newRows);
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
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

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

StructureTableControl.propTypes = {
	buildUIItem: PropTypes.func,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	intl: intlShape,
	rightFlyout: PropTypes.bool
};

export default injectIntl(StructureTableControl);
