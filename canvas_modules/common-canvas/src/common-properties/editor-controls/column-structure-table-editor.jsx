/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// Base class for table controls

import React from "react";
import { Tr, Td } from "reactable";
import Button from "ap-components-react/dist/components/Button";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import EditorControl from "./editor-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import SubPanelCell from "./../panels/sub-panel/cell.jsx";
import Icon from "./../../icons/icon.jsx";
import PropertyUtils from "../util/property-utils";
import { ControlType, EditStyle } from "../constants/form-constants";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, TOOL_TIP_DELAY, STATES } from "../constants/constants";
import findIndex from "lodash/findIndex";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import Tooltip from "../../tooltip/tooltip.jsx";

import uuid4 from "uuid/v4";

/* eslint-disable react/prop-types */
/* eslint-enable react/prop-types */
/* eslint complexity: ["error", 16] */
/* eslint max-depth: ["error", 5] */

export default class ColumnStructureTableEditor extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			enableRemoveIcon: false,
			hoverRemoveIcon: false
		};

		this.onPanelContainer = [];

		this._editing_row = 0;

		this.indexOfColumn = this.indexOfColumn.bind(this);

		this.getCurrentControlValue = this.getCurrentControlValue.bind(this);
		this.setCurrentControlValue = this.setCurrentControlValue.bind(this);
		this.setCurrentControlValueSelected = this.setCurrentControlValueSelected.bind(this);
		this.setReadOnlyColumnValue = this.setReadOnlyColumnValue.bind(this);
		this.removeSelected = this.removeSelected.bind(this);
		this.updateRowSelections = this.updateRowSelections.bind(this);

		this.handleRowClick = this.handleRowClick.bind(this);
		this.getRowClassName = this.getRowClassName.bind(this);

		this.createTable = this.createTable.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.onSort = this.onSort.bind(this);
		this.setScrollToRow = this.setScrollToRow.bind(this);
		this.includeInFilter = this.includeInFilter.bind(this);

		this.makeAddRemoveButtonPanel = this.makeAddRemoveButtonPanel.bind(this);
		this.makeLabel = this.makeLabel.bind(this);
		this.buildChildItem = this.buildChildItem.bind(this);
		this.makeCells = this.makeCells.bind(this);

		this.checkedAllValue = this.checkedAllValue.bind(this);
		this.checkedAll = this.checkedAll.bind(this);

		this.addOnClick = this.addOnClick.bind(this);

		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		if (selectedRows && selectedRows.length > 0) {
			this.scrollToRow = selectedRows[selectedRows.length - 1];
			this.alignTop = true;
		}
	}

	componentDidMount() {
		if (this.props.control.subControls) {
			const updatedControlValues = this.setReadOnlyColumnValue(this.getCurrentControlValue());
			this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues, true);
		}
	}

	componentWillReceiveProps(nextProps) {
		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		this.selectionChanged(selectedRows);
		this.setState({ enableRemoveIcon: (selectedRows.length !== 0) });
	}

	getOnPanelContainer(selectedRows) {
		if (this.onPanelContainer.length === 0 || selectedRows.length === 0) {
			return (<div />);
		}

		return (<div>{this.onPanelContainer[selectedRows[0]]}</div>);
	}

	getCurrentControlValue() {
		return this.props.controller.getPropertyValue(this.props.propertyId);
	}

	setCurrentControlValueSelected(controlValue, selectedRows) {
		let updatedControlValues = controlValue;
		if (this.props.control.subControls) {
			updatedControlValues = this.setReadOnlyColumnValue(controlValue);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
		this.updateRowSelections(this.props.control.name, selectedRows);
	}

	setCurrentControlValue(controlValue) {
		let updatedControlValues = controlValue;
		if (this.props.control.subControls) {
			updatedControlValues = this.setReadOnlyColumnValue(controlValue);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
		this.updateRowSelections(this.props.control.name, []);
	}

	setReadOnlyColumnValue(controlValue) {
		const controlValues = controlValue ? controlValue : this.getCurrentControlValue();
		for (var rowIndex = 0; rowIndex < controlValues.length; rowIndex++) {
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.controlType === ControlType.READONLY && columnDef.generatedValues && columnDef.generatedValues.operation === "index") {
					const index = typeof columnDef.generatedValues.startValue !== "undefined" ? columnDef.generatedValues.startValue + rowIndex : rowIndex + 1;
					controlValues[rowIndex][colIndex] = index;
				}
			}
		}
		return controlValues;
	}

	setScrollToRow(row, alignTop) {
		this.scrollToRow = row;
		this.alignTop = alignTop;
	}

	indexOfColumn(controlId) {
		return findIndex(this.props.control.subControls, function(columnControl) {
			return columnControl.name === controlId;
		});
	}

	handleRowClick(rowIndex, evt) {
		const selectedRows = this.props.controller.getSelectedRows(this.props.control.name);
		const selection = EditorControl.handleTableRowClick(evt, rowIndex, selectedRows, this.props.control.rowSelection);
		// logger.info(selection);
		this.updateRowSelections(this.props.control.name, selection);
	}

	updateRowSelections(ctrlName, selection) {
		this.props.controller.updateSelectedRows(ctrlName, selection);
		this.selectionChanged(selection);
		// react throws warning when modal because the button does not exist at this moment
		if (this.props.rightFlyout) {
			this.setState({ enableRemoveIcon: (selection.length !== 0) });
		}
	}

	removeSelected() {
		const rows = this.getCurrentControlValue();
		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.props.controller.getSelectedRows(this.props.control.name).sort(function(a, b) {
			return b - a;
		});
		for (let i = 0; i < selected.length; i++) {
			rows.splice(selected[i], 1);
			// this will remove any error messages associate with row.
			this.props.controller.removeErrorMessageRow({ name: this.props.propertyId.name, row: selected[i] });
		}

		this.setCurrentControlValue(rows);
	}

	selectionChanged(selection) {
		// A no-op in this class
	}

	getRowClassName(rowIndex) {
		return this.props.controller.getSelectedRows(this.props.control.name).indexOf(rowIndex) >= 0
			? "table-row table-selected-row "
			: "table-row";
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
			controlValue = sortBy(controlValue, function(row) {
				return row[col];
			});
			if (spec.direction > 0) {
				controlValue = controlValue.reverse();
			}
			this.setCurrentControlValueSelected(controlValue, []);
		}
	}

	_makeCell(columnDef, controlValue, rowIndex, colIndex, colWidth, stateStyle, stateDisabled) {
		let cell;
		let cellContent;
		const columnStyle = { "width": colWidth };
		columnStyle.paddingLeft = colIndex === 0 ? "15px" : "0";
		const disabled = this._getDisabledStatus(rowIndex, colIndex, stateDisabled);
		const propertyId = {
			name: this.props.control.name,
			row: rowIndex,
			col: colIndex
		};
		const cellDisabledClassName = disabled ? "disabled" : "";
		const tableInfo = { table: true };
		// allows for custom contents in a cell
		cellContent = controlValue[rowIndex][colIndex];
		if (Array.isArray(cellContent)) {
			cellContent = cellContent.join(", ");
		}
		const ControlFactory = this.props.controller.getControlFactory();
		const tableCellWidth = parseFloat(colWidth) - parseFloat(columnStyle.paddingLeft) + "px";
		if (columnDef.editStyle === EditStyle.SUBPANEL) {
			cellContent = this._getCustomCtrlContent(propertyId, columnDef, cellContent, tableInfo);
			cell = (
				<Td className={"table-cell " + cellDisabledClassName} key={colIndex} column={columnDef.name} style={columnStyle}>
					<div className="table-text">
						<span style={{ "width": tableCellWidth }}>{cellContent}</span>
					</div>
				</Td>);
		} else if (columnDef.editStyle === EditStyle.ON_PANEL) {
			cellContent = this._getCustomCtrlContent(propertyId, columnDef, cellContent, tableInfo);
			cell = (
				<Td className={"table-cell " + cellDisabledClassName} key={colIndex} column={columnDef.name} style={columnStyle}>
					<div className="table-text">
						<span style={{ "width": tableCellWidth }}>{cellContent}</span>
					</div>
				</Td>);
			// save the cell content in an object
			cellContent = ControlFactory.createControlItem(columnDef, propertyId);
			this.onPanelContainer[rowIndex].push(<div key={colIndex}><br /> {cellContent} </div>);
		} else { // defaults to inline control
			tableInfo.editStyle = EditStyle.INLINE;
			cellContent = ControlFactory.createControl(columnDef, propertyId, tableInfo);
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}>{cellContent}</Td>);
		}
		return cell;
	}
	_getCustomCtrlContent(propertyId, columnDef, defaultContent, tableInfo) {
		let cellContent = defaultContent;
		// allow the custom control to set the cell content
		if (columnDef.controlType === ControlType.CUSTOM) {
			tableInfo.editStyle = "summary";
			cellContent = this.props.controller.getCustomControl(propertyId, columnDef, tableInfo);
		}
		return cellContent;
	}

	_getDisabledStatus(rowIndex, colIndex, stateDisabled) {
		if (typeof stateDisabled.disabled !== "undefined") {
			return stateDisabled.disabled;
		}
		const row = stateDisabled[rowIndex];
		if (row) {
			const column = row[colIndex];
			if (column) {
				return column.disabled;
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

	hasFilter() {
		let hasFilter = false;
		if (this.props.control.subControls) {
			for (const subControl of this.props.control.subControls) {
				if (subControl.filterable) {
					hasFilter = true;
					break;
				}
			}
		}
		return hasFilter;
	}

	makeLabel(stateStyle) {
		let label;
		if (this.props.control.label && this.props.control.labelVisible !== false && !this.hasFilter()) {
			if (!(this.props.control.description && this.props.control.description.placement === "on_panel")) {
				let requiredIndicator;
				if (this.props.control.required) {
					requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
				}
				const tooltipId = uuid4() + "-tooltip-" + this.props.control.name;
				let tooltip = "";
				if (this.props.control.description) {
					tooltip = (
						<div className="properties-tooltips">
							{this.props.control.description.text}
						</div>
					);
				}
				label = (
					<div className={"label-container"}>
						<div className="properties-tooltips-container">
							<Tooltip
								id={tooltipId}
								tip={tooltip}
								direction="right"
								delay={TOOL_TIP_DELAY}
								className="properties-tooltips"
								disable={isEmpty(tooltip)}
							>
								<div>
									<label className="control-label">{this.props.control.label.text}</label>
									{requiredIndicator}
								</div>
							</Tooltip>
						</div>
					</div>
				);
			}
		}
		return label;
	}

	addOnClick(control) {
		if (this.addOnClickCallback) {
			this.addOnClickCallback(control, this.onFieldPickerCloseCallback);
		}
	}

	makeAddRemoveButtonPanel(stateDisabled, tableButtonConfig) {
		this.onFieldPickerCloseCallback = (tableButtonConfig && tableButtonConfig.fieldPickerCloseFunction)
			? tableButtonConfig.fieldPickerCloseFunction.bind(this)
			: null;

		const removeOnClick = (tableButtonConfig && tableButtonConfig.removeButtonFunction)
			? tableButtonConfig.removeButtonFunction
			: this.removeSelected;
		const disabled = !this.state.enableRemoveIcon || stateDisabled.disabled;
		const removeButton = (<div className="remove-fields-button"
			onClick={removeOnClick}
			disabled={disabled}
		>
			<Icon type="remove" disabled={disabled} />
		</div>);

		let addButtonDisabled = false;
		this.addOnClickCallback = (tableButtonConfig && tableButtonConfig.addButtonFunction)
			? tableButtonConfig.addButtonFunction
			: this.props.openFieldPicker;
		const addButtonLabel = (tableButtonConfig && tableButtonConfig.addButtonLabel) ? tableButtonConfig.addButtonLabel
			: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.STRUCTURETABLE_ADDBUTTON_LABEL);
		if (stateDisabled.disabled) {
			addButtonDisabled = true;
			this.addOnClickCallback = null;
		}
		const addButton = (<Button
			id="add-fields-button"
			icon="plus"
			onClick={this.addOnClick.bind(this, this.props.control)}
			disabled={addButtonDisabled}
		>
			{addButtonLabel}
		</Button>);

		const addToolTip = (
			<div className="properties-tooltips">
				{(tableButtonConfig && tableButtonConfig.addButtonTooltip) ? tableButtonConfig.addButtonTooltip
					: PropertyUtils.formatMessage(this.props.intl,
						MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURETABLE_ADDBUTTON_TOOLTIP)}
			</div>
		);
		const removeToolTip = (
			<div className="properties-tooltips">
				{(tableButtonConfig && tableButtonConfig.removeButtonTooltip) ? tableButtonConfig.removeButtonTooltip
					: PropertyUtils.formatMessage(this.props.intl,
						MESSAGE_KEYS.STRUCTURETABLE_REMOVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURETABLE_REMOVEBUTTON_TOOLTIP)}
			</div>
		);
		return (
			<div id="field-picker-buttons-container">
				<div className="properties-tooltips-container add-remove-columns">
					<Tooltip
						id={uuid4() + "-tooltip-remove-columns-" + this.props.control.name}
						tip={removeToolTip}
						direction="top"
						delay={TOOL_TIP_DELAY}
						className="properties-tooltips"
						disable={disabled}
					>
						{removeButton}
					</Tooltip>
				</div>
				<div className="properties-tooltips-container add-remove-columns">
					<Tooltip
						id={uuid4() + "-tooltip-add-columns-" + this.props.control.name}
						tip={addToolTip}
						direction="top"
						delay={TOOL_TIP_DELAY}
						className="properties-tooltips"
					>
						{addButton}
					</Tooltip>
				</div>
			</div>
		);
	}

	checkedAllValue(colIndex, evt) {
		const flexibleTableCheckedAll = evt.target.checked;
		for (let i = 0; i < this.getCurrentControlValue().length; i++) {
			const propertyId = {
				name: this.props.control.name,
				row: i,
				col: colIndex
			};
			this.props.controller.updatePropertyValue(propertyId, flexibleTableCheckedAll);
		}
		this.checkedAll[colIndex] = flexibleTableCheckedAll;
	}

	checkedAll(colIndex) {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		if (Array.isArray(controlValue)) {
			if (controlValue.length === 0) {
				return false;
			}
			for (const rowValue of controlValue) {
				if (rowValue[colIndex] === false) {
					return false;
				}
			}
		} else {
			return false;
		}
		return true;
	}

	createTable(stateStyle, stateDisabled, tableButtonConfig) {
		const that = this;
		const rows = [];
		let headers = [];
		const sortFields = [];
		const filterFields = [];
		for (var j = 0; j < this.props.control.subControls.length; j++) {
			const columnDef = this.props.control.subControls[j];
			const checkboxName = this.props.control.name + j;

			// See if the entire column is disabled
			const controlState = this.props.controller.getControlState({ name: this.props.control.name, col: j });
			const disabled = controlState === STATES.DISABLED || controlState === STATES.HIDDEN
				? { "disabled": true } : { "disabled": false };
			const stateStyle2 = {};
			stateStyle2.pointerEvents = controlState === STATES.DISABLED || controlState === STATES.HIDDEN
				? "none" : "auto";
			const columnLabel = (columnDef.controlType === ControlType.CHECKBOX)
				? (<div className="checkbox-container">
					<div className="checkbox" style={stateStyle2}>
						<Checkbox {...disabled}
							id={checkboxName}
							checked={this.checkedAll(j)}
							onChange={this.checkedAllValue.bind(this, j)}
						/>
					</div>
					<div className="checkbox-label"> {columnDef.label.text} </div>
				</div>) : columnDef.label.text;
			if (columnDef.visible) {
				if (columnDef.sortable) {
					sortFields.push(columnDef.name);
				}
				headers.push({
					"key": columnDef.name,
					"label": columnLabel,
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
			// set to specific size
			headers.push({ "key": "edit", "label": "", "width": "36px" });
		}
		// add extra column for overlay scrollbar
		headers.push({ "key": "edit", "label": "", "width": "7px" });
		this.filterFields = filterFields;

		const controlValue = this.getCurrentControlValue();
		// calculate for all columns except the last which is used for the scroll bar
		const columnWidths = FlexibleTable.WrappedComponent.calculateColumnWidths(headers, "flexible-table-" + this.props.control.name, 0);
		this.makeCells(rows, controlValue, columnWidths, stateStyle, stateDisabled);

		if (this.props.customContainer) {
			this.scrollToRow = null;
		}

		if (this.props.control.header === false) {
			headers = [];
		}

		const topRightPanel = (typeof this.props.control.addRemoveRows === "undefined" || this.props.control.addRemoveRows) // default to true.
			? this.makeAddRemoveButtonPanel(stateDisabled, tableButtonConfig)
			: <div />;

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
				validationStyle={stateStyle}
				scrollKey={this.props.control.name}
				stateDisabled={stateDisabled}
				rows={this.props.control.rows}
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
		for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
			const columns = [];
			this.onPanelContainer[rowIndex] = [];
			if (this.includeInFilter(rowIndex)) {
				let visibleIndx = 0;
				for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
					const columnDef = this.props.control.subControls[colIndex];
					// we need to build the on-panel container so that when the row is selected and a not visible column is on-panel
					// the on-panel container will be available for display.
					if (columnDef.visible || columnDef.editStyle === EditStyle.ON_PANEL) {
						const content = this._makeCell(columnDef, controlValue, rowIndex,
							colIndex, columnWidths[visibleIndx], stateStyle, stateDisabled);
						// only add content if column is visible
						if (columnDef.visible) {
							columns.push(content);
							visibleIndx += 1;
						}
					}
				}
				if (this.props.control.childItem) {
					const cell = this.buildChildItem(columnWidths, rowIndex, stateDisabled);
					columns.push(cell);
				}
				// add extra 7px cell for overlay scrollbar
				columns.push(<Td key={columns.length} column={"scrollbar"} style={{ "width": "7px", "padding": "0 0 0 0" }}><div /></Td>);
				rows.push(<Tr key={rowIndex} onClick={this.handleRowClick.bind(this, rowIndex)} className={this.getRowClassName(rowIndex)}>{columns}</Tr>);
			}
		}
	}

	buildChildItem(columnWidths, rowIndex, stateDisabled) {
		// Assumes the child item is an "ADDITIONAL_LINK" object.
		// However, we will extract information from the and will create our own Cell-based invoker.
		const propertyId = { name: this.props.propertyId.name, row: rowIndex };
		const subPanelColIndex = this.props.control.subControls.length;
		const columnStyle = { "width": columnWidths[subPanelColIndex] };
		const subItemButton = this.props.buildUIItem(rowIndex, this.props.control.childItem, propertyId, this.indexOfColumn);
		// Hack to decompose the button into our own in-table link
		const disabled = typeof stateDisabled.disabled !== "undefined" || Object.keys(stateDisabled) > 0;
		const subCell = (
			<div className="table-subcell">
				<SubPanelCell
					label={subItemButton.props.label}
					title={subItemButton.props.title}
					panel={subItemButton.props.panel}
					disabled={disabled}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					rightFlyout={this.props.rightFlyout}
				/>
			</div>);
		return (<Td key={subPanelColIndex} column={"subPanel"} style={columnStyle}>{subCell}</Td>);
	}
}

ColumnStructureTableEditor.propTypes = {};
