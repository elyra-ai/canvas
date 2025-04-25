/*
 * Copyright 2017-2025 Elyra Authors
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
/* eslint complexity: ["error", 27] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import { injectIntl } from "react-intl";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Search, Layer } from "@carbon/react";
import classNames from "classnames";
import { has, isEmpty } from "lodash";

import VirtualizedGrid from "./../virtualized-grid/virtualized-grid.jsx";
import VirtualizedTable from "./../virtualized-table/virtualized-table.jsx";
import { REM_ROW_HEIGHT, REM_HEADER_HEIGHT, ONE_REM_HEIGHT, SORT_DIRECTION, STATES, ROW_HEIGHT, ROW_SELECTION } from "./../../constants/constants";
import defaultMessages from "../../../../locales/common-properties/locales/en.json";

const COLUMN_PADDING_BUFFER = 12;
const DEFAULT_COL_MIN_WIDTH = 40; // Carbon table standard to display minimum 1 character

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
			excessWidth: 0,
			availableWidth: 0, // Space available to render the table
			tableWidth: 0, // The width of the entire table, sum total of each column's width
			tableHeight: 0,
			headerHeight: 0,
			rows: typeof props.rows !== "undefined" ? props.rows : 5.5,
			dynamicHeight: null
		};

		this.rowHeight = this.rowHeight.bind(this);
		this.rowGetter = this.rowGetter.bind(this);

		this.tableRef = React.createRef();
		this.flexibleTableHeader = React.createRef();

		this.getOriginalRowIndex = this.getOriginalRowIndex.bind(this);
		this.getLastChildPropertyIdRow = this.getLastChildPropertyIdRow.bind(this);

		this.calculateColumnWidths = this.calculateColumnWidths.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.onSortVT = this.onSortVT.bind(this);
		this.onSort = this.onSort.bind(this);
		this.sortHeaderClick = this.sortHeaderClick.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._updateRows = this._updateRows.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
		this.updateHeaderHeight = this.updateHeaderHeight.bind(this);
		this.updateExcessWidth = this.updateExcessWidth.bind(this);
		this.handleCheckedRow = this.handleCheckedRow.bind(this);
		this.handleCheckedAllRows = this.handleCheckedAllRows.bind(this);
		this.handleCheckedMultipleRows = this.handleCheckedMultipleRows.bind(this);
	}

	componentDidMount() {
		this._updateTableWidth(this.tableRef.current.getBoundingClientRect(), this.tableRef.current);
		this.calculateColumnWidths();
		this._adjustTableHeight();

		this.headerObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this.updateHeaderHeight(entry.contentRect);
			}
		});
		if (this.flexibleTableHeader.current) {
			this.headerObserver.observe(this.flexibleTableHeader.current);
		}

		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this._updateTableWidth(entry.contentRect, entry.target);
			}
		});
		if (this.tableRef.current) {
			this.resizeObserver.observe(this.tableRef.current);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.rows !== this.props.rows) {
			this._updateRows();
		}

		if (prevProps.columns !== this.props.columns ||
			prevProps.noAutoSize !== this.props.noAutoSize ||
			prevState.availableWidth !== this.state.availableWidth
		) {
			this._adjustTableHeight();
			this.calculateColumnWidths();
		}

		if (prevState.tableWidth !== this.state.tableWidth ||
			prevState.availableWidth !== this.state.availableWidth) {
			this.updateExcessWidth();
		}

		// Calculate if checkedAllRows is true
		if (this.props.selectedRows && !isEmpty(this.props.data)) {
			this.setCheckedAll(this.props.selectedRows);
		}
	}

	componentWillUnmount() {
		this.headerObserver?.disconnect();
		this.resizeObserver?.disconnect();
	}

	onSortVT({ sortBy }) {
		if (this.props.onSort) {
			const sortDirection = (this.state.columnSortDir[sortBy] === SORT_DIRECTION.ASC) ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
			const spec = {
				column: sortBy,
				direction: sortDirection
			};
			this.props.onSort(spec);
		}
	}

	onSort(column, descending) {
		if (this.props.onSort) {
			const sortDirection = descending === true ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
			const spec = {
				column: column,
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
		} else if (row.columns && has(row.columns[0], "content.props.children.props.propertyId.index")) {
			// for rows that have multi-select controls in them
			rowIndex = row.columns[0].content.props.children.props.propertyId.index;
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
	*/
	calculateColumnWidths() {
		const columns = this.props.columns;

		let tableWidth = this.state.availableWidth - COLUMN_PADDING_BUFFER; // subtract for the left padding scss $spacing-04
		if (this.props.rowSelection !== ROW_SELECTION.SINGLE) {
			tableWidth -= 40;
		}
		const compare = tableWidth + (COLUMN_PADDING_BUFFER * 0.75); // Save initial width for comparison later
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
		const defaultWidth = tableWidth > (DEFAULT_COL_MIN_WIDTH * remainingColumns)
			? Math.floor(tableWidth / remainingColumns) // use default width for columns without a weight
			: DEFAULT_COL_MIN_WIDTH; // If no more space to have the column visible, set the min width and let the table scroll
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
		if (sumColumnWidth < compare) {
			const firstColWidth = parseInt(widths[0], 10);
			widths[0] = firstColWidth + compare - sumColumnWidth + "px";
		}
		this.setState({ columnWidths: widths, tableWidth: sumColumnWidth });
	}

	updateHeaderHeight(contentRect) {
		if (this.state.headerHeight !== contentRect.height) {
			this.setState({ headerHeight: contentRect.height });
		}
	}

	updateExcessWidth() {
		if (this.state.tableWidth > 0 && this.state.tableWidth < this.state.availableWidth) {
			let excessWidth = this.state.availableWidth - this.state.tableWidth - COLUMN_PADDING_BUFFER;
			if (typeof this.props.updateRowSelections !== "undefined") {
				excessWidth -= 40; // Adjust for checkboxes
			}
			this.setState({ excessWidth: excessWidth > 0 ? excessWidth : 0 });
		} else if (this.state.excessWidth !== 0) {
			this.setState({ excessWidth: 0 });
		}
	}

	_updateTableWidth(contentRect, target) {
		const tableWidth = Math.floor(target?.childNodes?.[0].childNodes?.[0]?.clientWidth) || contentRect.width;
		if (this.state.availableWidth !== Math.floor(tableWidth - 2)) {
			this.setState({
				availableWidth: Math.floor(tableWidth - 2) // subtract 2 px for the borders
			}, () => this.updateExcessWidth());
		}
	}

	_updateRows() {
		if (this.props.rows && this.props.rows !== this.state.rows) {
			this.setState({ rows: this.props.rows }, () => {
				this._adjustTableHeight();
			});
		}
	}

	_adjustTableHeight() {
		if (this.props.noAutoSize) {
			return;
		}

		let newHeight = this.state.tableHeight;
		let dynamicH = this.state.dynamicHeight;
		if (Array.isArray(this.props.data) && this.props.data.length < this.state.rows) {
			newHeight = (REM_ROW_HEIGHT * this.props.data.length + REM_HEADER_HEIGHT) * ONE_REM_HEIGHT;
		} else if (this.state.rows > 0) {
			newHeight = (REM_ROW_HEIGHT * this.state.rows + REM_HEADER_HEIGHT) * ONE_REM_HEIGHT;
		} else if (this.state.rows === 0) { // only display header
			newHeight = REM_HEADER_HEIGHT * ONE_REM_HEIGHT;
		} else if (this.state.rows === -1) {
			if (this.flexibleTable) {
				const labelAndDescriptionHeight = 50; // possible dynamically set this in the future
				const flyoutHeight = this.findPropertyNodeHeight(this.flexibleTable, "properties-wf-children");
				const tearsheetHeight = this.findPropertyNodeHeight(this.flexibleTable, "properties-primary-tab-panel");
				if (flyoutHeight === 0 && tearsheetHeight === 0) {
					newHeight = "100vh"; // set full window height if flyout & tearsheet height not found
					dynamicH = -1;
				} else {
					const totalHeight = flyoutHeight !== 0 ? flyoutHeight : tearsheetHeight;
					newHeight = `calc(${totalHeight - this.state.headerHeight - labelAndDescriptionHeight}px - ${(3.5 * ONE_REM_HEIGHT)}px)`; // 3.5rem to adjust padding
					dynamicH = (totalHeight - this.state.headerHeight - labelAndDescriptionHeight) - (3.5 * 16);
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

		if (!this.props.data[displayedRowIndex].disabled && typeof this.props.updateRowSelections === "function") {
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
	*     "description": optional string,
	*     "resizable": optional boolean,
	*     "staticWidth": optional boolean - This is a special property added only for SPSS modeler which directly calls FlexibleTable. This property is NOT a part of uiHints.
	*   }
	* ]
	*/
	generateTableHeaderRow() {
		const headers = [];
		let searchLabel = "";
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			if (typeof this.props.filterable !== "undefined" && this.props.filterable[0] === columnDef.key) {
				searchLabel = columnDef.label;
			}
			const width = Math.abs(parseInt(this.state.columnWidths?.[j], 10));
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
		const emptyTableContent = isEmpty(this.props.data)
			? (
				<div className="properties-ft-empty-table">
					{this.props.emptyTablePlaceholder}
				</div>
			)
			: null;
		if (this.props.columns.length === 0) {
			return (<div ref={this.tableRef}>
				<div className="properties-ft-empty-table-header" />
				{emptyTableContent}
			</div>);
		}

		const headerInfo = this.generateTableHeaderRow();
		const headers = headerInfo.headers;
		const searchLabel = headerInfo.searchLabel;
		const disabled = this.props.tableState === STATES.DISABLED;

		let searchBar = null;

		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = typeof this.props.searchPlaceholder !== "undefined"
				? this.props.searchPlaceholder
				: this.props.intl.formatMessage({ id: "table.search.placeholder", defaultMessage: defaultMessages["table.search.placeholder"] }, { column_name: searchLabel });
			const searchBarLabel = this.props.intl.formatMessage(
				{ id: "table.search.label", defaultMessage: defaultMessages["table.search.label"] },
				{ table_name: this.props.tableLabel }
			);

			searchBar = (
				<div className={classNames("properties-ft-search-container", { "disabled": disabled })}>
					<Layer level={this.props.light ? 1 : 0}>
						<Search
							className="properties-ft-search-text"
							placeholder={placeHolder}
							onChange={this.handleFilterChange}
							disabled={disabled}
							size="sm"
							labelText={searchBarLabel}
						/>
					</Layer>
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
		const messageClass = (!this.props.messageInfo) ? containerClass + STATES.INFO : containerClass;
		const ftHeaderClassname = classNames("properties-ft-table-header",
			{ "single-row-selection-table": this.props.rowSelection === ROW_SELECTION.SINGLE });
		// When topRightPanel has Add button, it has this.props.topRightPanel.props.className = "properties-at-buttons-container"
		const topRightPanelHasTableToolbar = (typeof this.props.topRightPanel !== "undefined" && this.props.topRightPanel !== null &&
			typeof this.props.topRightPanel.props.className === "undefined");
		// Table toolbar replaces ftHeader when 1+ rows are selected
		const ftHeader = ((searchBar || this.props.topRightPanel))
			? (<div className={ftHeaderClassname} ref={this.flexibleTableHeader}>
				{ topRightPanelHasTableToolbar ? null : searchBar}
				{this.props.topRightPanel}
			</div>)
			: null;

		const ftClassname = classNames("properties-ft-control-container", { "properties-light-disabled": !this.props.light });

		let tableHeight = 0;
		if (this.state.rows !== -1 && this.state.tableHeight) {
			const remHeight = parseInt(this.state.tableHeight, 10);
			tableHeight = remHeight;
		} else if (this.state.rows === -1 && this.state.dynamicHeight && this.state.dynamicHeight !== -1) {
			tableHeight = this.state.dynamicHeight;
		}

		if (this.props.enableTanstackTable) {
			return (
				<div data-id={"properties-ft-" + this.props.scrollKey} className={ftClassname} ref={ (ref) => (this.flexibleTable = ref) }>
					{ftHeader}
					<div className="properties-ft-container-panel">
						<div className={classNames("properties-ft-container-wrapper", this.props.messageInfo ? this.props.messageInfo.type : "")}
							style={ heightStyle }
							ref={this.tableRef}
						>
							<div className={messageClass}>
								<VirtualizedGrid
									data={this.props.data}
									tableLabel={this.props.tableLabel}
									tableHeight={tableHeight}
									excessWidth={this.state.excessWidth}
									columns={headers}
									onHeaderClick={this.sortHeaderClick}
									rowCount={this.props.data.length}
									rowHeight={this.rowHeight}
									rowGetter={this.rowGetter}
									summaryTable={this.props.summaryTable}
									selectable={typeof this.props.updateRowSelections !== "undefined"}
									rowSelection={this.props.rowSelection}
									showHeader={this.props.showHeader}
									onRowDoubleClick={this.props.onRowDoubleClick}
									getOriginalRowIndex={this.getOriginalRowIndex}
									rowsSelected={this.props.selectedRows}
									checkedAll={this.state.checkedAllRows}
									setRowsSelected={this.handleCheckedRow}
									setAllRowsSelected={this.handleCheckedAllRows}
									scrollKey={this.props.scrollKey}
									onSort={this.onSort}
									sortBy={this.state.currentSortColumn}
									sortColumns={this.props.sortable}
									sortDirection={this.state.columnSortDir[this.state.currentSortColumn]}
									tableState={this.props.tableState}
									light={this.props.light}
									readOnly={this.props.readOnly}
									{...(scrollIndex !== -1 && { scrollToIndex: scrollIndex })}
								/>
							</div>
						</div>
					</div>
					{emptyTableContent}
				</div>
			);
		}

		return (
			<div data-id={"properties-ft-" + this.props.scrollKey} className={ftClassname} ref={ (ref) => (this.flexibleTable = ref) }>
				{ftHeader}
				<div className="properties-ft-container-panel">
					<div className={classNames("properties-ft-container-wrapper", this.props.messageInfo ? this.props.messageInfo.type : "")}
						style={ heightStyle }
						ref={this.tableRef}
					>
						<div className={messageClass}>
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
								onSort={this.onSortVT}
								sortBy={this.state.currentSortColumn}
								sortColumns={this.state.columnSortDir}
								sortDirection={this.state.columnSortDir[this.state.currentSortColumn]}
								tableState={this.props.tableState}
								light={this.props.light}
								readOnly={this.props.readOnly}
								{...(scrollIndex !== -1 && { scrollToIndex: scrollIndex, scrollToAlignment: "center" })}
							/>
						</div>
					</div>
				</div>
				{emptyTableContent}
			</div>
		);
	}
}

FlexibleTable.defaultProps = {
	showHeader: true,
	light: true,
	emptyTablePlaceholder: "",
	selectedRows: [], // Required for consumers using FlexibleTable directly
	enableTanstackTable: true // Feature flag
};

FlexibleTable.propTypes = {
	sortable: PropTypes.array,
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	emptyTablePlaceholder: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
	searchPlaceholder: PropTypes.string,
	filterable: PropTypes.array,
	filterBy: PropTypes.string,
	filterKeyword: PropTypes.string,
	hideFilterInput: PropTypes.func,
	scrollToRow: PropTypes.number,
	onSort: PropTypes.func,
	onFilter: PropTypes.func,
	showHeader: PropTypes.bool,
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
	intl: PropTypes.object.isRequired,
	readOnly: PropTypes.bool,
	enableTanstackTable: PropTypes.bool
};

export default injectIntl(FlexibleTable);
