/*
 * Copyright 2017-2025 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// CONTROL structuretable
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AbstractTable from "./../abstract-table.jsx";
import EmptyTable from "../../components/empty-table/empty-table.jsx";
import * as PropertyUtils from "./../../util/property-utils";
import { Type, ParamRole } from "./../../constants/form-constants";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants";
import classNames from "classnames";
import ValidationMessage from "./../../components/validation-message";
import { reject, findIndex, cloneDeep, isEmpty } from "lodash";
import * as ControlUtils from "./../../util/control-utils";

class StructureTableControl extends AbstractTable {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.getDefaultRow = this.getDefaultRow.bind(this);
		this.indexOfRow = this.indexOfRow.bind(this);
		this.emptyTableButtonClickHandler = this.addOnClick.bind(this, this.props.propertyId);
		this.emptyTableButtonLabel = PropertyUtils.formatMessage(this.reactIntl, MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_LABEL);
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
				const newRow = cloneDeep(this.props.control.defaultRow);

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
		if (this.props.value && field) {
			const dataColumnIndex = PropertyUtils.getTableFieldIndex(this.props.control);
			for (let i = 0; i < this.props.value.length; i++) {
				const fieldValue = this.props.value[i][dataColumnIndex];
				if (fieldValue === field || this.props.value[i] === field) {
					return this.props.value[i];
				}
			}
		}

		for (let idx = 0; idx < this.props.control.subControls.length; idx++) {
			const subControl = this.props.control.subControls[idx];
			if (subControl.role === ParamRole.COLUMN) {
				row.push(field);
			} else if (subControl.role === ParamRole.NEW_COLUMN) {
				row.push(PropertyUtils.stringifyFieldValue(field, subControl).replace(".", "_"));
			} else if (typeof subControl.dmDefault !== "undefined") {
				row.push(PropertyUtils.getDMDefault(subControl, field, this.props.controller.getDatasetMetadataFields()));
			} else if (typeof this.props.control.defaultRow !== "undefined") {
				let defaultRowIndex = idx;
				// defaultRow does not contain the first column field, ex: aggregate.json
				if (this.props.control.subControls.length !== this.props.control.defaultRow.length) {
					defaultRowIndex -= 1;
				}
				const defaultRowValue = this.props.control.defaultRow[defaultRowIndex];
				if (this.props.control.subControls[defaultRowIndex].valueDef.propType === Type.STRUCTURE) {
					row.push([]); // nested structure will default to an empty array
				} else if (defaultRowValue && defaultRowValue.parameterRef) {
					// if the defaultRow value is a parameterRef, get the property value
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
			const scrollToRow = newSelections[newSelections.length - 1];
			this.setScrollToRow(scrollToRow);
		}
	}

	render() {
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
		const tableButtonConfig = {
			fieldPickerCloseFunction: this.onFieldPickerClose
		};

		const customButtons = this.props.control && this.props.control.buttons;
		const table = this.createTable(this.props.state, tableButtonConfig, customButtons);
		const tableClassName = classNames("properties-st properties-st-buttons", { "disabled": this.props.state === STATES.DISABLED });
		const content = (
			<div>
				<div className={tableClassName}>
					{table}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} propertyId={this.props.propertyId} />
			</div>);

		const onPanelContainer = this.getOnPanelContainer(this.props.selectedRows);

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className="properties-column-structure-wrapper"
			>
				<div className="properties-column-structure">
					{
						isEmpty(this.props.value) && this.props.addRemoveRows
							? <EmptyTable
								control={this.props.control}
								controller={this.props.controller}
								emptyTableButtonLabel={this.emptyTableButtonLabel}
								emptyTableButtonClickHandler={this.emptyTableButtonClickHandler}
								disabled={this.props.state === STATES.DISABLED}
							/>
							: content
					}
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
	rightFlyout: PropTypes.bool,
	selectedRows: PropTypes.array, // set by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	addRemoveRows: PropTypes.bool, // set by redux
	tableButtons: PropTypes.object // set in by redux
};


const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	selectedRows: ownProps.controller.getSelectedRows(ownProps.propertyId),
	addRemoveRows: ownProps.controller.getAddRemoveRows(ownProps.propertyId),
	tableButtons: ownProps.controller.getTableButtons(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(StructureTableControl);
