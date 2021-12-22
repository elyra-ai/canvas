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

import { Column, Table, AutoSizer } from "react-virtualized";
import Draggable from "react-draggable";
import { Checkbox, Loading } from "carbon-components-react";
import Icon from "./../../../icons/icon.jsx";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { SORT_DIRECTION, STATES, ROW_SELECTION, CARBON_ICONS } from "./../../constants/constants";
import { injectIntl } from "react-intl";
import defaultMessages from "../../../../locales/common-properties/locales/en.json";

import { isEmpty } from "lodash";
import { v4 as uuid4 } from "uuid";
import classNames from "classnames";

import PropTypes from "prop-types";
import React from "react";

class VirtualizedTable extends React.Component {

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.rowCount !== prevState.rowCount) {
			return ({ rowCount: nextProps.rowCount });
		}
		// Don't check following condition after column is resized
		if (!prevState.columnResized && nextProps.columns !== prevState.columns) {
			return ({ columns: nextProps.columns });
		}
		return ({});
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			rowCount: this.props.rowCount,
			columns: this.props.columns,
			columnResized: false
		};
		this.virtualizedTableRef = React.createRef();

		this.isOverSelectOption = false;
		this.mouseEventCalled = false;
		this.keyBoardEventCalled = false;
		this.cellRenderer = this.cellRenderer.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.headerRowRenderer = this.headerRowRenderer.bind(this);
		this.headerColRenderer = this.headerColRenderer.bind(this);
		this.onRowClick = this.onRowClick.bind(this);
		this.overSelectOption = this.overSelectOption.bind(this);
		this.resizeColumn = this.resizeColumn.bind(this);
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
		if (evt.target.className === "bx--select-option") {
			evt.stopPropagation(); // stop propagation when selecting dropdown select options within table rows
		} else {
			// Set selections
			const selected = !this.isRowSelected(rowData.originalRowIndex);
			if (typeof this.props.setRowsSelected === "function") {
				this.props.setRowsSelected({
					"index": index,
					"originalRowIndex": rowData.originalRowIndex,
					"selected": selected,
					"isOverSelectOption": this.isOverSelectOption }, evt);
			}
		}
	}

	onRowDoubleClick(evt, rowKey, index) {
		if (this.props.onRowDoubleClick) {
			this.props.onRowDoubleClick(evt, rowKey, index);
		}
	}

	getCheckboxLabelColumnIndex(columns) {
		// If 1st column is Index, use the next column for labeling
		for (let i = 0; i < columns.length; i++) {
			if (columns[i].operation !== "index") {
				return i;
			}
		}
		// Use first column by default
		return 0;
	}

	getColumnIndex(columns, key) {
		const index = columns.findIndex((column) => column.key === key);
		return index;
	}

	isRowSelected(index) {
		if (this.props.rowsSelected) {
			return this.props.rowsSelected.indexOf(index) > -1;
		}
		return false;
	}

	isLastColumn(dataKey) {
		const columnIndex = this.getColumnIndex(this.props.columns, dataKey);
		const isLastColumn = (columnIndex === (this.props.columns.length - 1));
		return isLastColumn;
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
		const checkboxLabelColumnIndex = (typeof this.props.columns === "undefined" || this.props.columns.length === 0) ? 0 : this.getCheckboxLabelColumnIndex(this.props.columns);
		const headerCheckboxLabel = (typeof this.props.columns === "undefined" || this.props.columns.length === 0) ? "" : this.props.columns[checkboxLabelColumnIndex].headerLabel;
		const translatedHeaderCheckboxLabel = this.props.intl.formatMessage(
			{ id: "virtualizedTable.header.checkbox.label", defaultMessage: defaultMessages["virtualizedTable.header.checkbox.label"] },
			{ header_checkbox_label: headerCheckboxLabel }
		);
		const checkbox = this.props.selectable && this.props.rowSelection !== ROW_SELECTION.SINGLE ? (<div role="columnheader" className="properties-vt-header-checkbox">
			<Checkbox
				id={`properties-vt-hd-cb-${scrollKey}`}
				onChange={this.selectAll}
				checked={this.props.checkedAll}
				labelText={translatedHeaderCheckboxLabel}
				hideLabel
			/>
		</div>)
			: "";

		return (<div className={className} data-role="properties-header-row" role="row" style={style}>
			{checkbox}
			{columns}
		</div>);
	}

	headerColRenderer({ columnData, dataKey, disableSort, label, sortBy, sortDirection }) {
		let sortIcon = null;
		if (typeof this.props.sortColumns[dataKey] !== "undefined") {
			let type = null;
			switch (sortDirection) {
			case SORT_DIRECTION.ASC:
				type = CARBON_ICONS.ARROWS.UP;
				break;
			case SORT_DIRECTION.DESC:
				type = CARBON_ICONS.ARROWS.DOWN;
				break;
			default:
				type = CARBON_ICONS.ARROWS.VERTICAL;
			}
			sortIcon = (<span className="properties-ft-column-sort-icon">
				<Icon type={dataKey === this.props.sortBy ? type : CARBON_ICONS.ARROWS.VERTICAL}
					disabled={this.props.tableState === STATES.DISABLED}
				/>
			</span>);
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

		const resizeElem = this.props.resizable && !this.isLastColumn(dataKey)
			? (<Draggable
				axis="x"
				defaultClassName="ta-lr-virtualized-table-header-resize"
				defaultClassNameDragging="ta-lr-virtualized-table-header-resize-active"
				onDrag={
					(evt, { deltaX }) => {
						evt.stopPropagation();
						this.resizeColumn({ dataKey, deltaX });
					}
				}
				position={{ x: 0 }}
				zIndex={999}
			>
				<div
					role="button" tabIndex="0"
					aria-label="Resize column"
				/>
			</Draggable>)
			: "";

		return (
			<React.Fragment key={dataKey}>
				<div className={classNames("properties-vt-column properties-tooltips-container", { "sort-column-active": dataKey === this.props.sortBy })}>
					{ isEmpty(tooltip)
						? label
						: <Tooltip
							id={tooltipId}
							tip={tooltip}
							direction="bottom"
							className="properties-tooltips"
						>
							{label}
						</Tooltip>
					}
				</div>
				{disableSort === false && sortIcon}
				{ resizeElem }
			</React.Fragment>
		);
	}

	resizeColumn({ dataKey, deltaX }) {
		this.setState((prevState) => {

			const columns = prevState.columns;

			const resizedColumn = this.getColumnIndex(columns, dataKey);
			columns[resizedColumn].width += deltaX;
			columns[resizedColumn + 1].width -= deltaX;

			return {
				columnResized: true,
				columns: columns
			};
		});
	}

	overSelectOption(evt) {
		// Differentiate between mouse and keyboard event
		if (evt.type === "mouseenter" && !this.keyBoardEventCalled) {
			this.mouseEventCalled = true;
			this.isOverSelectOption = !this.isOverSelectOption;
		} else if (evt.type === "mouseleave" && this.mouseEventCalled) {
			this.mouseEventCalled = false;
			this.isOverSelectOption = !this.isOverSelectOption;
		} else if (evt.type === "focus" && !this.mouseEventCalled) {
			this.keyBoardEventCalled = true;
			this.isOverSelectOption = !this.isOverSelectOption;
		} else if (evt.type === "blur" && this.keyBoardEventCalled) {
			this.keyBoardEventCalled = false;
			this.isOverSelectOption = !this.isOverSelectOption;
		}
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
				const translatedRowCheckboxLabel = this.props.intl.formatMessage(
					{ id: "virtualizedTable.row.checkbox.label", defaultMessage: defaultMessages["virtualizedTable.row.checkbox.label"] },
					{ row_index: index + 1, table_label: (this.props.tableLabel ? this.props.tableLabel : "") }
				);

				selectOption = (<div className="properties-vt-row-checkbox"
					role="gridcell"
					onMouseEnter={(evt) => this.overSelectOption(evt)}
					onMouseLeave={(evt) => this.overSelectOption(evt)}
					onFocus={(evt) => this.overSelectOption(evt)}
					onBlur={(evt) => this.overSelectOption(evt)}
				>
					<Checkbox
						id={`properties-vt-row-cb-${scrollKey}-${index}`}
						key={`properties-vt-row-cb-${scrollKey}-${index}`}
						labelText={translatedRowCheckboxLabel}
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
					data-role="properties-loading-row"
					role="row"
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
					{ "properties-vt-row-disabled": rowDisabled },
					{ "properties-vt-row-non-interactive": !this.props.selectable } // ReadonlyTable with single row selection is non-interactive.
				)}
				data-role="properties-data-row"
				role="row"
				style={newStyle}
				onMouseDown={(evt) => this.onRowClick(evt, rowData, index)}
				onKeyPress={(evt) => {
					if (evt.code === "Space" || evt.code === "Enter") {
						this.onRowClick(evt, rowData, index);
					}
				}}
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
					{ "properties-vt-single-selection": this.props.rowSelection && this.props.rowSelection === ROW_SELECTION.SINGLE,
						"properties-light-disabled": !this.props.light })}
				>
					<AutoSizer>
						{({ height, width }) => ( // Table height: subtract 50 for margin below the table.
							<Table
								ref={this.virtualizedTableRef}
								width={width ? width : 500}
								height={height ? height : defaultTestHeight}

								className="properties-autosized-vt"
								aria-label={this.props.tableLabel ? this.props.tableLabel : ""}

								disableHeader={this.props.disableHeader}
								headerClassName="properties-autosized-vt-header"
								headerHeight={32}
								headerRowRenderer={this.headerRowRenderer.bind(this, this.props.scrollKey)}
								onHeaderClick={this.props.onHeaderClick}

								rowClassName="properties-vt-row-class"
								rowHeight={this.props.rowHeight ? this.props.rowHeight : 32}

								rowCount={this.state.rowCount}
								rowGetter={this.props.rowGetter}
								rowRenderer={this.rowRenderer.bind(this, this.props.scrollKey)}

								scrollToIndex={this.props.scrollToIndex}
								scrollToAlignment={this.props.scrollToAlignment}

								sort={this.props.onSort}
								sortDirection={this.props.sortDirection}
							>
								{
									this.state.columns.map((column) => (
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
	tableLabel: PropTypes.string,
	selectable: PropTypes.bool,
	resizable: PropTypes.bool,
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
	tableState: PropTypes.string,
	light: PropTypes.bool,
	intl: PropTypes.object.isRequired
};

export default injectIntl(VirtualizedTable);
