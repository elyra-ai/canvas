/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/
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
			filterKeyword: ""
		};

		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.scrollToRow = this.scrollToRow.bind(this);
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
		this.setState({ filterKeyword: evt.target.value });
	}

	scrollToRow() {
		var element = document.getElementById("table");
		var tableBody = element.getElementsByClassName("reactable-data");
		var tableRows = tableBody[0].getElementsByTagName("tr");
		if (tableRows.length !== 0 && this.props.scrollToRow <= tableRows.length - 1) {
			tableRows[this.props.scrollToRow].scrollIntoView(false);
		}
	}

	render() {
		// go through the header and add the sort direction and convert to use reactable.Th element
		const headers = [];
		let searchLabel = "";
		for (var j = 0; j < this.props.columns.length; j++) {
			const columnDef = this.props.columns[j];
			if (typeof this.state.columnSortDir[columnDef.key] !== "undefined") {
				const arrowIcon = ((this.state.columnSortDir[columnDef.key] === sortDir.ASC) ? SortAscendingIcon : SortDescendingIcon);
				headers.push(<Th key={"flexible-table-headers" + j} column={columnDef.key}>
					<div className="flexible-table-column" onClick={this.sortHeaderClick.bind(this, columnDef.key)}>
						{columnDef.label}
						<img className="sort_icon-column"src={arrowIcon} height={ARROW_HEIGHT} width={ARROW_WIDTH} />
					</div>
					</Th>);
			} else {
				headers.push(<Th key={"flexible-table-headers" + j} column={columnDef.key}>{columnDef.label}</Th>);
			}
			if (typeof this.props.filterable !== "undefined" && this.props.filterable[0] === columnDef.key) {
				searchLabel = columnDef.label;
			}
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
						value={this.state.filterKeyword}
					/>
				</div>
				<div id="flexible-table-search-icon"
					className="flexible-table-toolbar"
				>
					<img id="flexible-table-search-icon"
						src={search32}
					/>
				</div>
				<div id="flexible-table-container">
					<Table
						key="flexible-table"
						className="table"
						id="table"
						sortable={this.props.sortable}
						filterable={this.props.filterable}
						hideFilterInput
						filterBy={this.state.filterKeyword}
					>
						<Thead key="flexible-table-thead">
							{headers}
						</Thead>
						{this.props.data}
					</Table>
					</div>
				</div>
			);
		} else {
			renderTable = (
				<div id="flexible-table-container">
				<Table
					className="table"
					id="table"
					sortable={this.props.sortable}
				>
					<Thead key="flexible-table-thead">
						{headers}
					</Thead>
					{this.props.data}
				</Table>
			</div>
			);
		}

		if (typeof this.props.scrollToRow !== "undefined") {
			this.scrollToRow();
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
	hideFilterInput: React.PropTypes.func,
	scrollToRow: React.PropTypes.number
};
