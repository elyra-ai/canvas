/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import logger from "../../../utils/logger";
import React from "react";
import ReactTooltip from "react-tooltip";
import { Tr, Td } from "reactable";
import { Button } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import OneofselectControl from "./oneofselect-control.jsx";
import TextfieldControl from "./textfield-control.jsx";
import CheckboxControl from "./checkbox-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import PropertyUtils from "../util/property-utils.js";
import SubPanelCell from "../editor-panels/sub-panel-cell.jsx";
import remove32 from "../../../assets/images/remove_32.svg";
import remove32hover from "../../../assets/images/remove_32_hover.svg";
import remove32disabled from "../../../assets/images/remove_32_disabled.svg";
import { TOOL_TIP_DELAY } from "../constants/constants.js";

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
			controlValue: props.valueAccessor(props.control.name),
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
		this.populateFieldData = this.populateFieldData.bind(this);
		this.getDefaultSubControlValue = this.getDefaultSubControlValue.bind(this);
		this.indexOfField = this.indexOfField.bind(this);
		this.getDMDefault = this.getDMDefault.bind(this);
		this.buildChildItem = this.buildChildItem.bind(this);
		this.makeCells = this.makeCells.bind(this);

		if (this.props.selectedRows && this.props.selectedRows.length > 0) {
			this.scrollToRow = this.props.selectedRows[this.props.selectedRows.length - 1];
			this.alignTop = true;
		}
	}

	componentWillMount() {
		// augment controlValues with data model fields if appropriate
		let controlValue = this.getCurrentControlValue();
		if (this.props.control.noPickColumns) {
			// When not picking columns, we need always to ensure that the field array is complete and current
			controlValue = this.populateFieldData(controlValue);
			this.setState({
				controlValue: controlValue
			});
		}
	}


	componentWillReceiveProps(nextProps) {
		// logger.info("componentWillReceiveProps");
		// augment controlValues with data model fields if appropriate
		let controlValue = nextProps.valueAccessor(nextProps.control.name);
		if (this.props.control.noPickColumns) {
			// When not picking columns, we need always to ensure that the field array is complete and current
			controlValue = this.populateFieldData(controlValue);
		}
		this.setState({
			controlValue: controlValue,
			selectedRows: nextProps.selectedRows
		});
		this.selectionChanged(nextProps.selectedRows);
	}

	/* Returns the public representation of the control value. */
	getControlValue() {
		// logger.info(this.state.controlValue);
		return this.state.controlValue;
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
			updateControlValue(targetControl, controlValue);
			that.updateSelectedRows(that.props.control.name, selectedRows);
		});
	}

	setCurrentControlValue(targetControl, controlValue, updateControlValue) {
		var that = this;
		this.setState({
			controlValue: controlValue,
			selectedRows: []
		}, function() {
			updateControlValue(targetControl, controlValue);
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
		// List are represented as JSON format strings so need to convert those
		// to an array of strings
		const value = this.getCurrentControlValue()[this.getEditingRow()][col];
		// logger.info("***** value=" + value);
		return value;
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
			? "table-row table-selected-row "
			: "table-row";
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
		if (col > -1) {
			this.rowIndex = rowIndex;
			this.colIndex = col;
			controlValue[rowIndex][col] = value;
			this.props.updateControlValue(this.props.control.name, controlValue);
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

	_makeCell(columnDef, controlValue, rowIndex, colIndex, colWidth, stateStyle, stateDisabled) {
		let cell;
		let columnStyle = { "width": colWidth, "padding": "0 0 0 0" };
		const disabled = this._getDisabledStatus(rowIndex, colIndex, stateDisabled);
		const hidden = this._getHiddenStatus(rowIndex, colIndex, stateStyle);
		if (columnDef.controlType === "toggletext" && columnDef.editStyle !== "subpanel") {
			columnStyle = { "width": colWidth, "padding": "8px 0 0px 0" };
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}><ToggletextControl
				rowIndex={rowIndex}
				control={this.props.control}
				columnDef={columnDef}
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
				disabled={disabled}
				hidden={hidden}
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
				disabled={disabled}
				hidden={hidden}
			/></Td>);
		} else if (columnDef.valueDef.propType === "enum" && columnDef.editStyle !== "subpanel") {
			cell = <Td key={colIndex} column={columnDef.name} style={columnStyle}>this.enumRenderCell(controlValue[rowIndex][colIndex], columnDef)</Td>;
		} else if (columnDef.controlType === "textfield" && columnDef.editStyle !== "subpanel") {
			let retrieveFunc;
			const errorState = this.getTableErrorState(rowIndex, colIndex);
			if (PropertyUtils.toType(errorState) === "object") {
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
				disabled={disabled}
				hidden={hidden}
			/></Td>);
		} else if (columnDef.valueDef.propType === "boolean" && columnDef.editStyle !== "subpanel") {
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}><CheckboxControl
				rowIndex={rowIndex}
				columnIndex={colIndex}
				control={this.props.control}
				columnDef={columnDef}
				controlValue={controlValue}
				value={controlValue[rowIndex][colIndex]}
				updateControlValue={this.props.updateControlValue}
				setCurrentControlValueSelected={this.setCurrentControlValueSelected}
				selectedRows={this.getSelectedRows()}
				tableControl
				disabled={disabled}
				hidden={hidden}
			/></Td>);
		} else {
			const padding = colIndex === 0 ? "6px 0 10px 15px" : "6px 0 10px 0";
			columnStyle = { "width": colWidth, "padding": padding };
			// workaround adding span show column shows up when no data is in cell
			let cellContent = controlValue[rowIndex][colIndex];
			if (Array.isArray(cellContent)) {
				cellContent = cellContent.join(", ");
			}
			cell = <Td key={colIndex} column={columnDef.name} style={columnStyle}><span>{cellContent}</span></Td>;
		}
		return cell;
	}

	_getDisabledStatus(rowIndex, colIndex, stateDisabled) {
		const row = stateDisabled[rowIndex];
		if (row) {
			const column = row[colIndex];
			if (column) {
				return column.disabled;
			}
		}
		return false;
	}

	_getHiddenStatus(rowIndex, colIndex, stateStyle) {
		const row = stateStyle[rowIndex];
		if (row) {
			const column = row[colIndex];
			if (column) {
				return column.visibility === "hidden";
			}
		}
		return false;
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
					if (value.toLowerCase().indexOf(this.state.filterText.toLowerCase()) > -1) {
						return true;
					}
					break;
				}
			}
		}
		return false;
	}

	makeLabel() {
		let label;
		if (this.props.control.label && this.props.control.separateLabel && !this.hasFilter()) {
			if (!(this.props.control.description && this.props.control.description.placement === "on_panel")) {
				let requiredIndicator;
				if (this.props.control.required) {
					requiredIndicator = <span className="required-control-indicator">*</span>;
				}
				const tooltipId = "tooltip-" + this.props.control.name;
				let tooltip;
				if (this.props.control.description) {
					tooltip = this.props.control.description.text;
				}
				label = (<div className={"label-container"}>
					<div className="properties-tooltips-container" data-tip={tooltip} data-for={tooltipId}>
						<label className="control-label">{this.props.control.label.text}</label>
						{requiredIndicator}
					</div>
					<ReactTooltip
						id={tooltipId}
						place="right"
						type="light"
						effect="solid"
						border
						className="properties-tooltips"
						delayShow={TOOL_TIP_DELAY}
					/>
				</div>
				);
			}
		}
		return label;
	}

	populateFieldData(controlValue) {
		const rowData = [];
		const dm = this.props.dataModel;
		const updateCells = [];
		for (var i = 0; i < dm.fields.length; i++) {
			const row = [];
			const fieldIndex = this.indexOfField(dm.fields[i].name, controlValue);
			for (var k = 0; k < this.props.control.subControls.length; k++) {
				if (k === this.props.control.keyIndex) {
					row.push(dm.fields[i].name);
				} else if (fieldIndex > -1 && controlValue.length > i && controlValue[i].length > k) {
					row.push(controlValue[i][k]);
				} else {
					row.push(this.getDefaultSubControlValue(k, dm.fields[i].name));
					updateCells.push([i, k]);
				}
			}
			rowData.push(row);
		}
		return rowData;
	}


	getDefaultSubControlValue(col, fieldName) {
		let val;
		const subControl = this.props.control.subControls[col];
		if (PropertyUtils.toType(subControl.valueDef.defaultValue) !== "undefined") {
			val = subControl.valueDef.defaultValue;
		} else if (PropertyUtils.toType(subControl.dmDefault) !== "undefined") {
			val = this.getDMDefault(subControl, fieldName);
		} else if (subControl.values) {
			val = subControl.values[0];
		} else if (subControl.valueDef.propType === "string") {
			val = "";
		} else if (subControl.valueDef.propType === "boolean") {
			val = false;
		} else if (subControl.valueDef.propType === "enum") {
			val = subControl.values[0];
		} else if (subControl.valueDef.propType === "integer" ||
								subControl.valueDef.propType === "long" ||
								subControl.valueDef.propType === "double") {
			val = 0;
		} else {
			val = null;
		}
		return val;
	}

	getDMDefault(subControlDef, fieldName) {
		let defaultValue;
		const dmField = subControlDef.dmDefault;
		if (fieldName) {
			for (let i = 0; i < this.props.dataModel.fields.length; i++) {
				if (this.props.dataModel.fields[i].name === fieldName) {
					switch (dmField) {
					case "type":
						defaultValue = this.props.dataModel.fields[i].type;
						break;
					case "description":
						defaultValue = this.props.dataModel.fields[i].description;
						break;
					case "measure":
						defaultValue = this.props.dataModel.fields[i].measure;
						break;
					case "modeling_role":
						defaultValue = this.props.dataModel.fields[i].modeling_role;
						break;
					default:
						break;
					}
					break;
				}
			}
		}
		return defaultValue;
	}

	indexOfField(fieldName, controlValue) {
		for (var i = 0; i < controlValue.length; i++) {
			if (controlValue[i][0] === fieldName) {
				return i;
			}
		}
		return -1;
	}

	makeAddRemoveButtonPanel() {
		if (this.props.control.noPickColumns) {
			return (<div />);
		}
		let removeFieldsButtonId = "remove-fields-button-enabled";
		let removeIconImage = (<img src={remove32} />);
		if (!this.state.enableRemoveIcon) {
			removeIconImage = (<img src={remove32disabled} />);
			removeFieldsButtonId = "remove-fields-button-disabled";
		} else if (this.state.hoverRemoveIcon) {
			removeIconImage = (<img src={remove32hover} />);
		}

		const removeIcon = (<div id={removeFieldsButtonId}
			className="button"
			onClick={this.removeSelected}
			onBlur={this.validateInput}
			onMouseEnter={this.mouseEnterRemoveButton}
			onMouseLeave={this.mouseLeaveRemoveButton}
			disabled
		>
			{removeIconImage}
		</div>);

		const tooltipId = "tooltip-add-remove-columns-" + this.props.control.name;
		return (<div>
			<div id="field-picker-buttons-container">
				<div className="properties-tooltips-container add-remove-columns" data-tip="Remove selected columns" data-for={tooltipId}>
					{removeIcon}
				</div>
				<div className="properties-tooltips-container add-remove-columns" data-tip="Select columns to add" data-for={tooltipId}>
					<Button
						id="add-fields-button"
						icon="plus"
						onClick={this.props.openFieldPicker}
						data-control={JSON.stringify(this.props.control)}
					>
						Add Columns
					</Button>
				</div>
			</div>
			<ReactTooltip
				id={tooltipId}
				place="top"
				type="light"
				effect="solid"
				border
				className="properties-tooltips"
				delayShow={TOOL_TIP_DELAY}
			/>
		</div>);
	}

	createTable(stateStyle, stateDisabled) {
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
				headers.push({
					"key": columnDef.name,
					"label": columnDef.label.text,
					"width": columnDef.width,
					"editStyle": columnDef.editStyle,
					"controlType": columnDef.controlType,
					"description": (columnDef.description ? columnDef.description.text : null) });
				if (columnDef.filterable) {
					filterFields.push(columnDef.name);
				}
			}
		}
		if (this.props.control.childItem) {
			// default to 6 but this might need to be calculated
			headers.push({ "key": "edit", "label": "", "width": 6 });
		}
		this.filterFields = filterFields;

		const controlValue = this.getCurrentControlValue();
		// calculate for all columns except the last which is used for the scroll bar
		const columnWidths = FlexibleTable.calculateColumnWidths(headers, 100);
		this.makeCells(rows, controlValue, columnWidths, stateStyle, stateDisabled);

		if (this.props.customContainer) {
			this.scrollToRow = null;
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
				label={this.makeLabel(stateStyle)}
				topRightPanel={this.makeAddRemoveButtonPanel()}
				validationStyle={stateStyle}
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

	makeCells(rows, controlValue, columnWidths, stateStyle, stateDisabled) {
		for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
			const columns = [];
			if (this.includeInFilter(rowIndex)) {
				for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
					const columnDef = this.props.control.subControls[colIndex];
					if (columnDef.visible) {
						columns.push(this._makeCell(columnDef, controlValue, rowIndex,
							colIndex, columnWidths[colIndex], stateStyle, stateDisabled));
					}
				}
				if (this.props.control.childItem) {
					const cell = this.buildChildItem(columnWidths, controlValue, rowIndex);
					columns.push(cell);
				}
				rows.push(<Tr key={rowIndex} onClick={this.handleRowClick.bind(this, rowIndex)} className={this.getRowClassName(rowIndex)}>{columns}</Tr>);
			}
		}
	}

	buildChildItem(columnWidths, controlValue, rowIndex) {
		// Assumes the child item is an "ADDITIONAL_LINK" object.
		// However, we will extract information from the and will create our own Cell-based invoker.
		const subPanelColIndex = this.props.control.subControls.length;
		const columnStyle = { "width": columnWidths[subPanelColIndex], "padding": "0 0 0 0" };
		// const buttonWidth = 6;
		// const header = <Cell />;
		const subControlId = this.getSubControlId();

		const subItemButton = this.props.buildUIItem(subControlId, this.props.control.childItem, subControlId, this.getEditingRowValue, this.props.dataModel);
		// Hack to decompose the button into our own in-table link
		const subCell = (<SubPanelCell data={controlValue}
			col={this.props.control.subControls.length}
			rowIndex={rowIndex}
			label={subItemButton.props.label}
			title={subItemButton.props.title}
			panel={subItemButton.props.panel}
			notifyStartEditing={this.startEditingRow}
			notifyFinishedEditing={this.stopEditingRow}
		/>);
		return (<Td key={subPanelColIndex} column={subControlId} style={columnStyle}>{subCell}</Td>);
	}
}

ColumnStructureTableEditor.propTypes = {};
