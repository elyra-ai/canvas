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
import { Table, Thead, Th } from "reactable";
import TextField from "ap-components-react/dist/components/TextField";
import Icon from "../../icons/icon.jsx";
import PropertyUtils from "../util/property-utils";
import Tooltip from "../../tooltip/tooltip.jsx";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";
import { TOOL_TIP_DELAY, CONDITION_MESSAGE_TYPE } from "../constants/constants";
import isEmpty from "lodash/isEmpty";
import ObserveSize from "react-observe-size";

import uuid4 from "uuid/v4";

const sortDir = {
	ASC: "ASC",
	DESC: "DESC"
};

class FlexibleTable extends React.Component {

	static calculateColumnWidths(columns, elementId, parentTableWidth) {
		// get the parent table width
		let tableWidth = parentTableWidth;
		if (elementId !== null) {
			const table = document.getElementById(elementId);
			if (table) {
				tableWidth = parseInt(window.getComputedStyle(table, null).getPropertyValue("width"), 10);
			}
		}
		for (const columnDef of columns) {
			// if columns have specific width subtract from total width
			if (columnDef.width && typeof columnDef.width === "string" && columnDef.width.includes("px")) {
				tableWidth -= parseFloat(columnDef.width);
			}
		}
		const widths = [];
		let totalWidth = 0;
		// only calculate column widths that don't have "px"
		for (const columnDef of columns) {
			if (!columnDef.width) {
				totalWidth += 30; // set default width of 30 if nothing provided
			} else if (typeof columnDef.width !== "string") {
				totalWidth += columnDef.width;
			}
		}
		const pxMultiplier = Math.floor(tableWidth / totalWidth);
		for (const columnDef of columns) {
			// push actual size with "px" already set
			if (columnDef.width && typeof columnDef.width === "string" && columnDef.width.includes("px")) {
				widths.push(columnDef.width);
			} else {
				const size = columnDef.width ? columnDef.width : 30;
				widths.push(size * pxMultiplier + "px");
			}
		}
		return widths;
	}

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

		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
		this.onSort = this.onSort.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
		this._adjustTableHeight = this._adjustTableHeight.bind(this);
	}

	componentDidMount() {
		this._adjustTableHeight();
		window.addEventListener("resize", this._adjustTableHeight);
	}

	componentDidUpdate() {
		this._adjustTableHeight();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._adjustTableHeight);
	}

	onSort(spec) {
		if (this.props.onSort) {
			this.props.onSort(spec);
		}
	}

	_updateTableWidth(element) {
		if (this.state.tableWidth !== element.width) {
			this.setState({
				tableWidth: element.width
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
		const headerHeight = this.props.columns.length > 0 ? 32 : 0;
		const newHeight = (rowHeight * rows + headerHeight);
		if (newHeight !== this.state.tableHeight) {
			this.setState({ tableHeight: newHeight });
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

	render() {
		// go through the header and add the sort direction and convert to use reactable.Th element
		const headers = [];
		// some controls do not want a header
		const renderHeader = this.props.columns.length > 0;
		let searchLabel = "";
		const tableWidth = this.state.tableWidth;
		const tableHeight = this.state.tableHeight;
		const columnWidths = FlexibleTable.calculateColumnWidths(this.props.columns, null, tableWidth);

		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			const columnStyle = { "width": columnWidths[j] };
			const tooltipId = uuid4() + "-tooltip-column-" + columnDef.key;
			const className = j === 0 ? "left-padding-15" : "";
			let tooltip;
			if (((columnDef.editStyle && columnDef.editStyle === "inline") || columnDef.controlType === "checkbox") && columnDef.description) {
				tooltip = (
					<div className="properties-tooltips">
						{columnDef.description}
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

		let headerStyle = {};
		let tableStyle = {};
		if (this.props.validationStyle && this.props.validationStyle.borderColor) {
			headerStyle = {
				borderTopColor: this.props.validationStyle.borderColor,
				borderLeftColor: this.props.validationStyle.borderColor,
				borderRightColor: this.props.validationStyle.borderColor
			};
			tableStyle = {
				borderBottomColor: this.props.validationStyle.borderColor,
				borderLeftColor: this.props.validationStyle.borderColor,
				borderRightColor: this.props.validationStyle.borderColor
			};
			if (!renderHeader) {
				tableStyle.borderTopColor = this.props.validationStyle.borderColor;
			}
		}

		let renderTable = "";
		let renderTableHeaderContents = "";
		let searchBar = null;
		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = PropertyUtils.formatMessage(this.props.intl,
				MESSAGE_KEYS.TABLE_SEARCH_PLACEHOLDER, MESSAGE_KEYS_DEFAULTS.TABLE_SEARCH_PLACEHOLDER) + " " + searchLabel;
			const disabled = this.props.stateDisabled && (typeof this.props.stateDisabled.disabled !== "undefined" || Object.keys(this.props.stateDisabled) > 0);
			const className = disabled ? "disabled" : "";
			searchBar = (<div className="flexible-table-search-container">
				<div id="flexible-table-search-bar" className={"flexible-table-search-bar " + className}>
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
				renderTableHeaderContents = (
					<div className="flexible-table-container-header-wrapper">
						<div className="flexible-table-header" style={{ width: tableWidth }}>
							<Table className="filter-header-border"
								style={headerStyle}
								key="flexible-table"
								id="table-header"
								sortable={this.props.sortable}
								filterable={this.props.filterable}
								hideFilterInput
								filterBy={this.props.filterKeyword}
								onSort={this.onSort}
								onFilter={this.onFilter}
							>
								<Thead key="flexible-table-thead">
									{headers}
								</Thead>
							</Table>
						</div>);
					</div>);
			}

		} else if (renderHeader) {
			renderTableHeaderContents = (
				<div className="flexible-table-container-header-wrapper">
					<div className="flexible-table-header-container" style={{ width: tableWidth }}>
						<Table className="filter-header-border"
							style={headerStyle}
							id="table-header"
							sortable={this.props.sortable}
							onSort={this.onSort}
							onFilter={this.onFilter}
						>
							<Thead key="flexible-table-thead">
								{headers}
							</Thead>
						</Table>
					</div>
				</div>
			);
		}
		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			this.scrollToRow(this.props.alignTop);
		}

		const heightStyle = this.props.noAutoSize ? {} : { height: tableHeight + "px" };
		const containerId = (renderHeader) ? "flexible-table-container" : "flexible-table-container-noheader";
		const containerClass = (renderHeader) ? "flexible-table-container-absolute" : "flexible-table-container-absolute-noheader";
		const conditionIconClass = this.props.icon &&
			this.props.icon.props.validateErrorMessage &&
			this.props.icon.props.validateErrorMessage.type !== CONDITION_MESSAGE_TYPE.INFO ? "flexible-table-container-icon" : "";
		renderTable = (
			<div>
				{searchBar}
				{this.props.label}
				<div className={conditionIconClass} >
					<div className="flexible-table-container-icon-first-column">
						{this.props.topRightPanel}
						<ObserveSize observerFn={(element) => this._updateTableWidth(element)}>
							<div id="flexible-table-container-wrapper" style={ heightStyle }>
								{renderTableHeaderContents}
								<div className={containerClass} style={tableStyle}>
									<div id={containerId} style={{ width: tableWidth }}>
										<Table
											className="table"
											id="table"
											hideTableHeader
											ref="table"
										>
											{this.props.data}
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
