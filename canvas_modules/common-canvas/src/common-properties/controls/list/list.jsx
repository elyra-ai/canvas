/*
 * Copyright 2020 IBM Corporation
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
import NumberfieldControl from "./../numberfield";
import TextfieldControl from "./../textfield";
import AbstractTable from "./../abstract-table.jsx";
import FlexibleTable from "./../../components/flexible-table";
import MoveableTableRows from "./../../components/moveable-table-rows";
import ValidationMessage from "./../../components/validation-message";
import { formatMessage } from "./../../util/property-utils";
import { getDataId } from "./../../util/control-utils";
import { TABLE_SCROLLBAR_WIDTH, MESSAGE_KEYS, STATES } from "./../../constants/constants.js";
import { Type } from "./../../constants/form-constants.js";

const NUMBER_TYPES = [Type.INTEGER, Type.DOUBLE, Type.LONG];
class ListControl extends AbstractTable {
	constructor(props) {
		super(props);
		this.addRow = this.addRow.bind(this);
		this.reactIntl = props.controller.getReactIntl();
	}

	addRow() {
		const controlPropType = this.props.controller.getControlPropType(this.props.propertyId);
		const newRow = NUMBER_TYPES.indexOf(controlPropType) > -1 ? null : "";
		const rows = this.props.controller.getPropertyValue(this.props.propertyId).concat([newRow]);
		this.setCurrentControlValueSelected(rows);
	}

	makeCell(control, propertyId, controlPropType) {
		if (NUMBER_TYPES.indexOf(controlPropType) > -1) {
			return (<div className="properties-table-cell-control">
				<NumberfieldControl
					control={control}
					propertyId={propertyId}
					controller={this.props.controller}
					tableControl
				/>
			</div>);
		}
		return (<div className="properties-table-cell-control">
			<TextfieldControl
				control={control}
				propertyId={propertyId}
				controller={this.props.controller}
				tableControl
			/>
		</div>);
	}

	makeRows(controlValue, tableState) {
		const rows = [];
		if (controlValue) {
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const columns = [];
				const row = { row: rowIndex };
				const propertyId = Object.assign({}, this.props.propertyId, row);
				const controlPropType = this.props.controller.getControlPropType(propertyId);
				const control = {};
				const cellContent = this.makeCell(control, propertyId, controlPropType);
				columns.push({
					key: rowIndex + "-0-value",
					column: "value",
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
					className: "list-table-row"
				});
			}
		}
		return rows;
	}

	makeHeader() {
		const headers = [];
		headers.push({
			"key": "value",
			"label": formatMessage(this.reactIntl, MESSAGE_KEYS.LIST_TABLE_LABEL),
			"description": (null) });
		headers.push({ "key": "scrollbar", "label": "", "width": TABLE_SCROLLBAR_WIDTH });
		return headers;
	}

	render() {
		const headers = this.makeHeader();

		const tableButtonConfig = {
			addButtonLabel: formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_LABEL),
			removeButtonTooltip: formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_REMOVEBUTTON_TOOLTIP),
			addButtonTooltip: formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.STRUCTURELISTEDITOR_ADDBUTTON_TOOLTIP),
			addButtonFunction: this.addRow
		};

		const rows = this.makeRows(this.props.value, this.props.state);
		const topRightPanel = this.makeAddRemoveButtonPanel(this.props.state, tableButtonConfig);
		let rowToScrollTo;
		if (Number.isInteger(this.scrollToRow) && rows.length > this.scrollToRow) {
			rowToScrollTo = this.scrollToRow;
			delete this.scrollToRow;
		}
		const table =	(
			<FlexibleTable
				columns={headers}
				data={rows}
				scrollToRow={rowToScrollTo}
				topRightPanel={topRightPanel}
				scrollKey={this.props.control.name}
				tableState={this.props.state}
				messageInfo={this.props.messageInfo}
				rows={this.props.control.rows}
				controller={this.props.controller}
				selectedRows={this.props.selectedRows}
				rowSelection={this.props.control.rowSelection}
				updateRowSelections={this.updateRowSelections}
			/>);

		const tableContainer = (<div>
			<div className="properties-list-table">
				{table}
			</div>
			<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} />
		</div>);

		return (
			<div data-id={getDataId(this.props.propertyId)} className="properties-list-control" >
				<MoveableTableRows
					tableContainer={tableContainer}
					control={this.props.control}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					setScrollToRow={this.setScrollToRow}
					setCurrentControlValueSelected={this.setCurrentControlValueSelected}
					disabled={this.props.state === STATES.DISABLED}
				/>
			</div>
		);
	}
}

ListControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	selectedRows: PropTypes.array, // set by redux
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	selectedRows: ownProps.controller.getSelectedRows(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ListControl);
