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
import { Table, Column, Cell } from "fixed-data-table";
import EditorControl from "./editor-control.jsx";

import SubPanelCell from "../editor-panels/sub-panel-cell.jsx";
import TextRenderer from "../renderers/text-renderer.jsx";
import EnumRenderer from "../renderers/enum-renderer.jsx";

var _ = require("underscore");

/* eslint-disable react/prop-types */
const TextCell = ({ rowIndex, data, col, renderer, props }) => (
	<Cell {...props}>
		{renderer.render(data[rowIndex][col])}
	</Cell>
);

/* eslint-enable react/prop-types */

const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 36;
const CHAR_WIDTH = 8;

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
		this.getSelectedRows = this.getSelectedRows.bind(this);
		this.getSubControlId = this.getSubControlId.bind(this);

		this.handleRowClick = this.handleRowClick.bind(this);
		this.getRowClassName = this.getRowClassName.bind(this);

		this.createTable = this.createTable.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		logger.info("componentWillReceiveProps");
		this.setState({
			controlValue: EditorControl.parseStructureStrings(nextProps.valueAccessor(nextProps.control.name)),
			selectedRows: nextProps.selectedRows
		});
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

	setCurrentControlValue(targetControl, controlValue, updateControlValue) {
		var that = this;
		this.setState({
			controlValue: controlValue,
			selectedRows: []
		}, function() {
			updateControlValue(targetControl, EditorControl.stringifyStructureStrings(controlValue));
			that.props.updateSelectedRows([]);
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

	handleRowClick(evt, rowIndex) {
		const selection = EditorControl.handleTableRowClick(evt, rowIndex, this.state.selectedRows);

		// logger.info(selection);
		this.props.updateSelectedRows(selection);
	}

	getRowClassName(rowIndex) {
		return this.state.selectedRows.indexOf(rowIndex) >= 0
			? "column-structure-allocator-control-row-selected"
			: "";
	}

	createTable() {
		const controlValue = this.getCurrentControlValue();
		let totalWidth = 0;
		const columns = [];

		// Create the columns in the table
		const defaultRenderer = new TextRenderer();
		for (var i = 0; i < this.props.control.subControls.length; i++) {
			const columnDef = this.props.control.subControls[i];
			if (columnDef.visible) {
				const header = <Cell>{columnDef.label.text}</Cell>;
				let renderer = defaultRenderer;
				if (columnDef.valueDef.propType === "enum") {
					renderer = new EnumRenderer(columnDef.values, columnDef.valueLabels, columnDef.valueDef.isList);
				}
				const cell = <TextCell data={controlValue} col={i} renderer={renderer} />;

				totalWidth += (CHAR_WIDTH * columnDef.width);
				columns.push(<Column key={i} header={header} cell={cell} width={CHAR_WIDTH * columnDef.width} />);
			}
		}

		// If the whole row is editable via a sub-panel, add an edit button column
		if (typeof this.props.control.childItem !== "undefined") {
			// Assumes the child item is an "ADDITIONAL_LINK" object.
			// However, we will extract information from the and will create our own Cell-based invoker.
			const buttonWidth = 6;
			const header = <Cell />;
			const subControlId = this.getSubControlId();

			const subItemButton = this.props.buildUIItem(subControlId, this.props.control.childItem, subControlId, this.getEditingRowValue, this.props.dataModel);
			// Hack to decompose the button into our own in-table link
			const cell = (<SubPanelCell data={controlValue}
				col={this.props.control.subControls.length}
				label={subItemButton.props.label}
				title={subItemButton.props.title}
				panel={subItemButton.props.panel}
				notifyStartEditing={this.startEditingRow}
				notifyFinishedEditing={this.stopEditingRow}
			/>);

			totalWidth += (CHAR_WIDTH * buttonWidth);
			columns.push(<Column header={header}
				key={columns.length}
				cell={cell}
				width={CHAR_WIDTH * buttonWidth}
			/>);
		}

		return (
			<div id="fixed-data-table-container">
				<Table id={this.getControlID()}
					className="table-editor"
					headerHeight={HEADER_HEIGHT}
					rowHeight={ROW_HEIGHT}
					rowsCount={controlValue.length}
					width={totalWidth}
					height={180}
					rowClassNameGetter={this.getRowClassName}
					onRowClick={this.handleRowClick} {...this.props}
				>
					{columns}
				</Table>
			</div>
		);
	}
}

StructureTableEditor.propTypes = {};
