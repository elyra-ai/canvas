/*
 * Copyright 2017-2020 IBM Corporation
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
import { Search } from "carbon-components-react";
import VirtualizedTable from "./../virtualized-table/virtualized-table.jsx";
import PropertyUtils from "./../../util/property-utils";
import { MESSAGE_KEYS, SORT_DIRECTION, STATES, ROW_HEIGHT, ROW_SELECTION } from "./../../constants/constants";
import ReactResizeDetector from "react-resize-detector";
import classNames from "classnames";
import has from "lodash/has";

export default class FlexibleTable extends React.Component {

	constructor(props) {
		super(props);

		const sortDirs = {};
		if (typeof this.props.sortable !== "undefined") {
			for (var i = 0; i < this.props.sortable.length; i++) {
				const sortCol = this.props.sortable[i];
				sortDirs[sortCol] = SORT_DIRECTION.DESC;
			}
		}
		this.state = {
			checkedAllRows: false,
			columnSortDir: sortDirs,
			currentSortColumn: "",
			tableWidth: 0,
			tableHeight: 0
		};

		this.rowHeight = this.rowHeight.bind(this);
		this.rowGetter = this.rowGetter.bind(this);

		this.calculateColumnWidths = this.calculateColumnWidths.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.onSort = this.onSort.bind(this);
		this.sortHeaderClick = this.sortHeaderClick.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
		this.handleCheckedRow = this.handleCheckedRow.bind(this);
		this.handleCheckedAllRows = this.handleCheckedAllRows.bind(this);
	}

	componentDidMount() {
		this._adjustTableHeight();
		window.addEventListener("resize", this._adjustTableHeight);
		this.tableNode = ReactDOM.findDOMNode(this.refs.table);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.rows !== this.props.rows ||
			prevProps.columns !== this.props.columns ||
			prevProps.noAutoSize !== this.props.noAutoSize) {
			this._adjustTableHeight();
		}

		// Calculate if checkedAllRows is true
		if (this.props.selectedRows) {
			this.setCheckedAll(this.props.selectedRows);
		}

		this.tableNode = ReactDOM.findDOMNode(this.refs.table);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._adjustTableHeight);
	}

	onSort({ sortBy }) {
		if (this.props.onSort) {
			const sortDirection = (this.state.columnSortDir[sortBy] === SORT_DIRECTION.ASC) ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
			const spec = {
				column: sortBy,
				direction: sortDirection
			};
			this.props.onSort(spec);
		}
	}

	/**
	* The current displayed row may have an index that is different from its actual index within the dataset
	* Given the current displayed row and index of the table,
	*  return its original row index from its row's propertyId
	*/
	getOriginalRowIndex(row, index) {
		let rowIndex = index;
		if (row.columns && has(row.columns[0], "content.props.children.props.propertyId.row")) {
			rowIndex = row.columns[0].content.props.children.props.propertyId.row;
		} else if (typeof row.rowKey === "number") { // expression tables uses rowKey
			rowIndex = parseInt(row.rowKey, 10);
		}
		return rowIndex;
	}

	/**
	* The header checkAll box may change depending on the current visible rows
	* Determine if all visible rows in the table are currently selected
	*  and set the `checkedAllRows` state accordingly
	*/
	setCheckedAll(selectedRows) {
		let checkAll = true;
		for (let idx = 0; idx < this.props.data.length; idx++) {
			const row = this.props.data[idx];
			const originalRowIndex = this.getOriginalRowIndex(row, idx);
			if (selectedRows.indexOf(originalRowIndex) < 0) {
				checkAll = false;
				break;
			}
		}
		if (this.state.checkedAllRows !== checkAll) {
			this.setState({ checkedAllRows: checkAll });
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
		if (this.props.rowSelection !== ROW_SELECTION.SINGLE) {
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
		if (this.props.rowSelection !== ROW_SELECTION.SINGLE) {
			compare -= 40;
		}

		if (sumColumnWidth < compare) {
			const firstColWith = parseInt(widths[0], 10);
			widths[0] = firstColWith + compare - sumColumnWidth + "px";
		}

		return widths;
	}

	_updateTableWidth(width, height) {
		if (this.state.tableWidth !== Math.floor(width - 2)) {
			this.setState({
				tableWidth: Math.floor(width - 2) // subtract 2 px for the borders
			});
		}
	}

	_adjustTableHeight() {
		if (this.props.noAutoSize) {
			return;
		}
		let newHeight = this.state.tableHeight;
		const rowHeight = 3; // in em
		const headerHeight = 3; // in em
		const rows = typeof this.props.rows !== "undefined" ? this.props.rows : 4;
		if (rows > 0) {
			newHeight = (rowHeight * rows + headerHeight);
		} else if (rows === 0) { // only display header
			newHeight = headerHeight;
		} else {
			// A -1 row count indicates a desire to use the entire available vertical space
			const rootElement = document.getElementById("root");
			let container = rootElement ? rootElement.getElementsByClassName("properties-wf-children") : [];
			if (rootElement && container.length === 0) {
				container = rootElement.getElementsByClassName("bx--modal-content");
			}
			if (container.length > 0) {
				const parentElement = container[0];
				const tableElements =	parentElement.getElementsByClassName("properties-ft-container-wrapper");
				const tableElement = tableElements.length > 0 ? tableElements[tableElements.length - 1] : null;
				if (tableElement) {
					const style = window.getComputedStyle(tableElement, null).getPropertyValue("font-size");
					const fontSize = parseFloat(style);
					// this is to adjust for multiple-select edit.
					// There is one additional row and header to account for.
					const minHeight = (rowHeight + headerHeight);
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

	sortHeaderClick({ dataKey }) {
		const colSortDir = this.state.columnSortDir;
		if (typeof colSortDir[dataKey] !== "undefined") {
			colSortDir[dataKey] = (colSortDir[dataKey] === SORT_DIRECTION.ASC) ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
			this.setState({
				columnSortDir: colSortDir,
				currentSortColumn: dataKey
			});
		}
	}

	handleFilterChange(evt) {
		if (this.props.onFilter) {
			this.props.onFilter(evt.target.value);
		}
	}

	handleCheckedAllRows(checked) {
		let selectAll = [];
		const controlValue = this.props.data;
		if (checked) {
			selectAll = Array.from(this.props.selectedRows);
			for (var rowIndex = 0; rowIndex < controlValue.length; rowIndex++) {
				const originalRowIndex = this.getOriginalRowIndex(controlValue[rowIndex], rowIndex);
				selectAll.push(originalRowIndex);
			}
		}
		selectAll = Array.from(new Set(selectAll));
		this.props.updateRowSelections(selectAll);
		this.setState({ checkedAllRows: checked });
	}

	handleCheckedRow(data, evt) {
		const dataRowIndex = data.originalRowIndex; // Use the originalRowIndex for selection in case rows are filtered.
		const displayedRowIndex = data.index;
		const checked = data.selected;
		const overSelectOption = data.isOverSelectOption;

		if (!this.props.data[displayedRowIndex].disabled) {
			if (overSelectOption) { // Checkbox is clicked
				let current = this.props.selectedRows ? this.props.selectedRows : [];
				if (checked) {
					current = current.concat(dataRowIndex);
					this.setCheckedAll(current);
				} else if (current) {
					current = current.filter(function(element) {
						return element !== dataRowIndex;
					});
					this.setState({ checkedAllRows: false });
				}
				this.props.updateRowSelections(current);
			} else if (this.props.rowSelection === ROW_SELECTION.SINGLE) { // Table row is clicked
				this.props.updateRowSelections(data.index, evt, this.props.data[data.index].rowKey);
			}
		}
	}


	/**
	* Generate the table header specs from this.props.columns
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
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			if (typeof this.props.filterable !== "undefined" && this.props.filterable[0] === columnDef.key) {
				searchLabel = columnDef.label;
			}
			const width = Math.abs(parseInt(columnWidths[j], 10));
			let headerLabel;
			if (typeof (columnDef.label) === "object") {
				headerLabel = columnDef.label.props.labelText;
			} else if (typeof (columnDef.label) === "string") {
				headerLabel = columnDef.label;
			}
			headers.push({ key: columnDef.key, label: columnDef.label, width: width, description: columnDef.description, headerLabel: headerLabel });
		}
		return {
			headers: headers,
			searchLabel: searchLabel
		};
	}

	/**
	* Callback responsible for returning a data row given an index
	*/
	rowGetter({ index }) {
		const row = this.props.data[index];
		const originalRowIndex = this.getOriginalRowIndex(row, index);

		const columns = {};
		if (row.columns) {
			for (let cidx = 0; cidx < row.columns.length; cidx++) {
				const column = row.columns[cidx];
				columns[column.column] = column.content;
			}
		}
		return Object.assign({}, columns, {
			loading: false,
			index: index,
			originalRowIndex: originalRowIndex,
			rowKey: typeof row.rowKey !== "undefined" ? row.rowKey : this.props.scrollKey + "-row-" + index,
			disabled: row.disabled
		});
	}

	// Function that returns the height of a row given its index
	rowHeight({ index }) {
		return ROW_HEIGHT;
	}

	render() {
		const tableWidth = this.state.tableWidth;
		const tableHeight = this.state.tableHeight; // subtract 2 px for the borders
		const columnWidths = this.calculateColumnWidths(this.props.columns, tableWidth);
		const headerInfo = this.generateTableHeaderRow(columnWidths);

		const headers = headerInfo.headers;
		const searchLabel = headerInfo.searchLabel;
		const disabled = this.props.tableState === STATES.DISABLED;

		let searchBar = null;

		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.TABLE_SEARCH_PLACEHOLDER) + " " + searchLabel;

			searchBar = (
				<div className={classNames("properties-ft-search-container", { "disabled": disabled })}>
					<Search
						className="properties-ft-search-text"
						placeHolderText={placeHolder}
						onChange={this.handleFilterChange}
						disabled={disabled}
						size="sm"
						labelText={""}
					/>
				</div>
			);
		}

		let scrollIndex = -1;
		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			scrollIndex = this.props.scrollToRow;
		}

		const heightStyle = (this.props.noAutoSize || tableHeight === 0) ? {} : { height: tableHeight + "em" };
		const containerClass = this.props.showHeader ? "properties-ft-container-absolute " : "properties-ft-container-absolute-noheader ";
		const messageClass = (!this.props.messageInfo) ? containerClass + STATES.INFO : containerClass + this.props.messageInfo.type;

		return (
			<div data-id={"properties-ft-" + this.props.scrollKey} className="properties-ft-control-container">
				{searchBar}
				<div className="properties-ft-container-panel">
					{this.props.topRightPanel}
					<ReactResizeDetector handleWidth onResize={this._updateTableWidth}>
						<div className="properties-ft-container-wrapper" style={ heightStyle }>
							<div className={messageClass}>
								{this.props.selectedEditRow}
								<VirtualizedTable
									columns={headers}
									onHeaderClick={this.sortHeaderClick}
									rowCount={this.props.data.length}
									rowHeight={this.rowHeight}
									rowGetter={this.rowGetter}
									summaryTable={this.props.summaryTable}
									selectable={typeof this.props.updateRowSelections !== "undefined"}
									rowSelection={this.props.rowSelection}
									disableHeader={!this.props.showHeader}
									onRowDoubleClick={this.props.onRowDoubleClick}
									rowsSelected={this.props.selectedRows}
									checkedAll={this.state.checkedAllRows}
									setRowsSelected={this.handleCheckedRow}
									setAllRowsSelected={this.handleCheckedAllRows}
									scrollKey={this.props.scrollKey}
									onSort={this.onSort}
									sortBy={this.state.currentSortColumn}
									sortColumns={this.state.columnSortDir}
									sortDirection={this.state.columnSortDir[this.state.currentSortColumn]}
									tableState={this.props.tableState}
									{...(scrollIndex !== -1 && { scrollToIndex: scrollIndex, scrollToAlignment: "center" })}
								/>
							</div>
						</div>
					</ReactResizeDetector>
				</div>
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
	onRowDoubleClick: PropTypes.func,
	selectedRows: PropTypes.array,
	rowSelection: PropTypes.string,
	summaryTable: PropTypes.bool
};
