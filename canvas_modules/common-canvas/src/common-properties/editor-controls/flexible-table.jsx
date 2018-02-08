/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 20] */
/* eslint max-depth: ["error", 5] */

import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { injectIntl, intlShape } from "react-intl";
import { Table, Thead, Th } from "reactable";
import TextField from "ap-components-react/dist/components/TextField";
import search32 from "../../../assets/images/search_32.svg";
import search32Disabled from "../../../assets/images/search_32_disabled.svg";
import SortAscendingIcon from "../../../assets/images/sort_ascending.svg";
import SortDescendingIcon from "../../../assets/images/sort_descending.svg";
import PropertyUtils from "../util/property-utils";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";
import { TOOL_TIP_DELAY } from "../constants/constants";
import ObserveSize from "react-observe-size";

const sortDir = {
	ASC: "ASC",
	DESC: "DESC"
};
const ARROW_HEIGHT = 10;
const ARROW_WIDTH = 10;

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
				tableWidth -= parseInt(10, columnDef.width);
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
			tableWidth: 0
		};

		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
		this.onSort = this.onSort.bind(this);
		this._updateTableWidth = this._updateTableWidth.bind(this);
	}

	onSort(spec) {
		if (this.props.onSort) {
			this.props.onSort(spec);
		}
	}

	_updateTableWidth(width) {
		if (this.state.tableWidth !== width) {
			this.setState({
				tableWidth: width
			});
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

		const columnWidths = FlexibleTable.calculateColumnWidths(this.props.columns, null, tableWidth);

		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			const columnStyle = { "width": columnWidths[j] };
			const tooltipId = "tooltip-column-" + columnDef.key;
			const className = j === 0 ? "left-padding-15" : "";
			let tooltip;
			let description;
			if (((columnDef.editStyle && columnDef.editStyle === "inline") || columnDef.controlType === "checkbox") && columnDef.description) {
				tooltip = (<ReactTooltip
					id={tooltipId}
					place="right"
					type="light"
					effect="solid"
					border
					className="properties-tooltips"
					delayShow={TOOL_TIP_DELAY}
				/>);
				description = columnDef.description;
			}
			if (typeof this.state.columnSortDir[columnDef.key] !== "undefined") {
				const arrowIcon = ((this.state.columnSortDir[columnDef.key] === sortDir.ASC) ? SortAscendingIcon : SortDescendingIcon);
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle} >
					<div
						className="flexible-table-column properties-tooltips-container"
						onClick={this.sortHeaderClick.bind(this, columnDef.key)}
						data-tip={description}
						data-for={tooltipId}
					>
						{columnDef.label}
						<img className="sort_icon-column"src={arrowIcon} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
					</div>
					{tooltip}
				</Th>);
			} else {
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle}>
					<div
						className="properties-tooltips-container"
						data-tip={description} data-for={tooltipId}
					>
						{columnDef.label}
					</div>
					{tooltip}
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
			const searchIcon = disabled ? search32Disabled : search32;
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
				<div id="flexible-table-search-icon"
					className="flexible-table-toolbar"
				>
					<img id="flexible-table-search-icon"
						src={searchIcon}
					/>
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

		const containerId = (renderHeader) ? "flexible-table-container" : "flexible-table-container-noheader";
		const containerClass = (renderHeader) ? "flexible-table-container-absolute" : "flexible-table-container-absolute-noheader";
		renderTable = (
			<div>
				{searchBar}
				{this.props.label}
				{this.props.topRightPanel}
				<ObserveSize observerFn={(element) => this._updateTableWidth(element.width)}>
					<div id="flexible-table-container-wrapper">
						{renderTableHeaderContents}
						<div className={containerClass} style={tableStyle}>
							<div id={containerId} style={{ width: tableWidth }}>
								<Table
									className="table"
									id="table"
									hideTableHeader
								>
									{this.props.data}
								</Table>
							</div>
						</div>
					</div>
				</ObserveSize>
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
	validationStyle: PropTypes.object,
	scrollKey: PropTypes.string,
	stateDisabled: PropTypes.object,
	intl: intlShape
};

export default injectIntl(FlexibleTable);
