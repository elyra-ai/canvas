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
import { Tr, Td } from "reactable";
import FlexibleTable from "./flexible-table.jsx";
import MoveableTableRows from "./moveable-table-rows.jsx";
import ColumnStructureTableEditor from "./column-structure-table-editor.jsx";
import { injectIntl, intlShape } from "react-intl";
import ControlUtils from "../util/control-utils";

class ColumnSelectControl extends ColumnStructureTableEditor {

	getRowClassName(rowIndex) {
		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		return selectedRows.indexOf(rowIndex) >= 0
			? "column-select-table-row column-select-table-selected-row "
			: "column-select-table-row";
	}


	makeRows(controlValue, stateStyle) {
		const rows = [];
		var cell;
		var columns = [];
		if (controlValue) {
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				columns = [];
				const cellContent = controlValue[rowIndex];
				cell = (<Td key={0} column={"name"} className="column-select-table-cell">{cellContent}</Td>);
				columns.push(cell);
				columns.push(<Td key={columns.length} column={"scrollbar"} style={{ "width": "7px" }}><div /></Td>);
				rows.push(<Tr key={rowIndex} onClick={this.handleRowClick.bind(this, rowIndex)} className={this.getRowClassName(rowIndex)} style={stateStyle}>{columns}</Tr>);
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
					getCurrentControlValue={this.getCurrentControlValue}
					setCurrentControlValueSelected={this.setCurrentControlValueSelected}
					stateStyle={stateStyle}
					disabled={disabled}
				/>
			</div>
		);
	}
}

ColumnSelectControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	intl: intlShape
};

export default injectIntl(ColumnSelectControl);
