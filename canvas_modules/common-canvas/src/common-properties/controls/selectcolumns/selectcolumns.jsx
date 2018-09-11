/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import FlexibleTable from "./../../components/flexible-table";
import MoveableTableRows from "./../../components/moveable-table-rows";
import AbstractTable from "./../abstract-table.jsx";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { TABLE_SCROLLBAR_WIDTH, STATES } from "./../../constants/constants";

import ReadonlyControl from "./../readonly";

export default class SelectColumns extends AbstractTable {

	getRowClassName(rowIndex) {
		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		return selectedRows.indexOf(rowIndex) >= 0
			? "column-select-table-row column-select-table-selected-row "
			: "column-select-table-row";
	}


	makeRows(controlValue, tableState) {
		const rows = [];
		if (controlValue) {
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const columns = [];
				const propertyId = {
					name: this.props.propertyId.name,
					row: rowIndex
				};
				const cellContent = (
					<div className="properties-table-cell-control">
						<ReadonlyControl
							control={this.props.control}
							propertyId={propertyId}
							controller={this.props.controller}
							tableControl
						/>
					</div>
				);
				columns.push({
					key: rowIndex + "-0-field",
					column: "name",
					content: cellContent
				});
				// add padding for scrollbar
				columns.push({
					column: "scrollbar",
					width: TABLE_SCROLLBAR_WIDTH,
					content: <div />
				});
				rows.push({
					key: rowIndex,
					onClickCallback: this.handleRowClick.bind(this, rowIndex, false),
					columns: columns,
					className: this.getRowClassName(rowIndex)
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
		}
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const tableState = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);

		const sortFields = [];
		const headers = [];
		const filterFields = [];

		const tableButtonConfig = {
			fieldPickerCloseFunction: this.onFieldPickerClose
		};

		const rows = this.makeRows(controlValue, tableState);
		const topRightPanel = this.makeAddRemoveButtonPanel(tableState, tableButtonConfig);

		const table =	(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				showHeader={false}
				scrollToRow={this.scrollToRow}
				alignTop={this.alignTop}
				onFilter={this.onFilter}
				onSort={this.onSort}
				topRightPanel={topRightPanel}
				scrollKey={this.props.control.name}
				tableState={tableState}
				messageInfo={messageInfo}
				rows={this.props.control.rows}
				controller={this.props.controller}
			/>);

		var content = (
			<div>
				<div className="properties-column-select-table">
					{table}
				</div>
				<ValidationMessage state={tableState} messageInfo={messageInfo} />
			</div>
		);

		return (
			<div data-id={ControlUtils.getDataId(this.props.propertyId)} className="properties-column-select" >
				<MoveableTableRows
					tableContainer={content}
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					setScrollToRow={this.setScrollToRow}
					setCurrentControlValueSelected={this.setCurrentControlValueSelected}
					disabled={tableState === STATES.DISABLED}
				/>
			</div>
		);
	}
}

SelectColumns.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
};
