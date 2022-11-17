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
/* eslint complexity: ["error", 25] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import { injectIntl } from "react-intl";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Search } from "carbon-components-react";
import VirtualizedTable from "./../virtualized-table/virtualized-table.jsx";
import { REM_ROW_HEIGHT, REM_HEADER_HEIGHT, ONE_REM_HEIGHT, SORT_DIRECTION, STATES, ROW_HEIGHT, ROW_SELECTION } from "./../../constants/constants";
import ReactResizeDetector from "react-resize-detector";
import classNames from "classnames";
import { has, isEmpty } from "lodash";
import defaultMessages from "../../../../locales/common-properties/locales/en.json";

class FlexibleTable extends React.Component {

	constructor(props) {
		super(props);

		const sortDirs = {};
		if (typeof this.props.sortable !== "undefined") {
			for (var i = 0; i < this.props.sortable.length; i++) {
				const sortCol = this.props.sortable[i];
				sortDirs[sortCol] = SORT_DIRECTION.NOT_SORTED;
			}
		}
		this.state = {
			checkedAllRows: false,
			columnSortDir: sortDirs,
			currentSortColumn: "",
			tableWidth: 0,
			tableHeight: 0,
			rows: typeof props.rows !== "undefined" ? props.rows : 5.5,
			dynamicHeight: null
		};

		this.rowHeight = this.rowHeight.bind(this);
		this.rowGetter = this.rowGetter.bind(this);

		this.getOriginalRowIndex = this.getOriginalRowIndex.bind(this);
		this.getLastChildPropertyIdRow = this.getLastChildPropertyIdRow.bind(this);

		this.calculateColumnWidths = this.calculateColumnWidths.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.onSort = this.onSort.bind(this);
		this.sortHeaderClick = this.sortHeaderClick.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
		this.handleCheckedRow = this.handleCheckedRow.bind(this);
		this.handleCheckedAllRows = this.handleCheckedAllRows.bind(this);
		this.handleCheckedMultipleRows = this.handleCheckedMultipleRows.bind(this);
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
		if (this.props.selectedRows && !isEmpty(this.props.data)) {
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
		if (row.columns && has(row.columns[0], "content.props.children.props.propertyId.propertyId")) {
			// this is a nested control
			rowIndex = this.getLastChildPropertyIdRow(row.columns[0].content.props.children.props.propertyId, index);
		} else if (row.columns && has(row.columns[0], "content.props.children.props.propertyId.row")) {
			rowIndex = row.columns[0].content.props.children.props.propertyId.row;
		} else if (typeof row.rowKey === "number") { // expression tables uses rowKey
			rowIndex = parseInt(row.rowKey, 10);
		}
		return rowIndex;
	}

	// Get the 'row' of the last child's propertyId
	getLastChildPropertyIdRow(propertyId, defaultRowIndex) {
		if (typeof propertyId.propertyId !== "undefined") {
			return this.getLastChildPropertyIdRow(propertyId.propertyId);
		}
		if (typeof propertyId.row !== "undefined") {
			return propertyId.row;
		}
		return defaultRowIndex;
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
		let tableWidth = parentTableWidth - 12; // subtract 12 for the left padding scss $spacing-04
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
		let dynamicH = this.state.dynamicHeight;
		const multiSelectTableHeight = REM_ROW_HEIGHT + REM_HEADER_HEIGHT;
		if (Array.isArray(this.props.data) && this.props.data.length < this.state.rows) {
			newHeight = (REM_ROW_HEIGHT * this.props.data.length + REM_HEADER_HEIGHT + (this.props.selectedEditRow ? multiSelectTableHeight : 0)) + "rem";
		} else if (this.state.rows > 0) {
			newHeight = (REM_ROW_HEIGHT * this.state.rows + REM_HEADER_HEIGHT + (this.props.selectedEditRow ? multiSelectTableHeight : 0)) + "rem";
		} else if (this.state.rows === 0) { // only display header
			newHeight = REM_HEADER_HEIGHT + "rem";
		} else if (this.state.rows === -1) {
			if (this.flexibleTable) {
				const labelAndDescriptionHeight = 50; // possible dynamically set this in the future
				const ftHeaderHeight = (typeof this.flexibleTableHeader !== "undefined") ? ReactDOM.findDOMNode(this.flexibleTableHeader).getBoundingClientRect().height : 0;
				const flyoutHeight = this.findPropertyNodeHeight(this.flexibleTable, "properties-wf-children");
				if (flyoutHeight === 0) {
					newHeight = "100vh"; // set full window height if flyout height not found
					dynamicH = -1;
				} else {
					newHeight = `calc(${flyoutHeight - ftHeaderHeight - labelAndDescriptionHeight}px - 3.5rem)`; // 3.5rem to adjust padding
					dynamicH = (flyoutHeight - ftHeaderHeight - labelAndDescriptionHeight) - (3.5 * 16);
				}
			}
		}
		if (newHeight !== this.state.tableHeight) {
			this.setState({ tableHeight: newHeight, dynamicHeight: dynamicH });
		}
	}

	findPropertyNodeHeight(node, className) {
		if (node && node.parentNode && node.parentNode.className && node.parentNode.className.includes(className)) {
			const foundNode = ReactDOM.findDOMNode(node.parentNode).getBoundingClientRect();
			if (foundNode) {
				return foundNode.height;
			}
			return 0;
		} else if (node && node.parentNode) {
			return this.findPropertyNodeHeight(node.parentNode, className);
		}
		return 0;
	}

	sortHeaderClick({ dataKey }) {
		const colSortDir = this.state.columnSortDir;
		if (typeof colSortDir[dataKey] !== "undefined") {
			// At a time only 1 column will be shown as sorted. Revert other columns to not sorted.
			Object.keys(colSortDir).forEach((key) => {
				if (key !== dataKey) {
					colSortDir[key] = SORT_DIRECTION.NOT_SORTED;
				}
			});
			// Only dataKey column will be sorted
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

	/**
	* This method is called when user wants to select multiple rows using shift key
	* Select/deselect all rows between lastCheckedRow and existingRow
	* @param lastCheckedRow (integer) - index of last selected row
	* @param existingRow (integer) - index of row where shift key is clicked
	* @param checked (boolean) - rows are to be selected or deselected
	*/
	handleCheckedMultipleRows(lastCheckedRow, existingRow, checked) {
		let selectedRows = this.props.selectedRows ? this.props.selectedRows : [];
		// Calculate rows between lastChecked row and existingRow
		let inBetweenRows;
		if (lastCheckedRow < existingRow) {
			inBetweenRows = Array.from({ length: (existingRow - lastCheckedRow) + 1 }, (_, i) => lastCheckedRow + i);
		} else {
			inBetweenRows = Array.from({ length: (lastCheckedRow - existingRow) + 1 }, (_, i) => existingRow + i);
		}
		// if selectedRows already has inBetweenRows, remove them first
		selectedRows = selectedRows.filter((row) => !inBetweenRows.includes(row)); // Deselecting inBetweenRows using shift key
		if (checked) {
			selectedRows = selectedRows.concat(inBetweenRows); 	// Selecting inBetweenRows using shift key
		}
		return selectedRows;
	}

	handleCheckedRow(data, evt) {
		const dataRowIndex = data.originalRowIndex; // Use the originalRowIndex for selection in case rows are filtered.
		const displayedRowIndex = data.index;
		const checked = data.selected;
		const overSelectOption = data.isOverSelectOption;

		if (!this.props.data[displayedRowIndex].disabled) {
			if (overSelectOption) { // Checkbox is clicked
				let current = this.props.selectedRows ? this.props.selectedRows : [];
				if (data.selectMultipleRows) { // multiple rows selected/deselected using shift key
					current = this.handleCheckedMultipleRows(data.lastCheckedRow, displayedRowIndex, checked);
					this.setCheckedAll(current);
				} else if (checked) { // single row selected
					current = current.concat(dataRowIndex);
					this.setCheckedAll(current);
				} else if (current) { // single row  deselected
					current = current.filter(function(element) {
						return element !== dataRowIndex;
					});
					this.setState({ checkedAllRows: false });
				}
				// Sort ascending because we want to add selected rows in the same order as they're displayed in the table
				current.sort((a, b) => a - b);
				this.props.updateRowSelections(current);
			} else if (this.props.rowSelection === ROW_SELECTION.SINGLE && typeof this.props.updateRowSelections !== "undefined") { // Table row is clicked
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
	*     "description": optional string,
	*     "resizable": optional boolean,
	*     "staticWidth": optional boolean - This is a special property added only for SPSS modeler which directly calls FlexibleTable. This property is NOT a part of uiHints.
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
			headers.push({
				key: columnDef.key,
				label: columnDef.label,
				width: width,
				description: columnDef.description,
				headerLabel: headerLabel,
				resizable: columnDef.resizable,
				operation: columnDef.operation,
				staticWidth: columnDef.staticWidth ? columnDef.staticWidth : false // Used to exclude a column from resizing. If true, "resizable" value will be ignored.
			});
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
		const columnWidths = this.calculateColumnWidths(this.props.columns, tableWidth);
		const headerInfo = this.generateTableHeaderRow(columnWidths);

		const headers = headerInfo.headers;
		const searchLabel = headerInfo.searchLabel;
		const disabled = this.props.tableState === STATES.DISABLED;

		let searchBar = null;

		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = this.props.intl.formatMessage(
				{ id: "table.search.placeholder", defaultMessage: defaultMessages["table.search.placeholder"] },
				{ column_name: searchLabel }
			);
			const searchBarLabel = this.props.intl.formatMessage(
				{ id: "table.search.label", defaultMessage: defaultMessages["table.search.label"] },
				{ table_name: this.props.tableLabel }
			);

			searchBar = (
				<div className={classNames("properties-ft-search-container", { "disabled": disabled })}>
					<Search
						className="properties-ft-search-text"
						placeholder={placeHolder}
						onChange={this.handleFilterChange}
						disabled={disabled}
						size="sm"
						labelText={searchBarLabel}
						light={this.props.light}
					/>
				</div>
			);
		}

		let scrollIndex = -1;
		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			scrollIndex = this.props.scrollToRow;
		}

		let heightStyle = {};
		if (!this.props.noAutoSize) {
			heightStyle = { height: this.state.tableHeight };
		}

		const containerClass = this.props.showHeader ? "properties-ft-container-absolute " : "properties-ft-container-absolute-noheader ";
		const messageClass = (!this.props.messageInfo) ? containerClass + STATES.INFO : containerClass + this.props.messageInfo.type;
		const ftHeader = (searchBar || this.props.topRightPanel)
			? (<div className="properties-ft-table-header" ref={ (ref) => (this.flexibleTableHeader = ref) }>
				{searchBar}
				{this.props.topRightPanel}
			</div>)
			: null;

		const emptyTableContent = isEmpty(this.props.data)
			? (
				<div className="properties-ft-empty-table">
					{this.props.emptyTablePlaceholder}
				</div>
			)
			: null;

		let tableHeight = 0;
		const multiSelectEditRowsRem = 2 * REM_HEADER_HEIGHT; // multi-select adds two rows when selectedEditRow
		const multiSelectEditRowsPixels = multiSelectEditRowsRem * ONE_REM_HEIGHT;
		if (this.state.rows !== -1 && this.state.tableHeight) {
			const remHeight = parseInt(this.state.tableHeight.match(/^[0-9]{1,2}/i)[0], 10);
			tableHeight = (remHeight - (this.props.selectedEditRow ? multiSelectEditRowsRem : 0)) * ONE_REM_HEIGHT;
		} else if (this.state.rows === -1) {
			if (this.state.dynamicHeight && this.state.dynamicHeight !== -1) {
				tableHeight = this.state.dynamicHeight - (this.props.selectedEditRow ? multiSelectEditRowsPixels : 0);
			} // else how do we handle this.state.tableHeight = "100vh"?
		}
		console.log(tableHeight);

		return (
			<div data-id={"properties-ft-" + this.props.scrollKey} className="properties-ft-control-container" ref={ (ref) => (this.flexibleTable = ref) }>
				{ftHeader}
				<div className="properties-ft-container-panel">
					<ReactResizeDetector handleWidth onResize={this._updateTableWidth}>
						<div className="properties-ft-container-wrapper" style={ heightStyle }>
							<div className={messageClass}>
								{this.props.selectedEditRow}
								<VirtualizedTable
									tableLabel={this.props.tableLabel}
									tableHeight={tableHeight}
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
									light={this.props.light}
									{...(scrollIndex !== -1 && { scrollToIndex: scrollIndex, scrollToAlignment: "center" })}
								/>
							</div>
						</div>
					</ReactResizeDetector>
				</div>
				{emptyTableContent}
			</div>
		);
	}
}

FlexibleTable.defaultProps = {
	showHeader: true,
	light: true,
	emptyTablePlaceholder: ""
};

FlexibleTable.propTypes = {
	sortable: PropTypes.array,
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	emptyTablePlaceholder: PropTypes.string,
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
	tableLabel: PropTypes.string,
	rows: PropTypes.number,
	noAutoSize: PropTypes.bool,
	tableState: PropTypes.string,
	messageInfo: PropTypes.object,
	updateRowSelections: PropTypes.func,
	onRowDoubleClick: PropTypes.func,
	selectedRows: PropTypes.array,
	rowSelection: PropTypes.string,
	summaryTable: PropTypes.bool,
	light: PropTypes.bool,
	intl: PropTypes.object.isRequired
};

export default injectIntl(FlexibleTable);
