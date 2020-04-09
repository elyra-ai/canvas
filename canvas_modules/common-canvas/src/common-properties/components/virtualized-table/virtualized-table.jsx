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

import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import { Column, Table } from "react-virtualized/dist/commonjs/Table";

import { Loading, Checkbox } from "carbon-components-react";
import Icon from "./../../../icons/icon.jsx";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { TOOL_TIP_DELAY, SORT_DIRECTION, STATES, ROW_SELECTION, CARBON_ICONS } from "./../../constants/constants";

import isEmpty from "lodash/isEmpty";
import uuid4 from "uuid/v4";
import classNames from "classnames";

import PropTypes from "prop-types";
import React from "react";

class VirtualizedTable extends React.Component {

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.rowCount !== prevState.rowCount) {
			return ({ rowCount: nextProps.rowCount });
		}
		return ({});
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			rowCount: this.props.rowCount
		};
		this.virtualizedTableRef = React.createRef();

		this.isOverSelectOption = false;
		this.cellRenderer = this.cellRenderer.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.headerRowRenderer = this.headerRowRenderer.bind(this);
		this.headerColRenderer = this.headerColRenderer.bind(this);
		this.onRowClick = this.onRowClick.bind(this);
		this.overSelectOption = this.overSelectOption.bind(this);
	}

	componentDidUpdate() {
		// If the rowHeight prop is a function, the virtualized table doesn't always adjust its
		// row heights correctly when the table data has changed. So in this case we need
		// to recompute the row heights.
		if (typeof this.props.rowHeight === "function") {
			this.recomputeRowHeights();
		}
	}

	// This is also triggered when clicking on a checkbox
	onRowClick(evt, rowData, index) {
		// Set selections
		const selected = !this.isRowSelected(rowData.originalRowIndex);
		if (typeof this.props.setRowsSelected === "function") {
			this.props.setRowsSelected({ "index": index, "originalRowIndex": rowData.originalRowIndex, "selected": selected, "isOverSelectOption": this.isOverSelectOption }, evt);
		}
	}

	onRowDoubleClick(evt, rowKey, index) {
		if (this.props.onRowDoubleClick) {
			this.props.onRowDoubleClick(evt, rowKey, index);
		}
	}

	isRowSelected(index) {
		if (this.props.rowsSelected) {
			return this.props.rowsSelected.indexOf(index) > -1;
		}
		return false;
	}

	selectAll(selected) {
		this.props.setAllRowsSelected(selected);
	}

	// Callback responsible for rendering a cell's contents.
	cellRenderer({ cellData }) {
		if (cellData === null || typeof cellData === "undefined") {
			return "";
		}
		return cellData;
	}

	cellRendererHTML({ cellData }) {
		if (cellData === null || typeof cellData === "undefined") {
			return "";
		}
		return (<div dangerouslySetInnerHTML={{ __html: cellData }} />);
	}

	recomputeRowHeights(index) {
		if (this.virtualizedTableRef && this.virtualizedTableRef.current) {
			this.virtualizedTableRef.current.recomputeRowHeights(index);
		}
	}

	// Responsible for rendering the table header row given an array of columns.
	headerRowRenderer(scrollKey, { className, columns, style }) {
		const checkbox = this.props.selectable && this.props.rowSelection !== ROW_SELECTION.SINGLE ? (<div className="properties-vt-header-checkbox">
			<Checkbox
				id={`properties-vt-hd-cb-${scrollKey}`}
				onChange={this.selectAll}
				checked={this.props.checkedAll}
				labelText=""
				hideLabel
			/>
		</div>)
			: "";

		return (<div className={className} role="properties-header-row" style={style}>
			{checkbox}
			{columns}
		</div>);
	}

	headerColRenderer({ columnData, dataKey, disableSort, label, sortBy, sortDirection }) {
		let sortIcon = null;
		if (typeof this.props.sortColumns[dataKey] !== "undefined") {
			sortIcon = this.props.sortColumns[dataKey] === SORT_DIRECTION.ASC
				? <Icon type={CARBON_ICONS.CHEVRONARROWS.UP} disabled={this.props.tableState === STATES.DISABLED} />
				: <Icon type={CARBON_ICONS.CHEVRONARROWS.DOWN} disabled={this.props.tableState === STATES.DISABLED} />;
			sortIcon = (<div className="properties-ft-column-sort-icon">
				{sortIcon}
			</div>);
		}

		let tooltip = null;
		if (columnData.description && columnData.headerLabel) {
			tooltip = (
				<div className="properties-tooltips">
					<span style= {{ fontWeight: "bold" }}>{columnData.headerLabel}</span>
					<br />
					{columnData.description}
				</div>
			);
		} else if (columnData.description) {
			tooltip = (
				<div className="properties-tooltips">
					{columnData.description}
				</div>
			);
		} else if (columnData.headerLabel) {
			tooltip = (
				<div className="properties-tooltips">
					<span style= {{ fontWeight: "bold" }}>{columnData.headerLabel}</span>
				</div>
			);
		}

		const tooltipId = uuid4() + "-tooltip-column-" + dataKey;

		return (<div className={classNames("properties-vt-column properties-tooltips-container", { "sort-column-active": dataKey === this.props.sortBy })}>
			{ isEmpty(tooltip)
				? label
				: <Tooltip
					id={tooltipId}
					tip={tooltip}
					direction="top"
					delay={TOOL_TIP_DELAY}
					className="properties-tooltips"
				>
					{label}
				</Tooltip>
			}
			{disableSort === false && sortIcon}
		</div>);
	}

	overSelectOption() {
		this.isOverSelectOption = !this.isOverSelectOption;
	}

	// Responsible for rendering a table row given an array of columns.
	rowRenderer(scrollKey, { className, columns, index, key, rowData, style }) {
		let selectOption = "";
		let selectedRow = false;
		const rowDisabled = typeof rowData.disabled === "boolean" ? rowData.disabled : false;

		if (typeof this.props.rowHeight === "function" && this.props.rowHeight({ index }) === 0) {
			return null;
		}

		if (this.props.selectable) {
			const rowSelected = this.isRowSelected(rowData.originalRowIndex);
			selectedRow = this.props.selectable && rowSelected;
			if (this.props.rowSelection !== ROW_SELECTION.SINGLE) {
				selectOption = (<div className="properties-vt-row-checkbox"
					onMouseEnter={this.overSelectOption}
					onMouseLeave={this.overSelectOption}
				>
					<Checkbox
						id={`properties-vt-row-cb-${scrollKey}-${index}`}
						key={`properties-vt-row-cb-${scrollKey}-${index}`}
						labelText=""
						hideLabel
						checked={rowSelected}
						disabled={rowDisabled}
					/>
				</div>);
			}
		}

		if (this.props.summaryTable) {
			selectOption = <div className="properties-vt-row-checkbox" />;
		}

		if (rowData.loading === true) {
			return (
				<div
					className={className}
					key={key}
					role="properties-loading-row"
					style={style}
				>
					<Loading className="properties-vt-small-loading" small withOverlay={false} />
				</div>
			);
		}

		const width = (parseInt(style.width, 10)) + "px"; // Subtract 2px to account for row borders
		const newStyle = Object.assign({}, style, { width: width });

		// Empty style required on cell for react-virtualized. This div wrapper is required to apply the onDoubleClick handler.
		return (<div style={{}} key={key} className="properties-vt-double-click" onDoubleClick={(evt) => this.onRowDoubleClick(evt, rowData.rowKey, index)}>
			<div
				className={classNames(className,
					{ "properties-vt-row-selected": selectedRow },
					{ "properties-vt-row-disabled": rowDisabled }
				)}
				role="properties-data-row"
				style={newStyle}
				onMouseDown={(evt) => this.onRowClick(evt, rowData, index)}
			>
				{selectOption}
				{columns}
			</div>
		</div>);
	}

	render() {
		const defaultTestHeight = 2000; // 2000 is set to accommodate test data "category-selection-data" with all categories expanded

		// AutoSizer manages width and height properties so the table fills the available space.
		// It does a direct DOM manipulation to the parent, outside React's VirtualDOM.
		// Since the actual DOM is not available when unit testing, we are passing in a default
		// width of 500 and a default height of 300.
		return (
			<div className="properties-vt">
				<div className={classNames("properties-vt-autosizer",
					{ "properties-vt-single-selection": this.props.rowSelection && this.props.rowSelection === ROW_SELECTION.SINGLE })}
				>
					<AutoSizer>
						{({ height, width }) => ( // Table height: subtract 50 for margin below the table.
							<Table
								ref={this.virtualizedTableRef}
								width={width ? width : 500}
								height={height ? height : defaultTestHeight}

								className="properties-autosized-vt"

								disableHeader={this.props.disableHeader}
								headerClassName="properties-autosized-vt-header"
								headerHeight={40}
								headerRowRenderer={this.headerRowRenderer.bind(this, this.props.scrollKey)}
								onHeaderClick={this.props.onHeaderClick}

								rowClassName="properties-vt-row-class"
								rowHeight={this.props.rowHeight ? this.props.rowHeight : 40}

								rowCount={this.state.rowCount}
								rowGetter={this.props.rowGetter}
								rowRenderer={this.rowRenderer.bind(this, this.props.scrollKey)}

								scrollToIndex={this.props.scrollToIndex}
								scrollToAlignment={this.props.scrollToAlignment}

								sort={this.props.onSort}
								sortDirection={this.props.sortDirection}
							>
								{
									this.props.columns.map((column) => (
										<Column
											key={column.key}
											label={column.label}
											dataKey={column.key}
											width={column.width}
											columnData={column}
											disableSort={typeof this.props.sortColumns[column.key] === "undefined"}
											cellRenderer={column.isHTML ? this.cellRendererHTML : this.cellRenderer}
											headerRenderer={this.headerColRenderer}
											{...column.minWidth && { minWidth: column.minWidth }}
										/>
									))
								}
							</Table>
						)}
					</AutoSizer>
				</div>
			</div>
		);
	}
}

VirtualizedTable.defaultProps = {
	disableHeader: false
};

VirtualizedTable.propTypes = {
	selectable: PropTypes.bool,
	summaryTable: PropTypes.bool,
	rowSelection: PropTypes.string,
	disableHeader: PropTypes.bool,
	columns: PropTypes.array.isRequired,
	rowCount: PropTypes.number.isRequired,
	rowGetter: PropTypes.func.isRequired,
	rowHeight: PropTypes.oneOfType([
		PropTypes.func.isRequired,
		PropTypes.number.isRequired
	]),
	onRowDoubleClick: PropTypes.func,
	rowsSelected: PropTypes.array, // Required if selectable is true
	checkedAll: PropTypes.bool, // Required if selectable is true
	setRowsSelected: PropTypes.func, // Required if selectable is true
	setAllRowsSelected: PropTypes.func, // Required if selectable is true
	scrollToIndex: PropTypes.number,
	scrollToAlignment: PropTypes.string,
	onSort: PropTypes.func,
	sortBy: PropTypes.string,
	sortColumns: PropTypes.object,
	sortDirection: PropTypes.string,
	onHeaderClick: PropTypes.func,
	scrollKey: PropTypes.string,
	tableState: PropTypes.string
};

export default VirtualizedTable;
