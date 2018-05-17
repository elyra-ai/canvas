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
import { injectIntl, intlShape } from "react-intl";
import ControlUtils from "./../../util/control-utils";
import PropertyUtils from "./../../util/property-utils";
import { TABLE_SCROLLBAR_WIDTH } from "./../../constants/constants";

class SelectColumns extends AbstractTable {

	getRowClassName(rowIndex) {
		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		return selectedRows.indexOf(rowIndex) >= 0
			? "column-select-table-row column-select-table-selected-row "
			: "column-select-table-row";
	}


	makeRows(controlValue, stateStyle) {
		const rows = [];
		if (controlValue) {
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const columns = [];
				const cellContent = PropertyUtils.stringifyFieldValue(controlValue[rowIndex], this.props.control);
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
					onClickCallback: this.handleRowClick.bind(this, rowIndex),
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
		const sortFields = [];
		const headers = [];
		const filterFields = [];

		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "column-select"
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

		let controlIconContainerClass = "column-select-control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "column-select-control-icon-container-enabled";
		}

		if (messageType === "error" || messageType === "warning") {
			stateStyle.borderWidth = "2px";
		}

		const disabled = typeof stateDisabled.disabled !== "undefined" || Object.keys(stateDisabled) > 0;

		const rows = this.makeRows(controlValue, stateStyle);
		const topRightPanel = this.makeAddRemoveButtonPanel(stateDisabled, tableButtonConfig);

		const table =	(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				scrollToRow={this.scrollToRow}
				alignTop={this.alignTop}
				onFilter={this.onFilter}
				onSort={this.onSort}
				label={this.makeLabel(stateStyle)}
				topRightPanel={topRightPanel}
				icon={icon}
				validationStyle={stateStyle}
				scrollKey={this.props.control.name}
				stateDisabled={stateDisabled}
				rows={this.props.control.rows}
			/>);

		var content = (
			<div>
				<div id={controlIconContainerClass}>
					{table}
				</div>
				{errorMessage}
			</div>
		);

		return (
			<div className="properties-column-select" style={stateStyle}>
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
		);
	}
}

SelectColumns.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	intl: intlShape
};

export default injectIntl(SelectColumns);
