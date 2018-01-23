/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// Base class for table controls

import React from "react";
import ReactTooltip from "react-tooltip";
import { Tr, Td } from "reactable";
import Button from "ap-components-react/dist/components/Button";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import EditorControl from "./editor-control.jsx";
import ToggletextControl from "./toggletext-control.jsx";
import ReadonlyControl from "./readonly-control.jsx";
import OneofselectControl from "./oneofselect-control.jsx";
import TextfieldControl from "./textfield-control.jsx";
import NumberfieldControl from "./numberfield-control.jsx";
import CheckboxControl from "./checkbox-control.jsx";
import ExpressionControl from "./expression-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import SubPanelCell from "../editor-panels/sub-panel-cell.jsx";
import remove32 from "../../../assets/images/remove_32.svg";
import remove32hover from "../../../assets/images/remove_32_hover.svg";
import remove32disabled from "../../../assets/images/remove_32_disabled.svg";
import PropertyUtils from "../util/property-utils";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";
import { TOOL_TIP_DELAY } from "../constants/constants.js";
import findIndex from "lodash/findIndex";
import sortBy from "lodash/sortBy";

/* eslint-disable react/prop-types */
/* eslint-enable react/prop-types */
/* eslint complexity: ["error", 15] */

export default class ColumnStructureTableEditor extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			enableRemoveIcon: false,
			hoverRemoveIcon: false,
			selectedRows: this.props.selectedRows
		};

		this.checkedAll = {};
		this.onPanelContainer = [];

		this._editing_row = 0;

		this.indexOfColumn = this.indexOfColumn.bind(this);

		this.getCurrentControlValue = this.getCurrentControlValue.bind(this);
		this.setCurrentControlValue = this.setCurrentControlValue.bind(this);
		this.setCurrentControlValueSelected = this.setCurrentControlValueSelected.bind(this);
		this.setReadOnlyColumnValue = this.setReadOnlyColumnValue.bind(this);
		this.getSelectedRows = this.getSelectedRows.bind(this);
		this.removeSelected = this.removeSelected.bind(this);

		this.handleRowClick = this.handleRowClick.bind(this);
		this.getRowClassName = this.getRowClassName.bind(this);
		this.enumRenderCell = this.enumRenderCell.bind(this);

		this.createTable = this.createTable.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.onSort = this.onSort.bind(this);
		this.setScrollToRow = this.setScrollToRow.bind(this);
		this.includeInFilter = this.includeInFilter.bind(this);
		this.mouseEnterRemoveButton = this.mouseEnterRemoveButton.bind(this);
		this.mouseLeaveRemoveButton = this.mouseLeaveRemoveButton.bind(this);

		this.makeAddRemoveButtonPanel = this.makeAddRemoveButtonPanel.bind(this);
		this.makeLabel = this.makeLabel.bind(this);
		this.buildChildItem = this.buildChildItem.bind(this);
		this.makeCells = this.makeCells.bind(this);

		this.checkedAllValue = this.checkedAllValue.bind(this);

		this.addOnClick = this.addOnClick.bind(this);

		if (this.props.selectedRows && this.props.selectedRows.length > 0) {
			this.scrollToRow = this.props.selectedRows[this.props.selectedRows.length - 1];
			this.alignTop = true;
		}
	}

	componentDidMount() {
		if (this.props.control.subControls) {
			const updatedControlValues = this.setReadOnlyColumnValue(this.getCurrentControlValue());
			this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			selectedRows: nextProps.selectedRows
		});
		this.selectionChanged(nextProps.selectedRows);
		this.setState({ enableRemoveIcon: (nextProps.selectedRows.length !== 0) });
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
		var that = this;
		this.setState({
			selectedRows: selectedRows
		}, function() {
			that.updateSelectedRows(that.props.control.name, selectedRows);
		});

		if (this.props.control.subControls) {
			updatedControlValues = this.setReadOnlyColumnValue(controlValue);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
	}

	setCurrentControlValue(controlValue) {
		let updatedControlValues = controlValue;
		var that = this;
		this.setState({
			selectedRows: []
		}, function() {
			that.updateSelectedRows(that.props.control.name, []);
		});
		if (this.props.control.subControls) {
			updatedControlValues = this.setReadOnlyColumnValue(controlValue);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, updatedControlValues);
	}

	setReadOnlyColumnValue(controlValue) {
		const controlValues = controlValue ? controlValue : this.getCurrentControlValue();
		for (var rowIndex = 0; rowIndex < controlValues.length; rowIndex++) {
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.controlType === "readonly" && columnDef.generatedValues && columnDef.generatedValues.operation === "index") {
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

	getSelectedRows() {
		return this.state.selectedRows;
	}

	indexOfColumn(controlId) {
		return findIndex(this.props.control.subControls, function(columnControl) {
			return columnControl.name === controlId;
		});
	}

	handleRowClick(rowIndex, evt) {
		const selection = EditorControl.handleTableRowClick(evt, rowIndex, this.state.selectedRows, this.props.control.rowSelection);
		// logger.info(selection);
		this.updateSelectedRows(this.props.control.name, selection);
	}

	updateSelectedRows(ctrlName, selection) {
		this.props.updateSelectedRows(ctrlName, selection);
		this.selectionChanged(selection);
		this.setState({ enableRemoveIcon: (selection.length !== 0) });

	}

	removeSelected() {
		const rows = this.getCurrentControlValue();
		const newRows = [];
		const selected = this.getSelectedRows();
		for (var i = 0; i < rows.length; i++) {
			if (selected.indexOf(i) < 0) {
				newRows.push(rows[i]);
			}
		}
		this.setCurrentControlValue(newRows);
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
		if (columnDef.controlType === "toggletext" && columnDef.editStyle !== "subpanel") {
			cellContent = (<ToggletextControl
				controller={this.props.controller}
				propertyId={propertyId}
				control={columnDef}
				values={columnDef.values}
				valueLabels={columnDef.valueLabels}
				valueIcons={columnDef.valueIcons}
				tableControl
			/>);
		} else if (columnDef.controlType === "oneofselect" && columnDef.editStyle !== "subpanel") {
			cellContent = (<OneofselectControl
				controller={this.props.controller}
				propertyId={propertyId}
				control={columnDef}
				tableControl
				rightFlyout={this.props.rightFlyout}
			/>);
		} else if (columnDef.valueDef.propType === "enum" && columnDef.editStyle !== "subpanel") {
			cellContent = this.enumRenderCell(controlValue[rowIndex][colIndex], columnDef);
		} else if (columnDef.controlType === "expression" && columnDef.editStyle === "on_panel") {
			const expressionCellControlLabel = PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.EXPRESSIONCELL_CONTROLLABEL, MESSAGE_KEYS_DEFAULTS.EXPRESSIONCELL_CONTROLLABEL);
			cellContent = (<div>
				<br />
				<label className="control-label">{expressionCellControlLabel}</label>
				<div>
					<ExpressionControl
						controller={this.props.controller}
						propertyId={propertyId}
						control={columnDef}
						dataModel={this.props.dataModel}
						tableControl
					/>
				</div>
			</div>);
		} else if (columnDef.controlType === "textfield" && columnDef.editStyle !== "subpanel") {
			columnStyle.paddingTop = 0;
			columnStyle.paddingBottom = 0;
			cellContent = (<TextfieldControl
				controller={this.props.controller}
				propertyId={propertyId}
				control={columnDef}
				tableControl
			/>);
		} else if (columnDef.controlType === "readonly" && columnDef.editStyle !== "subpanel") {
			cellContent = (<ReadonlyControl
				control={columnDef}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (columnDef.controlType === "numberfield" && columnDef.editStyle !== "subpanel") {
			cellContent = (<NumberfieldControl
				control={columnDef}
				controller={this.props.controller}
				propertyId={propertyId}
			/>);
		} else if (columnDef.controlType === "checkbox" && columnDef.editStyle !== "subpanel") {
			columnStyle.paddingTop = 0;
			columnStyle.paddingBottom = 0;
			cellContent = (
				<CheckboxControl
					controller={this.props.controller}
					propertyId={propertyId}
					control={columnDef}
					tableControl
				/>);
			if (this.checkedAll[colIndex] && controlValue[rowIndex][colIndex] === false) {
				this.checkedAll[colIndex] = false;
			}
		} else {
			cellContent = controlValue[rowIndex][colIndex];
			if (Array.isArray(cellContent)) {
				cellContent = cellContent.join(", ");
			}
		}
		const cellDisabledClassName = disabled ? "disabled" : "";
		if (columnDef.editStyle === "subpanel") {
			cell = <Td className={"table-cell " + cellDisabledClassName} key={colIndex} column={columnDef.name} style={columnStyle}><span>{cellContent}</span></Td>;
		} else if (columnDef.editStyle === "on_panel") {
			cell = (<Td className={"table-cell " + cellDisabledClassName} key={colIndex} column={columnDef.name} style={columnStyle}>
				<span>{controlValue[rowIndex][colIndex]}</span></Td>);
			// save the cell conent in an object
			this.onPanelContainer[rowIndex] = cellContent;
		} else {
			cell = (<Td key={colIndex} column={columnDef.name} style={columnStyle}>{cellContent}</Td>);
		}
		return cell;
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
		if (this.props.control.label && this.props.control.separateLabel && !this.hasFilter()) {
			if (!(this.props.control.description && this.props.control.description.placement === "on_panel")) {
				let requiredIndicator;
				if (this.props.control.required) {
					requiredIndicator = <span className="required-control-indicator" style={stateStyle}>*</span>;
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
	mouseEnterRemoveButton() {
		this.setState({ hoverRemoveIcon: true });
	}

	mouseLeaveRemoveButton() {
		this.setState({ hoverRemoveIcon: false });
	}

	addOnClick(control) {
		if (this.addOnClickCallback) {
			this.addOnClickCallback(control);
		}
	}

	makeAddRemoveButtonPanel(stateDisabled, tableButtonConfig) {
		if (this.props.control.noPickColumns) {
			return (<div />);
		}
		let removeFieldsButtonId = "remove-fields-button-enabled";
		let removeIconImage = (<img src={remove32} />);
		let removeOnClick = (tableButtonConfig) ? tableButtonConfig.removeButtonFunction : this.removeSelected;
		if (!this.state.enableRemoveIcon || stateDisabled.disabled) {
			removeIconImage = (<img src={remove32disabled} />);
			removeFieldsButtonId = "remove-fields-button-disabled";
			removeOnClick = null;
		} else if (this.state.hoverRemoveIcon) {
			removeIconImage = (<img src={remove32hover} />);
		}

		const removeButton = (<div id={removeFieldsButtonId}
			className="button"
			onClick={removeOnClick}
			onMouseEnter={this.mouseEnterRemoveButton}
			onMouseLeave={this.mouseLeaveRemoveButton}
			disabled
		>
			{removeIconImage}
		</div>);

		let addButtonDisabled = false;
		this.addOnClickCallback = (tableButtonConfig) ? tableButtonConfig.addButtonFunction : this.props.openFieldPicker;
		const addButtonLabel = (tableButtonConfig) ? tableButtonConfig.addButtonLabel
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

		const tooltipId = "tooltip-add-remove-columns-" + this.props.control.name;
		const addToolTip = (tableButtonConfig) ? tableButtonConfig.addButtonTooltip
			: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURETABLE_ADDBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURETABLE_ADDBUTTON_TOOLTIP);
		const removeToolTip = (tableButtonConfig) ? tableButtonConfig.removeButtonTooltip
			: PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.STRUCTURETABLE_REMOVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.STRUCTURETABLE_REMOVEBUTTON_TOOLTIP);

		return (<div>
			<div id="field-picker-buttons-container">
				<div className="properties-tooltips-container add-remove-columns" data-tip={removeToolTip} data-for={tooltipId}>
					{removeButton}
				</div>
				<div className="properties-tooltips-container add-remove-columns" data-tip={addToolTip} data-for={tooltipId}>
					{addButton}
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

	createTable(stateStyle, stateDisabled, tableButtonConfig) {
		const that = this;
		const rows = [];
		const headers = [];
		const sortFields = [];
		const filterFields = [];
		for (var j = 0; j < this.props.control.subControls.length; j++) {
			const columnDef = this.props.control.subControls[j];
			const checkboxName = this.props.control.name + j;
			const columnLabel = (columnDef.controlType === "checkbox")
				? (<div className="checkbox-container">
					<div className="checkbox">
						<Checkbox
							id={checkboxName}
							checked={Boolean(this.checkedAll[j])}
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
			headers.push({ "key": "edit", "label": "", "width": "46px" });
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
				validationStyle={stateStyle}
				scrollKey={this.props.control.name}
				stateDisabled={stateDisabled}
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
				let visibleIndx = 0;
				for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
					const columnDef = this.props.control.subControls[colIndex];
					if (columnDef.visible) {
						columns.push(this._makeCell(columnDef, controlValue, rowIndex,
							colIndex, columnWidths[visibleIndx], stateStyle, stateDisabled));
						visibleIndx += 1;
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
		const subCell = (<SubPanelCell
			label={subItemButton.props.label}
			title={subItemButton.props.title}
			panel={subItemButton.props.panel}
			disabled={disabled}
			controller={this.props.controller}
			propertyId={this.props.propertyId}
			rightFlyout={this.props.rightFlyout}
		/>);
		return (<Td key={subPanelColIndex} column={"subPanel"} style={columnStyle}>{subCell}</Td>);
	}
}

ColumnStructureTableEditor.propTypes = {};
