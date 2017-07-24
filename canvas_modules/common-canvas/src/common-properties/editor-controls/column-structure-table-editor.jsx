/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import { Tr, Td } from "reactable";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Button } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import OneofselectControl from "./oneofselect-control.jsx";
import TextfieldControl from "./textfield-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import remove32 from "../../../assets/images/remove_32.svg";
import remove32hover from "../../../assets/images/remove_32_hover.svg";

var _ = require("underscore");

/* eslint-disable react/prop-types */
/* eslint-enable react/prop-types */
/* eslint complexity: ["error", 12] */

export default class ColumnStructureTableEditor extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			enableRemoveIcon: false,
			hoverRemoveIcon: false,
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
		this.getCellValue = this.getCellValue.bind(this);
		this.updateControlValue = this.updateControlValue.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.onSort = this.onSort.bind(this);
		this.setScrollToRow = this.setScrollToRow.bind(this);
		this.includeInFilter = this.includeInFilter.bind(this);
		this.makeAddRemoveButtonPanel = this.makeAddRemoveButtonPanel.bind(this);
		this.makeLabel = this.makeLabel.bind(this);

		if (this.props.selectedRows && this.props.selectedRows.length > 0) {
			this.scrollToRow = this.props.selectedRows[this.props.selectedRows.length - 1];
			this.alignTop = true;
		}
	}

	componentWillReceiveProps(nextProps) {
		// logger.info("componentWillReceiveProps");
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

	setScrollToRow(row, alignTop) {
		this.scrollToRow = row;
		this.alignTop = alignTop;
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

	getCellValue(rowIndex, colIndex) {
		const controlValue = this.getCurrentControlValue();
		return controlValue[rowIndex][colIndex];
	}

	updateControlValue(ctrlName, value, rowIndex) {
		const controlValue = this.getCurrentControlValue();
		let col = -1;
		for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
			if (this.props.control.subControls[colIndex].name === ctrlName) {
				col = colIndex;
				break;
			}
		}
		this.colIndex = col;
		this.rowIndex = col > -1 ? rowIndex : -1;
		this.skipVal = col > -1 ? controlValue[rowIndex][0] : null;
		if (col > -1) {
			controlValue[rowIndex][col] = value;
			this.props.updateControlValue(this.props.control.name, EditorControl.stringifyStructureStrings(controlValue));
		}
	}

	onFilter(filterString) {
		this.setState({ filterText: filterString });
	}

	onSort(spec) {
		let controlValue = this.getCurrentControlValue();
		let col = -1;
		for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
			if (this.props.control.subControls[colIndex].name === spec.column) {
				col = colIndex;
				break;
			}
		}
		if (col > -1) {
			controlValue = _.sortBy(controlValue, function(row) {
				return row[col];
			});
			if (spec.direction > 0) {
				controlValue = controlValue.reverse();
			}
			this.setCurrentControlValueSelected(this.props.control.name, controlValue, this.props.updateControlValue, []);
		}
	}

	_makeCell(columnDef, controlValue, rowIndex, colIndex, colWidth) {
		let cell;
		let columnStyle = { "width": colWidth, "padding": "0 0 0 0" };
		if (columnDef.controlType === "toggletext" && columnDef.editStyle !== "subpanel") {
			columnStyle = { "width": colWidth, "padding": "8px 0 0px 0" };
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}><ToggletextControl
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
		} else if (columnDef.controlType === "oneofselect" && columnDef.editStyle !== "subpanel") {
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}><OneofselectControl
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
		} else if (columnDef.valueDef.propType === "enum" && columnDef.editStyle !== "subpanel") {
			cell = <Td key={colIndex} column={columnDef.name} style={columnStyle}>this.enumRenderCell(controlValue[rowIndex][colIndex], columnDef)</Td>;
		} else if (columnDef.controlType === "textfield" && columnDef.editStyle !== "subpanel") {
			let retrieveFunc;
			if (rowIndex === this.rowIndex && colIndex === this.colIndex) {
				retrieveFunc = this.props.retrieveValidationErrorMessage;
			}
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}><TextfieldControl
				rowIndex={rowIndex}
				control={this.props.control}
				columnDef={columnDef}
				value={controlValue[rowIndex][colIndex]}
				updateControlValue={this.updateControlValue}
				retrieveValidationErrorMessage={retrieveFunc}
				tableControl
			/></Td>);
		} else {
			const padding = colIndex === 0 ? "6px 0 10px 15px" : "6px 0 10px 0";
			columnStyle = { "width": colWidth, "padding": padding };
			cell = <Td key={colIndex} column={columnDef.name} style={columnStyle}>{controlValue[rowIndex][colIndex]}</Td>;
		}
		return cell;
	}

	/**
	 * Returns true if the given row should be included
	 * in the current filter output.
	 */
	includeInFilter(rowIndex) {
		// If no search text, include all
		if (!this.state.filterText || this.state.filterText.length === 0) {
			return true;
		}
		const controlValue = this.getCurrentControlValue();
		for (let i = 0; i < this.filterFields.length; i++) {
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.name === this.filterFields[i]) {
					const value = controlValue[rowIndex][colIndex];
					if (value.indexOf(this.state.filterText) > -1) {
						return true;
					}
					break;
				}
			}
		}
		return false;
	}

	makeLabel(stateStyle) {
		let label;
		if (this.props.control.label && this.props.control.separateLabel && !this.hasFilter()) {
			if (!(this.props.control.description && this.props.control.description.placement === "on_panel")) {
				let requiredIndicator;
				if (this.props.control.required) {
					requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
				}
				label = (<div className={"label-container"}>
					<label className="control-label" style={stateStyle}>{this.props.control.label.text}</label>
					{requiredIndicator}
				</div>);
			}
		}
	}

	makeAddRemoveButtonPanel() {
		let removeIconImage = (<img src={remove32} />);
		if (this.state.hoverRemoveIcon) {
			removeIconImage = (<img src={remove32hover} />);
		}
		let removeIcon = (<div id="remove-fields-button"
			className="button"
			onClick={this.removeSelected}
			onMouseEnter={this.mouseEnterRemoveButton}
			onMouseLeave={this.mouseLeaveRemoveButton}
			disabled
		>
			{removeIconImage}
		</div>);
		if (this.state.enableRemoveIcon) {
			removeIcon = (<div id="remove-fields-button-enabled"
				className="button"
				onClick={this.removeSelected}
				onMouseEnter={this.mouseEnterRemoveButton}
				onMouseLeave={this.mouseLeaveRemoveButton}
				disabled={false}
			>
				{removeIconImage}
			</div>);
		}
		const addTooltip = <Tooltip id="addFieldTip">Select columns to add</Tooltip>;
		const removeTooltip = <Tooltip id="removeFieldTip">Remove selected columns</Tooltip>;
		return (<div>
			<OverlayTrigger placement="top" overlay={addTooltip}>
				<Button
					id="add-fields-button"
					icon="plus"
					onClick={this.props.openFieldPicker}
					data-control={JSON.stringify(this.props.control)}
				>
					Add Columns
				</Button>
			</OverlayTrigger>
			<OverlayTrigger placement="top" overlay={removeTooltip}>
				{removeIcon}
			</OverlayTrigger>
		</div>);
	}

	createTable() {
		const that = this;
		const rows = [];
		const headers = [];
		const sortFields = [];
		const filterFields = [];
		for (var j = 0; j < this.props.control.subControls.length; j++) {
			const columnDef = this.props.control.subControls[j];
			if (columnDef.visible) {
				if (columnDef.sortable) {
					sortFields.push(columnDef.name);
				}
				headers.push({ "key": columnDef.name, "label": columnDef.label.text, "width": columnDef.width });
				if (columnDef.filterable) {
					filterFields.push(columnDef.name);
				}
			}
		}
		this.filterFields = filterFields;

		const controlValue = this.getCurrentControlValue();
		const columnWidths = FlexibleTable.calculateColumnWidths(headers);
		for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
			const columns = [];
			if (this.includeInFilter(rowIndex)) {
				for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
					const columnDef = this.props.control.subControls[colIndex];
					if (columnDef.visible) {
						columns.push(this._makeCell(columnDef, controlValue, rowIndex, colIndex, columnWidths[colIndex]));
					}
				}
				rows.push(<Tr key={rowIndex} onClick={this.handleRowClick.bind(this, rowIndex)} className={this.getRowClassName(rowIndex)}>{columns}</Tr>);
			}
		}

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
				label={this.makeLabel()}
				topRightPanel={this.makeAddRemoveButtonPanel()}
			/>);
		setTimeout(function() {
			that.scrollToRow = null;
		}, 500);
		return (
			<div>
				{table}
			</div>
		);
	}
}

ColumnStructureTableEditor.propTypes = {};
