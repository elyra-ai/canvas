/*
 * Copyright 2017-2019 IBM Corporation
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
/* eslint complexity: ["error", 25] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Table, Thead, Th, Tr, Td } from "reactable";
import Search from "carbon-components-react/lib/components/Search";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import Icon from "./../../../icons/icon.jsx";
import PropertyUtils from "./../../util/property-utils";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, TOOL_TIP_DELAY, STATES, ROW_CHECKBOX_WIDTH } from "./../../constants/constants";
import isEmpty from "lodash/isEmpty";
import ObserveSize from "react-observe-size";
import classNames from "classnames";
import uuid4 from "uuid/v4";

const sortDir = {
	ASC: "ASC",
	DESC: "DESC"
};

export default class FlexibleTable extends React.Component {

	constructor(props) {
		super(props);

		const sortDirs = {};
		if (typeof this.props.sortable !== "undefined") {
			for (var i = 0; i < this.props.sortable.length; i++) {
				const sortCol = this.props.sortable[i];
				sortDirs[sortCol] = sortDir.DESC;
			}
		}
		this.state = {
			columnSortDir: sortDirs,
			currentSortColumn: "",
			tableWidth: 0,
			tableHeight: 0
		};

		this.calculateColumnWidths = this.calculateColumnWidths.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
		this.onSort = this.onSort.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
		this.handleCheckedAllRows = this.handleCheckedAllRows.bind(this);
	}

	componentDidMount() {
		this._setHeaderElement();
		this._adjustTableHeight();
		window.addEventListener("resize", this._adjustTableHeight);
		this.tableNode = ReactDOM.findDOMNode(this.refs.table);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.rows !== this.props.rows ||
			prevProps.columns !== this.props.columns ||
			prevProps.noAutoSize !== this.props.noAutoSize) {
			this._setHeaderElement();
			this._adjustTableHeight();
		}
		if (prevProps.selectedRows !== this.props.selectedRows) {
			this.checkedAllRows = false;
		}
		this.tableNode = ReactDOM.findDOMNode(this.refs.table);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._adjustTableHeight);
	}

	onSort(spec) {
		if (this.props.onSort) {
			this.props.onSort(spec);
		}
	}

	/**
	* Calculate the width for each column to fit within the table
	* Widths provided in columns without 'px' are 'weighted' and will be scaled
	* Widths provided in columns with 'px' are used as is without scaling
	*   if width is provided with 'px', subtract that from the total available table width
	*   if width is provided, divide the column 'weighted' width with the max width from columns
	*     return the scaled factor
	*     multiply each column 'weighted' width with the scaled factor to get the actual width in pixels
	* @param columns column definitions
	* @param parentTableWidth
	*/
	calculateColumnWidths(columns, parentTableWidth) {
		let tableWidth = parentTableWidth - 15; // subtract 15 for the left padding scss $flexible-table-first-column-left-padding
		if (this.props.rowSelection !== "single") {
			tableWidth -= 40;
		}
		let remainingColumns = columns.length; // keep track of how many columns to calculate width for
		let maxWeight = 0;

		for (const columnDef of columns) {
			// if columns have specific width subtract from total width
			if (columnDef.width) {
				if (typeof columnDef.width === "string" && columnDef.width.includes("px")) {
					tableWidth -= parseInt(columnDef.width, 10);
					remainingColumns--;
				} else {
					maxWeight = Math.max(maxWeight, columnDef.width); // keep track of which column has highest width provided
				}
			}
		}
		const widths = [];
		const defaultWidth = Math.floor(tableWidth / remainingColumns); // use default width for columns without a weight
		const weightedWidths = [];
		let sumWeightedWidths = 0;

		// scale weight of columns with width provided
		for (const columnDef of columns) {
			if (columnDef.width && !isNaN(columnDef.width)) {
				weightedWidths.push(columnDef.width / maxWeight);
				sumWeightedWidths += (columnDef.width / maxWeight);
			} else {
				weightedWidths.push(null);
			}
		}

		const scaledWidth = tableWidth / sumWeightedWidths; // scaled width multiplier for each column with width provided

		let sumColumnWidth = 0;
		for (let idx = 0; idx < columns.length; idx++) {
			const columnDef = columns[idx];
			if (columnDef.width) {
				// use the width provided with 'px' as is
				if (typeof columnDef.width === "string" && columnDef.width.includes("px")) {
					widths.push(Math.floor(parseInt(columnDef.width, 10)) + "px");
					sumColumnWidth += parseInt(columnDef.width, 10);
				} else { // multiply the width provided by the scaled width
					const calculatedWidth = Math.floor(weightedWidths[idx] * scaledWidth);
					widths.push(calculatedWidth + "px");
					sumColumnWidth += calculatedWidth;
				}
			} else { // if no width provided, use the defaultWidth
				widths.push(defaultWidth);
				sumColumnWidth += defaultWidth;
			}
		}

		// if any columns had decimals floored, allocate additional space to the first column
		let compare = parentTableWidth;
		if (this.props.rowSelection !== "single") {
			compare -= 40;
		}

		if (sumColumnWidth < compare) {
			const firstColWith = parseInt(widths[0], 10);
			widths[0] = firstColWith + compare - sumColumnWidth + "px";
		}

		return widths;
	}

	_updateTableWidth(element) {
		if (this.state.tableWidth !== element.width) {
			this.setState({
				tableWidth: Math.floor(element.width - 2) // subtract 2 px for the borders
			});
		}
	}

	_adjustTableHeight() {
		if (this.props.noAutoSize) {
			return;
		}
		let newHeight = this.state.tableHeight;
		const rowHeight = 3; // in em
		const fixedHeaderHeight = 2.5;
		// Allow for the table header
		let headerHeight = 0;
		if (this.theadNode) {
			headerHeight = fixedHeaderHeight; // in em
		}
		const rows = this.props.rows ? this.props.rows : 4;
		if (rows > 0) {
			newHeight = (rowHeight * rows + headerHeight);
		} else {
			// A -1 row count indicates a desire to use the entire available vertical space
			const rootElement = document.getElementById("root");
			let container = rootElement ? rootElement.getElementsByClassName("properties-wf-children") : [];
			if (rootElement && container.length === 0) {
				container = rootElement.getElementsByClassName("bx--modal-content");
			}
			if (container.length > 0) {
				const parentElement = container[0];
				let tableElement = this.flexibleTableDiv ? this.flexibleTableDiv.parentNode.parentNode : null;
				if (!tableElement) {
					const tableElements =	parentElement.getElementsByClassName("properties-ft-container-wrapper");
					if (tableElements.length > 0) {
						tableElement = tableElements[tableElements.length - 1];
					}
				}
				if (tableElement) {
					const style = window.getComputedStyle(tableElement, null).getPropertyValue("font-size");
					const fontSize = parseFloat(style);
					// this is to adjust for multiple-select edit.
					// There is one additional row and header to account for.
					const minHeight = (rowHeight * 2 + headerHeight);
					newHeight = (parentElement.offsetHeight - tableElement.offsetTop) / fontSize + headerHeight;
					newHeight = Math.max(newHeight, minHeight);
				} else {
					newHeight = (rowHeight * 4 + headerHeight);
				}
			}
		}
		if (newHeight !== this.state.tableHeight) {
			this.setState({ tableHeight: newHeight });
		}
	}

	/**
	* This function will find the header elements in the table.  This is needed to be able to set the height style
	* on the tbody element so the scroll bar will display correctly.
	* TODO if we replace reactable with a carbon equivalent this code should be deleted.
	*/
	_setHeaderElement() {
		const tbodyNodes = (this.flexibleTableDiv) ? this.flexibleTableDiv.getElementsByTagName("tbody") : [];
		const theadNodes = (this.flexibleTableDiv) ? this.flexibleTableDiv.getElementsByTagName("thead") : [];
		if (tbodyNodes.length > 0) {
			this.tbodyNode = tbodyNodes[0];
		}
		if (theadNodes.length > 0) {
			this.theadNode = theadNodes[0];
		}
	}

	sortHeaderClick(columnName, evt) {
		const colSortDir = this.state.columnSortDir;
		if (typeof colSortDir[columnName] !== "undefined") {
			colSortDir[columnName] = (colSortDir[columnName] === sortDir.ASC) ? sortDir.DESC : sortDir.ASC;
			this.setState({
				columnSortDir: colSortDir,
				currentSortColumn: columnName
			});
		}
	}

	handleFilterChange(evt) {
		if (this.props.onFilter) {
			this.props.onFilter(evt.target.value);
		}
	}

	scrollToRow() {
		if (this.tableNode && typeof this.props.scrollToRow === "number") {
			const that = this;
			setTimeout(function() {
				var tableBody = that.tableNode.getElementsByClassName("reactable-data");
				var tableRows = tableBody[tableBody.length - 1].getElementsByTagName("tr");
				if (tableRows.length !== 0 && that.props.scrollToRow <= tableRows.length - 1 &&
				typeof tableRows[that.props.scrollToRow].scrollIntoView === "function") {
					const alignmentObject = {
						behavior: "smooth",
						block: "nearest",
						inline: "center"
					};
					tableRows[that.props.scrollToRow].scrollIntoView(alignmentObject);
				}
			}, 100);
		}
	}

	handleCheckedAllRows(checked) {
		let selectAll = [];
		const controlValue = this.props.data;
		if (checked) {
			selectAll = Array.from(this.props.selectedRows);
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				selectAll.push(rowIndex);
			}
		}
		selectAll = Array.from(new Set(selectAll));
		this.props.updateRowSelections(selectAll);
		this.checkedAllRows = checked;
	}

	handleCheckedRow(rowIndex, checked) {
		let current = this.props.selectedRows ? this.props.selectedRows : [];
		if (checked) {
			current = current.concat(rowIndex);
			if (current.length === this.props.data.length) {
				this.checkedAllRows = true;
			}
		} else if (current) {
			current = current.filter(function(element) {
				return element !== rowIndex;
			});
			this.checkedAllRows = false;
		}
		this.props.updateRowSelections(current);
	}


	/**
	* Generate the table header from this.props.columns
	* this.props.columns: array of objects
	* [
	*   {
	*     "key": string,
	*     "label": string,
	*     "width": integer or string if containts 'px',
	*     "description": optional string
	*   }
	* ]
	* @param columnWidths
	*/
	generateTableHeaderRow(columnWidths) {
		const headers = [];
		let searchLabel = "";
		let checked = false;
		const selectedRows = this.props.selectedRows ? this.props.selectedRows : [];
		if (this.checkedAllRows || selectedRows.length === this.props.data.length) {
			checked = true;
		}
		if (this.props.rowSelection !== "single") {
			if (this.props.columns.length > 0) {
				const checkboxColumnStyle = { "minWidth": ROW_CHECKBOX_WIDTH, "width": ROW_CHECKBOX_WIDTH };
				const checkboxLabel = (
					<Checkbox
						id= {uuid4() + "all-checkbox"}
						onChange={this.handleCheckedAllRows}
						hideLabel
						checked={checked}
						labelText={""}
					/>);
				headers.push(<Th key={"properties-ft-headers-all-checkbox"} column={"ft-checkbox"} style={checkboxColumnStyle} > {checkboxLabel} </Th>);
			}
		}
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			const columnStyle = { "minWidth": columnWidths[j], "width": columnWidths[j] };
			const tooltipId = uuid4() + "-tooltip-column-" + columnDef.key;
			//   wrap the label in a tooltip in case it overflows
			let headerLabel;
			if (typeof (columnDef.label) === "object") {
				headerLabel = columnDef.label.props.labelText;
			} else if (typeof (columnDef.label) === "string") {
				headerLabel = columnDef.label;
			}
			const description = columnDef.description;
			let tooltip;
			if (description && headerLabel) {
				tooltip = (
					<div className="properties-tooltips">
						<span style= {{ fontWeight: "bold" }}>{headerLabel}</span>
						<br />
						{description}
					</div>
				);
			} else if (description) {
				tooltip = (
					<div className="properties-tooltips">
						{description}
					</div>
				);
			} else if (headerLabel) {
				tooltip = (
					<div className="properties-tooltips">
						<span style= {{ fontWeight: "bold" }}>{headerLabel}</span>
					</div>
				);
			}
			if (typeof this.state.columnSortDir[columnDef.key] !== "undefined") {
				const arrowIcon = ((this.state.columnSortDir[columnDef.key] === sortDir.ASC)
					? <Icon type="upCaret" disabled={this.props.tableState === STATES.DISABLED} />
					: <Icon type="downCaret" disabled={this.props.tableState === STATES.DISABLED} />);
				const className = this.state.currentSortColumn === columnDef.key ? "sort-column-active" : "";
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle} >
					<div
						className="properties-ft-column properties-tooltips-container"
						onClick={this.sortHeaderClick.bind(this, columnDef.key)}
					>
						{ isEmpty(tooltip)
							? columnDef.label
							: <Tooltip
								id={tooltipId}
								tip={tooltip}
								direction="top"
								delay={TOOL_TIP_DELAY}
								className="properties-tooltips"
							>
								{columnDef.label}
							</Tooltip>
						}
						<div className="properties-ft-column-sort-icon">
							{arrowIcon}
						</div>
					</div>
				</Th>);
			} else {
				headers.push(<Th key={"properties-ft-headers" + j} column={columnDef.key} style={columnStyle}>
					<div className="properties-tooltips-container">
						{ isEmpty(tooltip)
							? columnDef.label
							: <Tooltip
								id={tooltipId}
								tip={tooltip}
								direction="top"
								delay={TOOL_TIP_DELAY}
								className="properties-tooltips"
							>
								{columnDef.label}
							</Tooltip>
						}
					</div>
				</Th>);
			}
			if (typeof this.props.filterable !== "undefined" && this.props.filterable[0] === columnDef.key) {
				searchLabel = columnDef.label;
			}
		}
		return {
			headers: headers,
			searchLabel: searchLabel
		};
	}

	/**
	* Generate the table body from this.props.data
	* this.props.data: object of columns
	* {
	*   className: string,
	*   onClickCallback: function,
	*   columns: array of objects where each object corresponds to a row in the table
	* }
	*
	* columns: array of objects
	* [
	*   {
	*     column: columnDef.name,
	*     width: columnDef.width,
	*     content: cellContent,
	*     className: cellClassName
	*   }
	* ]
	* @param columnWidths
	* @param tableWidth
	*/
	generateTableRows(columnWidths, tableWidth) {
		const tableRows = [];
		const selectedRows = this.props.selectedRows ? this.props.selectedRows : [];
		for (let ridx = 0; ridx < this.props.data.length; ridx++) {
			const row = this.props.data[ridx];
			const tableRowColumns = [];
			const onClickCallback = row.onClickCallback ? { onClick: row.onClickCallback } : null;
			const onDblClickCallback = row.onDblClickCallback ? { onDoubleClick: row.onDblClickCallback } : null;
			let rowClassName = "table-row ";
			if (row.disabled) {
				rowClassName += "disabled ";
			}
			if (row.className) {
				rowClassName += row.className;
			}
			if (this.props.rowSelection === "single") { // If row is single edit, no checkbox
				if (selectedRows.indexOf(ridx) >= 0) {
					rowClassName += " table-selected-single-row";
				} else {
					rowClassName += " table-single-row";
				}
			} else if (this.props.summaryTable) { // If row is summary row for MSE, must account for empty checkbox space on left.
				const checkboxColWidth = { "minWidth": ROW_CHECKBOX_WIDTH, "width": ROW_CHECKBOX_WIDTH };
				rowClassName += " table-summary-row";
				const content = "";
				tableRowColumns.push(<Td
					key={this.props.scrollKey + "-row-" + ridx + "checkbox"}
					style={checkboxColWidth}
					column="ft-checkbox"
				>
					{content}
				</Td>
				);
			} else { // else if row for multi selection, add checkbox
				if (selectedRows.indexOf(ridx) >= 0 && !this.props.summaryTable) {
					rowClassName += " table-selected-row";
				}
				let checked = false;
				if (this.checkedAllRows) {
					checked = true;
				} else if (selectedRows) {
					for (let j = 0; j < selectedRows.length; j++) {
						const key = selectedRows[j];
						if (key === ridx) {
							checked = true;
							break;
						}
					}
				}
				const checkboxColWidth = { "minWidth": ROW_CHECKBOX_WIDTH, "width": ROW_CHECKBOX_WIDTH };
				const checkboxContent =
					(
						<div className="row-checkbox">
							<Checkbox id={uuid4() + "select-row"}
								checked = {checked}
								onChange={this.handleCheckedRow.bind(this, ridx)}
								disabled={row.disabled}
								hideLabel
								labelText={""}
							/>
						</div>
					);
				tableRowColumns.push(<Td
					key={this.props.scrollKey + "-row-" + ridx + "checkbox"}
					column={"ft-checkbox"}
					style={checkboxColWidth}
					className={""}
				>
					{checkboxContent}
				</Td>);
			}
			if (row.columns) {
				for (let cidx = 0; cidx < row.columns.length; cidx++) {
					const column = row.columns[cidx];
					const colWidth = { "minWidth": columnWidths[cidx], "width": columnWidths[cidx] };
					const value = column.value ? { value: column.value } : {};
					tableRowColumns.push(<Td
						key={this.props.scrollKey + "-row-" + ridx + "-col-" + cidx}
						column={column.column}
						data-label={column.column}
						style={colWidth}
						className={column.className ? column.className : ""}
						value={column.fieldName}
						{...value}
					>
						{column.content}
					</Td>);
				}
			}
			// need to assign width to table row so scrollbar from mouse will not push contents
			tableRows.push(<Tr
				{...onClickCallback}
				{...onDblClickCallback}
				key={this.props.scrollKey + "-row-" + ridx}
				className={rowClassName}
				style={{ width: tableWidth }}
			>{tableRowColumns}</Tr>);
		}
		return tableRows;
	}
	render() {
		const hideTableHeader = this.props.showHeader ? {} : { "hideTableHeader": true };

		const tableWidth = this.state.tableWidth;
		const tableHeight = this.state.tableHeight; // subtract 2 px for the borders
		const columnWidths = this.calculateColumnWidths(this.props.columns, tableWidth);
		const headerInfo = this.generateTableHeaderRow(columnWidths);

		const headers = headerInfo.headers;
		const searchLabel = headerInfo.searchLabel;
		const tableContent = this.generateTableRows(columnWidths, tableWidth);
		const disabled = this.props.tableState === STATES.DISABLED;

		let renderTable = "";
		let searchBar = null;
		let filterProps = {};

		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.TABLE_SEARCH_PLACEHOLDER, MESSAGE_KEYS_DEFAULTS.TABLE_SEARCH_PLACEHOLDER) + " " + searchLabel;

			searchBar = (
				<div className={classNames("properties-ft-search-container", { "disabled": disabled })}>
					<Search
						className="properties-ft-search-text"
						placeHolderText={placeHolder}
						onChange={this.handleFilterChange}
						disabled={disabled}
						small
						labelText={""}
					/>
				</div>

			);

			if (this.props.showHeader) {
				filterProps = {
					filterable: this.props.filterable,
					hideFilterInput: true,
					filterBy: this.props.filterKeyword
				};
			}
		}

		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			this.scrollToRow();
		}

		// adjust the height of the body so it can scroll correctly, in em
		if (this.tbodyNode) {
			let clientHeightEm;
			if (this.flexibleTableDiv.clientHeight) {
				const fontSize = parseFloat(getComputedStyle(document.querySelector("table"))["font-size"]);
				clientHeightEm = this.flexibleTableDiv.clientHeight / fontSize;
			}
			this.tbodyNode.style.height = (this.theadNode && (clientHeightEm - 2.5) !== 0) ? (clientHeightEm - 2.5) + "em" : "auto";
			this.tbodyNode.style.width = (tableWidth) ? tableWidth + "px" : "auto"; // table body renders wider than the table even when contents are also tableWidth
		}

		const heightStyle = (this.props.noAutoSize || tableHeight === 0) ? {} : { height: tableHeight + "em" };
		const containerId = this.props.showHeader ? "properties-ft-container" : "properties-ft-container-noheader";
		const containerClass = this.props.showHeader ? "properties-ft-container-absolute " : "properties-ft-container-absolute-noheader ";
		const tableClass = (this.props.rowSelection === "single") ? "table single properties-ft" : "table properties-ft";
		const messageClass = (!this.props.messageInfo) ? containerClass + STATES.INFO : containerClass + this.props.messageInfo.type;
		renderTable = (
			<div>
				{searchBar}
				<div className="properties-ft-container-panel">
					{this.props.topRightPanel}
					<ObserveSize observerFn={(element) => this._updateTableWidth(element)}>
						<div className="properties-ft-container-wrapper" style={ heightStyle }>
							<div className={messageClass}>
								<div ref={ (ref) => (this.flexibleTableDiv = ref) } className={containerId} style={{ width: tableWidth }}>
									{this.props.selectedEditRow}
									<Table {...filterProps}
										className={tableClass}
										ref="table"
										sortable={this.props.sortable}
										onSort={this.onSort}
										{...hideTableHeader}
									>
										<Thead key="properties-ft-thead">
											{headers}
										</Thead>
										{tableContent}
									</Table>
								</div>
							</div>
						</div>
					</ObserveSize>
				</div>
			</div>
		);

		return (
			<div data-id={"properties-ft-" + this.props.scrollKey} className="properties-ft-control-container">
				{renderTable}
			</div>
		);
	}
}

FlexibleTable.defaultProps = {
	showHeader: true
};

FlexibleTable.propTypes = {
	sortable: PropTypes.array,
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	filterable: PropTypes.array,
	filterBy: PropTypes.string,
	filterKeyword: PropTypes.string,
	hideFilterInput: PropTypes.func,
	scrollToRow: PropTypes.number,
	onSort: PropTypes.func,
	onFilter: PropTypes.func,
	showHeader: PropTypes.bool,
	selectedEditRow: PropTypes.object,
	topRightPanel: PropTypes.object,
	scrollKey: PropTypes.string,
	controller: PropTypes.object,
	rows: PropTypes.number,
	noAutoSize: PropTypes.bool,
	tableState: PropTypes.string,
	messageInfo: PropTypes.object,
	updateRowSelections: PropTypes.func,
	selectedRows: PropTypes.array,
	rowSelection: PropTypes.string,
	summaryTable: PropTypes.bool
};
