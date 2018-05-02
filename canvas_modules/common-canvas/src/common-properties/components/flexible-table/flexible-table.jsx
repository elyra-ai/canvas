/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 25] */
/* eslint max-depth: ["error", 5] */

import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { injectIntl, intlShape } from "react-intl";
import { Table, Thead, Th, Tr, Td } from "reactable";
import TextField from "ap-components-react/dist/components/TextField";
import Icon from "./../../../icons/icon.jsx";
import PropertyUtils from "./../../util/property-utils";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, TOOL_TIP_DELAY, CONDITION_MESSAGE_TYPE } from "./../../constants/constants";
import isEmpty from "lodash/isEmpty";
import ObserveSize from "react-observe-size";

import uuid4 from "uuid/v4";

const sortDir = {
	ASC: "ASC",
	DESC: "DESC"
};

class FlexibleTable extends React.Component {

	constructor(props) {
		super(props);

		const sortDirs = [];
		if (typeof this.props.sortable !== "undefined") {
			for (var i = 0; i < this.props.sortable.length; i++) {
				const sortCol = this.props.sortable[i];
				sortDirs[sortCol] = sortDir.ASC;
			}
		}
		this.state = {
			columnSortDir: sortDirs,
			tableWidth: 0,
			tableHeight: 0
		};

		this.calculateColumnWidths = this.calculateColumnWidths.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
		this.onSort = this.onSort.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
	}

	componentDidMount() {
		this._adjustTableHeight();
		window.addEventListener("resize", this._adjustTableHeight);
		this._setHeaderElement();
	}

	componentDidUpdate() {
		this._adjustTableHeight();
		this._setHeaderElement();
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
		if (sumColumnWidth < parentTableWidth) {
			const firstColWith = parseInt(widths[0], 10);
			widths[0] = firstColWith + parentTableWidth - sumColumnWidth + "px";
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
		const table = ReactDOM.findDOMNode(this.refs.table);
		let rowHeight = 0;
		if (table) {
			const rowDivs = table.getElementsByClassName("table-row");
			if (rowDivs.length > 0) {
				rowHeight = rowDivs[0].offsetHeight + 1;
			}
		}
		if (!rowHeight) {
			rowHeight = 36;
		}
		const rows = this.props.rows ? this.props.rows : 4;
		// Allow for the table header
		let headerHeight = 0;
		if (this.props.columns.length > 0 && this.theadNode) { // if there is a header
			headerHeight = this.theadNode.clientHeight;
		}
		const newHeight = (rowHeight * rows + headerHeight);
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
				columnSortDir: colSortDir
			});
		}
	}

	handleFilterChange(evt) {
		if (this.props.onFilter) {
			this.props.onFilter(evt.target.value);
		}
	}

	scrollToRow(alignTop) {
		var element = document.getElementById("moveablerow-table-" + this.props.scrollKey);
		if (element && typeof this.props.scrollToRow === "number") {
			var tableBody = element.getElementsByClassName("reactable-data");
			var tableRows = tableBody[tableBody.length - 1].getElementsByTagName("tr");
			if (tableRows.length !== 0 && this.props.scrollToRow <= tableRows.length - 1) {
				tableRows[this.props.scrollToRow].scrollIntoView(alignTop);
			}
		}
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
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			const columnStyle = { "width": columnWidths[j] };
			const tooltipId = uuid4() + "-tooltip-column-" + columnDef.key;
			const className = "";
			//   wrap the label in a tooltip in case it overflows
			const tooltipText = columnDef.description;
			let tooltip;
			if (tooltipText) {
				tooltip = (
					<div className="properties-tooltips">
						{tooltipText}
					</div>
				);
			}
			if (typeof this.state.columnSortDir[columnDef.key] !== "undefined") {
				const arrowIcon = ((this.state.columnSortDir[columnDef.key] === sortDir.ASC)
					? <Icon type="upCaret" {...this.props.stateDisabled} />
					: <Icon type="downCaret" {...this.props.stateDisabled} />);
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle} >
					<div
						className="flexible-table-column properties-tooltips-container"
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
						{arrowIcon}
					</div>
				</Th>);
			} else {
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle}>
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
		for (let ridx = 0; ridx < this.props.data.length; ridx++) {
			const row = this.props.data[ridx];
			const tableRowColumns = [];
			const onClickCallback = row.onClickCallback ? { onClick: row.onClickCallback } : null;
			const rowClassName = row.className ? row.className : "";

			if (row.columns) {
				for (let cidx = 0; cidx < row.columns.length; cidx++) {
					const column = row.columns[cidx];
					const colWidth = { width: columnWidths[cidx] };
					const value = column.value ? { value: column.value } : {};

					tableRowColumns.push(<Td
						key={this.props.scrollKey + "-row-" + ridx + "-col-" + cidx}
						column={column.column}
						data-label={column.column}
						style={colWidth}
						className={column.className ? column.className : ""}
						{...value}
					>{column.content}</Td>);
				}
			}

			// need to assign width to table row so scrollbar from mouse will not push contents
			tableRows.push(<Tr
				{...onClickCallback}
				key={this.props.scrollKey + "-row-" + ridx}
				className={rowClassName}
				style={{ width: tableWidth }}
			>{tableRowColumns}</Tr>);
		}
		return tableRows;
	}

	render() {
		const renderHeader = this.props.columns.length > 0; // some controls do not want a header
		const hideTableHeader = renderHeader ? {} : { "hideTableHeader": true };

		const tableWidth = this.state.tableWidth;
		const tableHeight = this.state.tableHeight - 2; // subtract 2 px for the borders
		const columnWidths = this.calculateColumnWidths(this.props.columns, tableWidth);
		const headerInfo = this.generateTableHeaderRow(columnWidths);

		const headers = headerInfo.headers;
		const searchLabel = headerInfo.searchLabel;
		const tableContent = this.generateTableRows(columnWidths, tableWidth);

		let renderTable = "";
		let searchBar = null;
		let filterProps = {};

		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.TABLE_SEARCH_PLACEHOLDER, MESSAGE_KEYS_DEFAULTS.TABLE_SEARCH_PLACEHOLDER) + " " + searchLabel;
			const disabled = this.props.stateDisabled && (typeof this.props.stateDisabled.disabled !== "undefined" || Object.keys(this.props.stateDisabled) > 0);
			const className = disabled ? "disabled" : "";
			searchBar = (<div className="flexible-table-search-container">
				<div className={"flexible-table-search-bar " + className}>
					<TextField
						key="flexible-table-search-bar"
						type="search"
						id="flexible-table-search"
						className="flexible-table-toolbar"
						placeholder={placeHolder}
						disabledPlaceholderAnimation
						onChange={this.handleFilterChange}
						value={this.props.filterKeyword}
						disabled={disabled}
					/>
				</div>
				<div id="flexible-table-search-icon" className="flexible-table-toolbar">
					<Icon type="search" {...this.props.stateDisabled} />
				</div>
			</div>
			);

			if (renderHeader) {
				filterProps = {
					filterable: this.props.filterable,
					hideFilterInput: true,
					filterBy: this.props.filterKeyword
				};
			}
		}

		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			this.scrollToRow(this.props.alignTop);
		}


		// adjust the height of the body so it can scroll correctly
		if (this.tbodyNode) {
			// subtract additional 1px to unblock bottom border
			this.tbodyNode.style.height = (this.theadNode) ? (this.flexibleTableDiv.clientHeight - this.theadNode.clientHeight - 1) + "px"
				: "auto";
		}

		const heightStyle = this.props.noAutoSize ? {} : { height: tableHeight + "px" };
		const containerId = renderHeader ? "flexible-table-container" : "flexible-table-container-noheader";
		const containerClass = renderHeader ? "flexible-table-container-absolute" : "flexible-table-container-absolute-noheader";
		const conditionIconClass = this.props.icon &&
			this.props.icon.props.validateErrorMessage &&
			this.props.icon.props.validateErrorMessage.type !== CONDITION_MESSAGE_TYPE.INFO ? "flexible-table-container-icon" : "";

		let tableStyle = {};
		if (this.props.validationStyle && this.props.validationStyle.borderColor) {
			tableStyle = {
				borderColor: this.props.validationStyle.borderColor
			};
		}

		renderTable = (
			<div>
				{searchBar}
				{this.props.label}
				<div className={conditionIconClass} >
					<div className="flexible-table-container-icon-first-column">
						{this.props.topRightPanel}
						<ObserveSize observerFn={(element) => this._updateTableWidth(element)}>
							<div id="flexible-table-container-wrapper" style={ heightStyle }>
								<div className={containerClass} style={tableStyle}>
									<div ref={ (ref) => (this.flexibleTableDiv = ref) } id={containerId} style={{ width: tableWidth }}>
										<Table {...filterProps}
											className={"table flexible-table"}
											id="table"
											ref="table"
											sortable={this.props.sortable}
											onSort={this.onSort}
											{...hideTableHeader}
										>
											<Thead key="flexible-table-thead">
												{headers}
											</Thead>
											{tableContent}
										</Table>
									</div>
								</div>
							</div>
						</ObserveSize>
					</div>
					<div className="flexible-table-container-icon-second-column">
						{this.props.icon}
					</div>
				</div>
			</div>
		);

		return (
			<div id={"flexible-table-" + this.props.scrollKey} className="flexible-table-control-container">
				{renderTable}
			</div>
		);
	}
}

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
	alignTop: PropTypes.bool,
	label: PropTypes.object,
	topRightPanel: PropTypes.object,
	icon: PropTypes.object,
	validationStyle: PropTypes.object,
	scrollKey: PropTypes.string,
	stateDisabled: PropTypes.object,
	intl: intlShape,
	rows: PropTypes.number,
	noAutoSize: PropTypes.bool
};

export default injectIntl(FlexibleTable);
