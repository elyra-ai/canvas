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

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlexibleTable from "./../../components/flexible-table";
import EmptyTable from "../../components/empty-table/empty-table.jsx";
import TableToolbar from "./../../components/table-toolbar";
import AbstractTable from "./../abstract-table.jsx";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import * as PropertyUtils from "./../../util/property-utils";
import { isEmpty } from "lodash";
import classNames from "classnames";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants";

import ReadonlyControl from "./../readonly";

/* eslint max-depth: ["error", 6] */

class SelectColumnsControl extends AbstractTable {

	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.emptyTableButtonClickHandler = this.addOnClick.bind(this, this.props.propertyId);
		this.emptyTableButtonLabel = PropertyUtils.formatMessage(this.reactIntl, MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_LABEL);
	}

	makeRows(controlValue, tableState) {
		const rows = [];
		if (controlValue) {
			for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const columns = [];
				// If the propertyId contains 'row' then this selectcolumns control is part of a table.
				// Need to add an additional 'index' to retrieve the correct value from the control within a table.
				const row = typeof this.props.propertyId.row !== "undefined"
					? { row: this.props.propertyId.row, index: rowIndex }
					: { row: rowIndex };
				const propertyId = Object.assign({}, this.props.propertyId, row);
				const control = Object.assign({}, this.props.control);
				if (control.dmImage) {
					const fields = this.props.controller.getDatasetMetadataFields();
					const value = PropertyUtils.stringifyFieldValue(this.props.controller.getPropertyValue(propertyId), control, true);
					const icon = PropertyUtils.getDMFieldIcon(fields,
						value, control.dmImage);
					control.icon = icon;
				}
				const cellContent = (
					<div className="properties-table-cell-control">
						<ReadonlyControl
							control={control}
							propertyId={propertyId}
							controller={this.props.controller}
							tableControl
						/>
					</div>
				);
				columns.push({
					key: rowIndex + "-0-field",
					column: "field",
					content: cellContent
				});
				rows.push({
					key: rowIndex,
					onClickCallback: this.handleRowClick.bind(this, rowIndex, false),
					columns: columns,
					className: "column-select-table-row"
				});
			}
		}
		return rows;
	}

	/**
	* Callback function invoked when closing field picker
	* @param allSelectedFields all fields selected, includes newSelections
	* @param newSelections the newly selected rows
	*/
	onFieldPickerClose(allSelectedFields, newSelections) {
		if (allSelectedFields && newSelections) {
			this.setCurrentControlValueSelected(allSelectedFields, newSelections);
			const scrollToRow = newSelections[newSelections.length - 1];
			this.setScrollToRow(scrollToRow);
		}
	}

	makeHeader() {
		const headers = [];
		headers.push({
			"key": "field",
			"label": PropertyUtils.formatMessage(this.reactIntl,
				MESSAGE_KEYS.FIELDPICKER_FIELDCOLUMN_LABEL),
			"description": (null) });
		return headers;
	}

	makeTableToolbar() {
		if (this.props.addRemoveRows || this.props.control?.moveableRows) {
			return (
				<TableToolbar
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					selectedRows={this.props.selectedRows}
					tableState={this.props.state}
					addRemoveRows={this.props.addRemoveRows}
					moveableRows={this.props.control?.moveableRows}
					removeSelectedRows={this.removeSelected}
					setScrollToRow={this.setScrollToRow}
					setCurrentControlValueSelected={this.setCurrentControlValueSelected}
					isReadonlyTable={false}
					isSingleSelectTable={false}
					smallFlyout={false}
				/>
			);
		}
		return null;
	}

	render() {
		const hidden = this.props.state === STATES.HIDDEN;
		if (hidden) {
			return null; // Do not render hidden controls
		}
		const headers = this.makeHeader();

		const tableButtonConfig = {
			fieldPickerCloseFunction: this.onFieldPickerClose
		};

		const rows = this.makeRows(this.props.value, this.props.state);
		const tableToolbar = this.makeTableToolbar();
		const topRightPanel = (this.props.selectedRows.length > 0 && tableToolbar) ? tableToolbar : this.makeAddButtonPanel(this.props.state, tableButtonConfig);
		let rowToScrollTo;
		if (Number.isInteger(this.scrollToRow) && rows.length > this.scrollToRow) {
			rowToScrollTo = this.scrollToRow;
			delete this.scrollToRow;
		}
		const tableLabel = (this.props.control.label && this.props.control.label.text) ? this.props.control.label.text : "";
		const tableClassName = classNames("properties-column-select-table", { "disabled": this.props.state === STATES.DISABLED });

		const table =	(
			<FlexibleTable
				enableTanstackTable={this.props.controller.getPropertiesConfig().enableTanstackTable}
				columns={headers}
				data={rows}
				scrollToRow={rowToScrollTo}
				topRightPanel={topRightPanel}
				scrollKey={this.props.control.name}
				tableState={this.props.state}
				messageInfo={this.props.messageInfo}
				rows={this.props.control.rows}
				tableLabel={tableLabel}
				selectedRows={this.props.selectedRows}
				rowSelection={this.props.control.rowSelection}
				updateRowSelections={this.updateRowSelections}
				light={this.props.controller.getLight() && this.props.control.light}
				emptyTablePlaceholder={this.props.control.additionalText}
			/>);

		const content = (
			<div>
				<div className={tableClassName}>
					{table}
				</div>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} propertyId={this.props.propertyId} />
			</div>
		);

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)} className="properties-column-select" >
				{this.props.controlItem}
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
		);
	}
}

SelectColumnsControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	openFieldPicker: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, null)(SelectColumnsControl);
