/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import { Tr, Td } from "reactable";
import EditorControl from "./editor-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import OneofselectControl from "../editor-controls/oneofselect-control.jsx";
import FlexibleTable from "./flexible-table.jsx";

var _ = require("underscore");

/* eslint-disable react/prop-types */
/* eslint-enable react/prop-types */
/* eslint complexity: ["error", 12] */

export default class StructureTableEditor extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: EditorControl.parseStructureStrings(props.valueAccessor(props.control.name)),
			selectedRows: this.props.selectedRows
		};

		this._editing_row = 0;
		this._subControlId = "___" + props.control.name + "_";

		this.getEditingRow = this.getEditingRow.bind(this);
		this.startEditingRow = this.startEditingRow.bind(this);
		this.getEditingRowValue = this.getEditingRowValue.bind(this);
		this.indexOfColumn = this.indexOfColumn.bind(this);

		this.getControlValue = this.getControlValue.bind(this);
		this.getCurrentControlValue = this.getCurrentControlValue.bind(this);
		this.setCurrentControlValue = this.setCurrentControlValue.bind(this);
		this.setCurrentControlValueSelected = this.setCurrentControlValueSelected.bind(this);
		this.getSelectedRows = this.getSelectedRows.bind(this);
		this.getSubControlId = this.getSubControlId.bind(this);

		this.handleRowClick = this.handleRowClick.bind(this);
		this.getRowClassName = this.getRowClassName.bind(this);
		this.enumRenderCell = this.enumRenderCell.bind(this);

		this.createTable = this.createTable.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		logger.info("componentWillReceiveProps");
		this.setState({
			controlValue: EditorControl.parseStructureStrings(nextProps.valueAccessor(nextProps.control.name)),
			selectedRows: nextProps.selectedRows
		});
		this.selectionChanged(nextProps.selectedRows);
	}

	/* Returns the public representation of the control value. */
	getControlValue() {
		logger.info("getControlValue()");
		logger.info(EditorControl.stringifyStructureStrings(this.state.controlValue));
		return EditorControl.stringifyStructureStrings(this.state.controlValue);
	}

	/* Returns the current internal representation of the control value. */
	getCurrentControlValue() {
		return this.state.controlValue;
	}

	setCurrentControlValueSelected(targetControl, controlValue, updateControlValue, selectedRows) {
		var that = this;
		this.setState({
			controlValue: controlValue,
			selectedRows: selectedRows
		}, function() {
			updateControlValue(targetControl, EditorControl.stringifyStructureStrings(controlValue));
			that.updateSelectedRows(that.props.control.name, selectedRows);
		});
	}

	setCurrentControlValue(targetControl, controlValue, updateControlValue) {
		var that = this;
		this.setState({
			controlValue: controlValue,
			selectedRows: []
		}, function() {
			updateControlValue(targetControl, EditorControl.stringifyStructureStrings(controlValue));
			that.updateSelectedRows(that.props.control.name, []);
		});
	}

	getSelectedRows() {
		return this.state.selectedRows;
	}

	getSubControlId() {
		return this._subControlId;
	}

	getEditingRow() {
		return this._editing_row;
	}

	startEditingRow(rowIndex) {
		this._editing_row = rowIndex;
	}

	getEditingRowValue(controlId) {
		// logger.info("***** getEditingRowValue: controlId=" + controlId);

		const col = this.indexOfColumn(controlId);
		const columnControl = this.props.control.subControls[col];
		// List are represented as JSON format strings so need to convert those
		// to an array of strings
		const value = this.getCurrentControlValue()[this.getEditingRow()][col];
		// logger.info("***** value=" + value);
		if (columnControl.valueDef.isList === true) {
			return JSON.parse(value);
		}
		return [value];
	}

	indexOfColumn(controlId) {
		return _.findIndex(this.props.control.subControls, function(columnControl) {
			return columnControl.name === controlId;
		});
	}

	handleRowClick(rowIndex, evt) {
		const selection = EditorControl.handleTableRowClick(evt, rowIndex, this.state.selectedRows);
		// logger.info(selection);
		this.updateSelectedRows(this.props.control.name, selection);
	}

	updateSelectedRows(ctrlName, selection) {
		this.props.updateSelectedRows(ctrlName, selection);
		this.selectionChanged(selection);
	}

	selectionChanged(selection) {
		// A no-op in this class
	}

	getRowClassName(rowIndex) {
		return this.state.selectedRows.indexOf(rowIndex) >= 0
			// ? "column-structure-allocator-control-row-selected"
			? "table-selected-row"
			: "";
	}

	enumRenderCell(value, columnDef) {
		const valuesMap = {};
		for (let i = 0; i < columnDef.values.length; ++i) {
			valuesMap[columnDef.values[i]] = columnDef.valueLabels[i];
		}

		if (columnDef.valueDef.isList) {
			const parsedValues = JSON.parse(value);
			let multiRendered = "[";
			for (let i = 0; i < parsedValues.length; ++i) {
				const rawval = parsedValues[i];
				if (i > 0) {
					multiRendered += ",";
				}
				const val = valuesMap[rawval];
				if (typeof val === "undefined") {
					multiRendered += "<" + rawval + ">";
				} else {
					multiRendered += val;
				}
			}
			return multiRendered + "]";
		}
		const rendered = valuesMap[value];
		if (typeof rendered === "undefined") {
			return "<" + value + ">";
		}
		return rendered;
	}

	createTable() {
		var rows = [];
		const controlValue = this.getCurrentControlValue();
		for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
			var columns = [];
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.visible) {
					var cell;

					if (columnDef.controlType === "toggletext") {
						cell = (<Td column={columnDef.name}><ToggletextControl
							rowIndex={rowIndex}
							control={this.props.control}
							values={columnDef.values}
							valueLabels={columnDef.valueLabels}
							valueIcons={columnDef.valueIcons}
							controlValue={controlValue}
							value={controlValue[rowIndex][colIndex]}
							updateControlValue={this.props.updateControlValue}
							columnIndex={colIndex}
							setCurrentControlValueSelected={this.setCurrentControlValueSelected}
							getSelectedRows={this.getSelectedRows}
							tableControl
						/></Td>);
					} else if (columnDef.controlType === "oneofselect") {
						cell = (<Td column={columnDef.name}><OneofselectControl
							rowIndex={rowIndex}
							control={this.props.control}
							columnDef={columnDef}
							controlValue={controlValue}
							value={controlValue[rowIndex][colIndex]}
							updateControlValue={this.props.updateControlValue}
							columnIndex={colIndex}
							setCurrentControlValueSelected={this.setCurrentControlValueSelected}
							selectedRows={this.getSelectedRows()}
							tableControl
						/></Td>);
					} else if (columnDef.valueDef.propType === "enum") {
						cell = <Td column={columnDef.name}>this.enumRenderCell(controlValue[rowIndex][colIndex], columnDef)</Td>;
					} else {
						cell = <Td column={columnDef.name}>{controlValue[rowIndex][colIndex]}</Td>;
					}
					columns.push(cell);
				}
			}
			rows.push(<Tr key={rowIndex} onClick={this.handleRowClick.bind(this, rowIndex)} className={this.getRowClassName(rowIndex)}>{columns}</Tr>);
		}


		var headers = [];
		var sortFields = [];
		var filterFields = [];
		for (var j = 0; j < this.props.control.subControls.length; j++) {
			const columnDef = this.props.control.subControls[j];
			if (columnDef.visible) {
				if (columnDef.isSortable) {
					sortFields.push(columnDef.name);
				}
				headers.push({ "key": columnDef.name, "label": columnDef.label.text });
				if (columnDef.isFilterable) {
					filterFields.push(columnDef.name);
				}
			}
		}

		const selected = this.getSelectedRows().sort();
		const table = ((typeof selected !== "undefined" && selected.length !== 0)
		? <FlexibleTable
			sortable={sortFields}
			filterable={filterFields}
			columns={headers}
			data={rows}
			scrollToRow={selected[selected.length - 1]}
		/>
		: <FlexibleTable
			sortable={sortFields}
			filterable={filterFields}
			columns={headers}
			data={rows}
		/>);

		return (
			<div>
				{table}
			</div>
		);
	}
}

StructureTableEditor.propTypes = {};
