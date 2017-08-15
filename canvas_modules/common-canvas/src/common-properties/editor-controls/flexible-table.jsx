/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 14] */
/* eslint max-depth: ["error", 5] */

import React from "react";
import { Table, Thead, Th } from "reactable";
import {
	TextField
} from "ap-components-react/dist/ap-components-react";
import search32 from "../../../assets/images/search_32.svg";
import SortAscendingIcon from "../../../assets/images/sort_ascending.svg";
import SortDescendingIcon from "../../../assets/images/sort_descending.svg";


const sortDir = {
	ASC: "ASC",
	DESC: "DESC"
};
const ARROW_HEIGHT = 10;
const ARROW_WIDTH = 10;

export default class FlexibleTable extends React.Component {

	static calculateColumnWidths(columns, availWidth) {

		const widths = [];
		let totalWidth = 0;
		for (const columnDef of columns) {
			totalWidth += columnDef.width ? columnDef.width : 100;
		}
		for (const columnDef of columns) {
			const size = columnDef.width ? columnDef.width : 100;
			widths.push(Math.floor(size / totalWidth * availWidth) + "%");
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
			columnSortDir: sortDirs
		};

		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
		this.onSort = this.onSort.bind(this);
	}

	onSort(spec) {
		if (this.props.onSort) {
			this.props.onSort(spec);
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
		var element = document.getElementById("table");
		if (element && typeof this.props.scrollToRow === "number") {
			var tableBody = element.getElementsByClassName("reactable-data");
			var tableRows = tableBody[0].getElementsByTagName("tr");
			if (tableRows.length !== 0 && this.props.scrollToRow <= tableRows.length - 1) {
				tableRows[this.props.scrollToRow].scrollIntoView(alignTop);
			}
		}
	}

	render() {
		// go through the header and add the sort direction and convert to use reactable.Th element
		const headers = [];
		let searchLabel = "";
		// calculate for all columns except the last which is used for the scroll bar
		const columnWidths = FlexibleTable.calculateColumnWidths(this.props.columns.slice(0, -1), 98);
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			// Last header column is for scroll bar.  Always set to 2%
			const columnWidth = j === this.props.columns.length - 1 ? "2%" : columnWidths[j];
			const columnStyle = { "width": columnWidth };
			const className = j === 0 ? "left-padding-15" : "";
			if (typeof this.state.columnSortDir[columnDef.key] !== "undefined") {
				const arrowIcon = ((this.state.columnSortDir[columnDef.key] === sortDir.ASC) ? SortAscendingIcon : SortDescendingIcon);
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle}>
					<div className="flexible-table-column" onClick={this.sortHeaderClick.bind(this, columnDef.key)}>
						{columnDef.label}
						<img className="sort_icon-column"src={arrowIcon} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
					</div>
					</Th>);
			} else {
				headers.push(<Th className={className} key={"flexible-table-headers" + j} column={columnDef.key} style={columnStyle}>{columnDef.label}</Th>);
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
		}
		let renderTable = "";
		if (typeof this.props.filterable !== "undefined" && this.props.filterable.length !== 0) {
			const placeHolder = "Search in column " + searchLabel;
			renderTable = (<div>
				<div id="flexible-table-search-bar">
					<TextField
						key="flexible-table-search-bar"
						type="search"
						id="flexible-table-search"
						className="flexible-table-toolbar"
						placeholder={placeHolder}
						disabledPlaceholderAnimation
						onChange={this.handleFilterChange}
						value={this.props.filterKeyword}
					/>
				</div>
				<div id="flexible-table-search-icon"
					className="flexible-table-toolbar"
				>
					<img id="flexible-table-search-icon"
						src={search32}
					/>
				</div>
				{this.props.label}
				{this.props.topRightPanel}
				<div>
					<div className="flexible-table-header">
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
					</div>
					<div id="flexible-table-container" style={tableStyle}>
						<Table
							key="flexible-table"
							className="table"
							id="table"
							hideTableHeader
						>
							{this.props.data}
						</Table>
					</div>
				</div>
				</div>
			);
		} else {
			renderTable = (
				<div>
					{this.props.label}
					{this.props.topRightPanel}
					<div className="flexible-table-header-container">
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
					<div id="flexible-table-container" style={tableStyle}>
						<Table
							className="table"
							id="table"
							hideTableHeader
						>
							{this.props.data}
						</Table>
					</div>
				</div>);
		}

		if (typeof this.props.scrollToRow !== "undefined" && this.props.scrollToRow !== null) {
			this.scrollToRow(this.props.alignTop);
		}

		return (
			<div>
				{renderTable}
		</div>
		);
	}
}

FlexibleTable.propTypes = {
	sortable: React.PropTypes.array,
	columns: React.PropTypes.array.isRequired,
	data: React.PropTypes.array.isRequired,
	filterable: React.PropTypes.array,
	filterBy: React.PropTypes.string,
	filterKeyword: React.PropTypes.string,
	hideFilterInput: React.PropTypes.func,
	scrollToRow: React.PropTypes.number,
	onSort: React.PropTypes.func,
	onFilter: React.PropTypes.func,
	alignTop: React.PropTypes.bool,
	label: React.PropTypes.object,
	topRightPanel: React.PropTypes.object,
	validationStyle: React.PropTypes.object
};
