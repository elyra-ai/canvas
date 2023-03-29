/*
 * Copyright 2017-2022 Elyra Authors
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
// Base class for table controls

import React from "react";
import PropTypes from "prop-types";
import { Button, Checkbox } from "carbon-components-react";
import FlexibleTable from "./../components/flexible-table";
import TableButtons from "./../components/table-buttons";
import SubPanelCell from "./../panels/sub-panel/cell.jsx";
import ReadonlyControl from "./readonly";
import * as PropertyUtils from "./../util/property-utils";
import classNames from "classnames";
import { Add16, TrashCan16, Edit16 } from "@carbon/icons-react";
import { ControlType, EditStyle } from "./../constants/form-constants";
import { v4 as uuid4 } from "uuid";

import { MESSAGE_KEYS, STATES, TABLE_SUBPANEL_BUTTON_WIDTH, SORT_DIRECTION, ROW_SELECTION, UPDATE_TYPE } from "./../constants/constants";

import { isEqual, findIndex, sortBy, cloneDeep } from "lodash";

/* eslint max-depth: ["error", 5] */

export default class AbstractTable extends React.Component {

	static getDerivedStateFromProps(nextProps, prevState) {
		const enableRemoveIcon = (nextProps.selectedRows.length !== 0);
		if (prevState.enableRemoveIcon !== enableRemoveIcon) {
			return ({ enableRemoveIcon: enableRemoveIcon });
		}
		return ({});
	}

	constructor(props) {
		super(props);
		this.state = {
			filterText: null,
			enableRemoveIcon: false
		};
		this.onPanelContainer = [];
		// used to determine if column controls can be inline or if field picker is used
		this.allowColumnControls = false;

		this.isReadonlyTable = this.isReadonlyTable.bind(this);
		this.indexOfColumn = this.indexOfColumn.bind(this);
		this.setCurrentControlValueSelected = this.setCurrentControlValueSelected.bind(this);
		this.setReadOnlyColumnValue = this.setReadOnlyColumnValue.bind(this);
		this.removeSelected = this.removeSelected.bind(this);
		this.updateRowSelections = this.updateRowSelections.bind(this);
		this.handleRowClick = this.handleRowClick.bind(this);
		this.createTable = this.createTable.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.onSort = this.onSort.bind(this);
		this.setScrollToRow = this.setScrollToRow.bind(this);
		this.includeInFilter = this.includeInFilter.bind(this);
		this.makeAddRemoveButtonPanel = this.makeAddRemoveButtonPanel.bind(this);
		this.makeEditButtonPanel = this.makeEditButtonPanel.bind(this);
		this.makeCustomButtonsPanel = this.makeCustomButtonsPanel.bind(this);
		this.buildChildItem = this.buildChildItem.bind(this);
		this.makeCells = this.makeCells.bind(this);
		this.checkedAll = this.checkedAll.bind(this);
		this.isLightTheme = this.isLightTheme.bind(this);

		if (props.selectedRows && props.selectedRows.length > 0) {
			this.scrollToRow = props.selectedRows[props.selectedRows.length - 1];
		}

		this.selectSummaryPropertyName = "table-multi-select-edit-property-" + props.control.name;
		props.controller.saveControls([{ name: this.selectSummaryPropertyName }]);
		this.setSelectedSummaryRowValue(props.selectedRows);
		this.uuid = uuid4();
	}

	componentDidMount() {
		if (this.props.control.subControls) {
			const updatedControlValues = this.setReadOnlyColumnValue();
			this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues, true, UPDATE_TYPE.INITIAL_LOAD);
		}
	}

	componentDidUpdate() {
		if (this.isSelectSummaryEdit(this.props.selectedRows)) {
			this.updateSelectedRowsValues();
		}
	}

	componentWillUnmount() {
		this.props.controller.removePropertyValue({ name: this.selectSummaryPropertyName });
	}

	onFilter(filterString) {
		this.setState({ filterText: filterString });
	}

	onSort(spec) {
		let controlValue = this.props.value;
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
			if (spec.direction === SORT_DIRECTION.DESC) {
				controlValue.reverse();
			}
			this.setCurrentControlValueSelected(controlValue, []);
		}
	}

	getOnPanelContainer(selectedRows) {
		if (this.onPanelContainer.length === 0 || selectedRows.length === 0 ||
			this.isSelectSummaryEdit(selectedRows)) {
			return (<div />);
		}

		return (<div className="properties-onpanel-container">{this.onPanelContainer[selectedRows[0]]}</div>);
	}

	getDefaultRow() {
		const row = [];
		if (this.props.control.defaultRow) {
			for (const colValue of this.props.control.defaultRow) {
				if (typeof colValue !== "undefined" && colValue !== null && colValue.parameterRef) {
					row.push(this.props.controller.getPropertyValue({ name: colValue.parameterRef }));
				} else {
					row.push(colValue);
				}
			}
		}
		return row;
	}

	setScrollToRow(row) {
		this.scrollToRow = row;
	}

	setCurrentControlValueSelected(controlValue, inSelectedRows) {
		let updatedControlValues = controlValue;
		if (this.props.control.subControls) {
			updatedControlValues = this.setReadOnlyColumnValue(controlValue);
		}

		// Here we convert any compound field strings into compound values for storage
		if (Array.isArray(updatedControlValues)) {
			for (let idx = 0; idx < updatedControlValues.length; idx++) {
				const value = updatedControlValues[idx];
				if (Array.isArray(value)) {
					for (let idx2 = 0; idx2 < this.props.control.subControls.length; idx2++) {
						const subControl = this.props.control.subControls[idx2];
						if (subControl.role === "column" && subControl.valueDef.propType === "structure") {
							updatedControlValues[idx][idx2] = PropertyUtils.fieldStringToValue(
								value[idx2], subControl, this.props.controller);
						}
					}
				} else if (this.props.control.role === "column" && this.props.control.valueDef.propType === "structure") {
					updatedControlValues[idx] = PropertyUtils.fieldStringToValue(
						value, this.props.control, this.props.controller);
				}
			}
		}

		// Update the property value
		this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
		const selectedRows = Array.isArray(inSelectedRows) ? inSelectedRows : [];
		this.updateRowSelections(selectedRows);
	}

	setReadOnlyColumnValue(controlValue) {
		const controlValues = controlValue ? controlValue : this.props.value;
		if (!Array.isArray(controlValues)) {
			return controlValues;
		}
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

	// This will set the select summary row values either from the property value or the default values.
	setSelectedSummaryRowValue(selection) {
		if (this.isSelectSummaryEdit(selection)) {
			const summaryPropertyId = {
				name: this.selectSummaryPropertyName
			};
			let value = this.props.controller.getPropertyValue(summaryPropertyId);
			if (!value) {
				value = [this.getDefaultRow()];
				this.props.controller.updatePropertyValue(summaryPropertyId, value, true);
			}
			this.selectedSummaryRowValue = cloneDeep(value);
		}
	}

	isSelectSummaryEdit(selectedRows) {
		return (this.props.control.rowSelection === ROW_SELECTION.MULTIPLE && selectedRows.length > 1);
	}

	isReadonlyTable() {
		return this.props.control.controlType === ControlType.READONLYTABLE;
	}

	indexOfColumn(controlId) {
		return findIndex(this.props.control.subControls, function(columnControl) {
			return columnControl.name === controlId;
		});
	}

	handleRowClick(rowIndex, evt) {
		let selectedRows = this.props.selectedRows;
		if (this.props.control.rowSelection === ROW_SELECTION.SINGLE) {
			selectedRows = [rowIndex];
		} else if (evt.metaKey === true || evt.ctrlKey === true) {
			// If already selected then remove otherwise add
			const index = selectedRows.indexOf(rowIndex);
			if (index >= 0) {
				selectedRows.splice(index, 1);
			} else {
				selectedRows = selectedRows.concat(rowIndex);
			}
		} else if (evt.shiftKey === true) {
			const anchor = selectedRows.length > 0 ? selectedRows[0] : rowIndex;
			const start = anchor > rowIndex ? rowIndex : anchor;
			const end = (anchor > rowIndex ? anchor : rowIndex) + 1;
			const newSelns = [];
			for (let i = start; i < end; i++) {
				newSelns.push(i);
			}
			selectedRows = newSelns;
		}
		this.updateRowSelections(selectedRows);
	}

	// this will got through all selected rows and update any column value in the row with the
	// column value in the selected summary row that has changed.
	updateSelectedRowsValues() {
		const summaryPropertyId = {
			name: this.selectSummaryPropertyName
		};
		const tableControl = this.props.controller.getControl({ name: this.props.control.name });
		const newSelectedSummaryRow = this.props.controller.getPropertyValue(summaryPropertyId);
		if (newSelectedSummaryRow && Array.isArray(newSelectedSummaryRow)) {
			newSelectedSummaryRow[0].forEach((cellValue, colIndex) => {
				if (cellValue !== null && !isEqual(cellValue, this.selectedSummaryRowValue[0][colIndex])) {
					// if a column does not have a value, the default value is null and the value returned
					// from getPropertyValue is undefined causing unneccessary updates and an infinite loop during intialization
					const testCell = (typeof cellValue === "undefined") ? null : cellValue;
					this.props.selectedRows.forEach((rowIndex) => {
						this.props.controller.updatePropertyValue({ name: this.props.control.name, row: rowIndex, col: colIndex }, testCell, true);
					});
					if (tableControl.subControls[colIndex].controlType === ControlType.ONEOFSELECT) {
						this.props.controller.updatePropertyValue({ name: this.selectSummaryPropertyName, row: 0, col: colIndex }, null);
					}
				}
			});
			this.selectedSummaryRowValue = cloneDeep(newSelectedSummaryRow);
		}
	}

	updateRowSelections(selection) {
		this.props.controller.updateSelectedRows(this.props.propertyId, selection);
		// react throws warning when modal because the button does not exist at this moment
		if (this.props.rightFlyout) {
			this.setState({ enableRemoveIcon: (selection.length !== 0) });
		}
		this.setSelectedSummaryRowValue(selection);
	}

	removeSelected() {
		const rows = this.props.value;
		// Sort descending to ensure lower indices don"t get
		// changed when values are deleted
		const selected = this.props.selectedRows.sort(function(a, b) {
			return b - a;
		});
		for (let i = 0; i < selected.length; i++) {
			rows.splice(selected[i], 1);
			// this will remove any error messages associate with row.
			this.props.controller.removeErrorMessageRow({ name: this.props.propertyId.name, row: selected[i] });
		}

		this.setCurrentControlValueSelected(rows);
	}

	// selectSummaryRow is true if creating the makeSelectedEditRow header row
	_makeCell(columnDef, controlValue, propertyName, rowIndex, colIndex, tableState, selectSummaryRow) {
		const childPropertyId = {
			name: propertyName,
			row: rowIndex,
			col: colIndex
		};

		const parentPropertyId = cloneDeep(this.props.propertyId);
		let propertyId = childPropertyId;
		// Do not use parentPropertyId if creating the makeSelectedEditRow
		if (!selectSummaryRow && parentPropertyId.name !== childPropertyId.name) {
			propertyId = this.props.controller.setChildPropertyId(parentPropertyId, childPropertyId);
		}

		const tableInfo = { table: true, allowColumnControls: this.allowColumnControls };
		const ControlFactory = this.props.controller.getControlFactory();
		let cellContent;
		const columnDefObj = Object.assign({}, columnDef); // clone columnDef
		const cellClassName = columnDefObj.className ? columnDefObj.className : "";
		if (columnDef.dmImage) {
			const fields = this.props.controller.getDatasetMetadataFields();
			const stringValue = PropertyUtils.stringifyFieldValue(this.props.controller.getPropertyValue(propertyId), columnDef, true);
			columnDefObj.icon = PropertyUtils.getDMFieldIcon(fields,
				stringValue, columnDef.dmImage);
		}
		if (this.isReadonlyTable()) {
			cellContent = (<div className={classNames("properties-table-cell-control", cellClassName)}>
				<ReadonlyControl
					control={this.props.controller.getControl(propertyId)}
					propertyId={propertyId}
					controller={this.props.controller}
					tableControl
				/>
			</div>);
		} else if (columnDef.editStyle === EditStyle.SUBPANEL || columnDef.editStyle === EditStyle.ON_PANEL) {
			if (selectSummaryRow) {
				cellContent = <div />;
			} else {
				cellContent = (<div className={classNames("properties-table-cell-control", cellClassName)}>
					<ReadonlyControl
						control={this.props.controller.getControl(propertyId)}
						propertyId={propertyId}
						controller={this.props.controller}
						tableControl
					/>
				</div>);
				if (columnDef.editStyle === EditStyle.ON_PANEL) {
				// save the cell content in an object
					this.onPanelContainer[rowIndex].push(<div key={colIndex}><br />{ControlFactory.createControlItem(columnDef, propertyId)}</div>);
				}
			}
		} else { // defaults to inline control
			tableInfo.editStyle = EditStyle.INLINE;
			cellContent = (<div className={classNames("properties-table-cell-control", cellClassName)}>
				{ControlFactory.createControl(columnDefObj, propertyId, tableInfo)}
			</div>);

		}
		return {
			column: columnDef.name,
			width: columnDef.width,
			content: cellContent,
			className: cellClassName,
			value: this.props.controller.getPropertyValue(propertyId),
			resizable: columnDef.resizable
		};
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

	_getDisabledStatus(cellPropertyId, tableState) {
		if (typeof tableState !== "undefined" && tableState === STATES.DISABLED) {
			return true;
		}
		const cellState = this.props.controller.getControlState(cellPropertyId);
		return cellState === STATES.DISABLED;
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
		const controlValue = this.props.value;
		for (let i = 0; i < this.filterFields.length; i++) {
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.name === this.filterFields[i]) {
					const value = controlValue[rowIndex][colIndex];
					if (typeof value === "string" && value.toLowerCase().indexOf(this.state.filterText.toLowerCase()) > -1) {
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

	addOnClick(propertyId) {
		if (this.addOnClickCallback) {
			this.addOnClickCallback(propertyId, this.onFieldPickerCloseCallback);
		}
	}

	isLightTheme() {
		return this.props.controller.getLight() && this.props.control.light;
	}

	makeSelectedEditRow(selectedRows) {
		if (selectedRows && Array.isArray(selectedRows) && selectedRows.length > 1) {
			const rowsSelectedLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.MULTI_SELECTED_ROW_LABEL);
			const rowsSelectedAction = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.MULTI_SELECTED_ROW_ACTION);
			const title = selectedRows.length + " " + rowsSelectedLabel + " " + rowsSelectedAction;
			const rows = [];
			const sortFields = [];
			const filterFields = [];
			const headers = (this.props.control.header === false) ? [] : this.makeHeader(sortFields, filterFields);
			const showHeader = false;
			const value = this.props.controller.getPropertyValue({ name: this.selectSummaryPropertyName });
			this.makeCells(rows, value, null, this.selectSummaryPropertyName, true);
			const tableLabel = (this.props.control.label && this.props.control.label.text) ? this.props.control.label.text : "";
			return (<div className="properties-at-selectedEditRows" >
				<div className="properties-selectedEditRows-title" >
					<span >{title}</span>
				</div>
				<FlexibleTable
					showHeader={showHeader}
					columns={headers}
					data={rows}
					rows={0}
					scrollKey={this.selectSummaryPropertyName}
					tableLabel={tableLabel}
					summaryTable
					rowSelection={ROW_SELECTION.MULTIPLE}
					light={this.isLightTheme()}
					emptyTablePlaceholder={this.props.control.additionalText}
				/>
			</div>);
		}
		return null;
	}

	makeAddRemoveButtonPanel(tableState, tableButtonConfig) {
		this.onFieldPickerCloseCallback = (tableButtonConfig && tableButtonConfig.fieldPickerCloseFunction)
			? tableButtonConfig.fieldPickerCloseFunction.bind(this)
			: null;

		const removeOnClick = (tableButtonConfig && tableButtonConfig.removeButtonFunction)
			? tableButtonConfig.removeButtonFunction
			: this.removeSelected;
		const removeButtonLabel = (tableButtonConfig && tableButtonConfig.removeButtonLabel) ? tableButtonConfig.removeButtonLabel
			: PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.STRUCTURETABLE_REMOVEBUTTON_LABEL);
		const removeDisabled = !this.state.enableRemoveIcon || tableState === STATES.DISABLED;


		let addButtonDisabled = false;
		this.addOnClickCallback = (tableButtonConfig && tableButtonConfig.addButtonFunction)
			? tableButtonConfig.addButtonFunction
			: this.props.openFieldPicker;
		const addButtonLabel = (tableButtonConfig && tableButtonConfig.addButtonLabel) ? tableButtonConfig.addButtonLabel
			: PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_LABEL);
		if (tableState === STATES.DISABLED) {
			addButtonDisabled = true;
			this.addOnClickCallback = null;
		}

		return (
			<div className="properties-at-buttons-container">
				<Button
					className="properties-remove-fields-button"
					disabled={removeDisabled}
					onClick={removeOnClick}
					size="small"
					kind="ghost"
					renderIcon={TrashCan16}
				>
					{removeButtonLabel}
				</Button>
				<Button
					className="properties-add-fields-button"
					disabled={addButtonDisabled}
					onClick={this.addOnClick.bind(this, this.props.propertyId)}
					size="small"
					kind="ghost"
					renderIcon={Add16}
				>
					{addButtonLabel}
				</Button>
			</div>
		);
	}

	makeEditButtonPanel(tableState, tableButtonConfig) {
		let editButton = null;

		if (tableButtonConfig && tableButtonConfig.editCallback) {
			this.editOnClickCallback = tableButtonConfig.editCallback;
			editButton = (<div className="properties-at-buttons-container">
				<Button
					className="properties-edit-button"
					onClick={this.editOnClick.bind(this, this.props.propertyId)}
					size="small"
					kind="ghost"
					renderIcon={Edit16}
				>
					{tableButtonConfig.label}
				</Button>
			</div>);
		}

		return editButton;
	}

	makeCustomButtonsPanel(tableState, customButtons) {
		let customTableButtons = null;
		if (customButtons) {
			customTableButtons = (<div className="properties-at-buttons-container">
				<TableButtons
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					tableState={tableState}
					customButtons={customButtons}
					customButtonsState={this.props.tableButtons}
				/>
			</div>);
		}
		return customTableButtons;
	}

	editOnClick(propertyId) {
		if (this.editOnClickCallback) {
			this.editOnClickCallback(propertyId);
		}
	}

	checkedAllValue(colIndex, checked) {
		const controlValue = this.props.value;
		if (Array.isArray(controlValue)) {
			for (let i = 0; i < controlValue.length; i++) {
				const propertyId = {
					name: this.props.control.name,
					row: i,
					col: colIndex
				};
				if (this.props.controller.getControlState(propertyId) !== STATES.DISABLED) {
					this.props.controller.updatePropertyValue(propertyId, checked);
				}
			}
			this.checkedAll[colIndex] = checked;
		}
	}

	checkedAll(colIndex) {
		const controlValue = this.props.value;
		if (Array.isArray(controlValue)) {
			if (controlValue.length === 0) {
				return false;
			}
			for (let i = 0; i < controlValue.length; i++) {
				const propertyId = {
					name: this.props.control.name,
					row: i,
					col: colIndex
				};
				if (this.props.controller.getControlState(propertyId) !== STATES.DISABLED) {
					if (!controlValue[i][colIndex]) {
						return false;
					}
				}
			}
		} else {
			return false;
		}
		return true;
	}

	disabledAll(colIndex) {
		const controlValue = this.props.value;
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

	createTable(tableState, tableButtonConfig, customButtons) {
		const rows = [];
		const sortFields = [];
		const filterFields = [];
		this.filterFields = filterFields;

		const headers = this.makeHeader(sortFields, filterFields);
		const showHeader = this.props.control.header !== false;

		const controlValue = this.props.value;
		this.makeCells(rows, controlValue, tableState);

		const selectedEditRow = this.props.control.rowSelection === ROW_SELECTION.MULTIPLE
			? this.makeSelectedEditRow(this.props.selectedRows)
			: null;
		let topRightPanel = null;
		if (customButtons) {
			topRightPanel = this.makeCustomButtonsPanel(tableState, customButtons);
		} else if (this.isReadonlyTable()) {
			if (!this.props.hideEditButton) {
				topRightPanel = this.makeEditButtonPanel(tableState, tableButtonConfig);
			}

		} else if (this.props.addRemoveRows) {
			topRightPanel = this.makeAddRemoveButtonPanel(tableState, tableButtonConfig);
		}

		let rowToScrollTo;
		if (Number.isInteger(this.scrollToRow) && rows.length > this.scrollToRow) {
			rowToScrollTo = this.scrollToRow;
			delete this.scrollToRow;
		}

		const tableLabel = (this.props.control.label && this.props.control.label.text) ? this.props.control.label.text : "";
		// ReadonlyTable with single row selection is non-interactive. rowClickCallback should be undefined.
		let rowClickCallback;
		const singleRowSelectionReadonlyTable = this.isReadonlyTable() && this.props.control.rowSelection === ROW_SELECTION.SINGLE;
		if (!singleRowSelectionReadonlyTable) {
			rowClickCallback = this.props.control.rowSelection === ROW_SELECTION.SINGLE ? this.handleRowClick : this.updateRowSelections;
		}

		const table =	(
			<FlexibleTable
				sortable={sortFields}
				filterable={filterFields}
				columns={headers}
				data={rows}
				showHeader={showHeader}
				scrollToRow={rowToScrollTo}
				onFilter={this.onFilter}
				onSort={this.onSort}
				topRightPanel={topRightPanel}
				selectedEditRow={selectedEditRow}
				scrollKey={this.props.control.name}
				tableState={tableState}
				messageInfo={this.props.controller.getErrorMessage(this.props.propertyId)}
				rows={this.props.control.rows}
				tableLabel={tableLabel}
				updateRowSelections={rowClickCallback}
				selectedRows= {this.props.selectedRows}
				rowSelection={this.props.control.rowSelection}
				light={this.isLightTheme()}
				emptyTablePlaceholder={this.props.control.additionalText}
			/>);
		return (
			<div>
				{table}
			</div>
		);
	}

	makeHeader(sortFields, filterFields) {
		const headers = [];
		for (let j = 0; j < this.props.control.subControls.length; j++) {
			const columnDef = this.props.control.subControls[j];
			// See if the entire column is disabled
			const colState = this.props.controller.getControlState({ name: this.props.control.name, col: j });
			const disabled = colState === STATES.DISABLED || colState === STATES.HIDDEN;
			const columnLabel = (columnDef.controlType === ControlType.CHECKBOX)
				? (
					<Checkbox
						disabled={disabled}
						id={`properties-at-header-cb-${this.uuid}-${this.props.control.name}=${j}`}
						checked={this.checkedAll(j)}
						onChange={this.checkedAllValue.bind(this, j)}
						labelText={columnDef.label.text}
					/>) : columnDef.label.text;
			if (columnDef.visible && columnDef.controlType !== ControlType.HIDDEN) {
				if (columnDef.sortable) {
					sortFields.push(columnDef.name);
				}
				headers.push({
					"key": columnDef.name,
					"label": columnLabel,
					"width": columnDef.width,
					"description": (columnDef.description ? columnDef.description.text : null),
					"resizable": columnDef.resizable ? columnDef.resizable : false,
					"operation": (columnDef.generatedValues && columnDef.generatedValues.operation ? columnDef.generatedValues.operation : null),
					"disabled": disabled
				});
				if (columnDef.filterable) {
					filterFields.push(columnDef.name);
				}
			}
		}
		// subpanel column will always be empty for ReadonlyTable control based on condition in makeCells()
		if (this.props.control.childItem && !this.isReadonlyTable()) {
			// set to specific size. Exclude this column from resizing.
			headers.push({ "key": "subpanel", "label": "", "width": TABLE_SUBPANEL_BUTTON_WIDTH, "staticWidth": true });
		}
		return headers;
	}

	makeCells(rows, controlValue, tableState, propName, selectSummaryRow) {
		if (!Array.isArray(controlValue)) {
			return;
		}
		const propertyName = propName ? propName : this.props.control.name;
		for (let rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
			const columns = [];
			this.onPanelContainer[rowIndex] = [];
			if (this.includeInFilter(rowIndex) || selectSummaryRow) {
				for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
					const columnDef = this.props.control.subControls[colIndex];
					// we need to build the on-panel container so that when the row is selected and a not visible column is on-panel
					// the on-panel container will be available for display.
					if (columnDef.visible || columnDef.editStyle === EditStyle.ON_PANEL) {
						const content = this._makeCell(columnDef, controlValue, propertyName, rowIndex,
							colIndex, tableState, selectSummaryRow);
						// only add content if column is visible
						if (columnDef.visible) {
							columns.push(content);
						}
					}
				}
				if (this.props.control.childItem && !selectSummaryRow && !this.isReadonlyTable()) {
					const cell = this.buildChildItem(propertyName, rowIndex, tableState);
					columns.push(cell);
				}
				rows.push({
					columns: columns
				});
			}
		}
	}

	buildChildItem(propName, rowIndex, tableState) {
		// Assumes the child item is an "ADDITIONAL_LINK" object.
		// However, we will extract information from the and will create our own Cell-based invoker.
		const childPropertyId = { name: propName, row: rowIndex };
		const parentPropertyId = cloneDeep(this.props.propertyId);

		let propertyId = childPropertyId;
		// If childPropertyId name does not match the parent, then this is a subControl
		if (parentPropertyId.name !== childPropertyId.name) {
			propertyId = this.props.controller.setChildPropertyId(parentPropertyId, childPropertyId);
		}

		const subItemButton = this.props.buildUIItem(rowIndex, this.props.control.childItem, propertyId, this.indexOfColumn);
		// Hack to decompose the button into our own in-table link
		const subCell = (
			<div className="properties-table-subcell">
				<SubPanelCell
					label={subItemButton.props.label}
					title={subItemButton.props.title}
					panel={subItemButton.props.panel}
					disabled={tableState === STATES.DISABLED}
					controller={this.props.controller}
					propertyId={this.props.propertyId}
					rightFlyout={this.props.rightFlyout}
				/>
			</div>);
		return {
			column: "subpanel",
			width: TABLE_SUBPANEL_BUTTON_WIDTH,
			content: subCell
		};
	}
}

AbstractTable.propTypes = {
	buildUIItem: PropTypes.func,
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func.isRequired,
	rightFlyout: PropTypes.bool,
	value: PropTypes.array, // pass in by redux
	selectedRows: PropTypes.array, // set by redux
	addRemoveRows: PropTypes.bool, // set by redux
	tableButtons: PropTypes.object, // set in by redux
	hideEditButton: PropTypes.bool // set by redux
};

AbstractTable.defaultProps = {
	addRemoveRows: true,
	hideEditButton: false,
};
