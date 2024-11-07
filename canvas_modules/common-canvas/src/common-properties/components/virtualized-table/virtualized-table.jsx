/*
 * Copyright 2017-2023 Elyra Authors
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
import { Checkbox, Loading, Button } from "@carbon/react";
import { ArrowUp, ArrowDown, ArrowsVertical, Information, TrashCan } from "@carbon/react/icons";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import TruncatedContentTooltip from "./../truncated-content-tooltip";
import { SORT_DIRECTION, STATES, ROW_SELECTION, MINIMUM_COLUMN_WIDTH, MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL, MESSAGE_KEYS } from "./../../constants/constants";
import { injectIntl } from "react-intl";
import defaultMessages from "../../../../locales/common-properties/locales/en.json";
import { formatMessage } from "../../util/property-utils.js";

import { isEmpty, differenceBy, mapValues } from "lodash";
import classNames from "classnames";

import PropTypes from "prop-types";
import React from "react";
import { v4 as uuid4 } from "uuid";

class VirtualizedTable extends React.Component {

	static getDerivedStateFromProps(nextProps, prevState) {
		const updatedState = {};
		if (nextProps.rowCount !== prevState.rowCount) {
			updatedState.rowCount = nextProps.rowCount;
		}

		const prevStateTableWidth = prevState.columns.reduce((totalWidth, column) => column.width + totalWidth, 0);
		const nextPropsTableWidth = nextProps.columns.reduce((totalWidth, column) => column.width + totalWidth, 0);
		const editorSizeUpdated = (prevStateTableWidth !== nextPropsTableWidth);

		// Get new columns if column label (headerLabel) is different. This is useful when changing "View in tables" dropdown in Expression control.
		// Also when right flyout is expanded/collapsed, width of all columns changes, in this case get new columns with updated widths.
		// We're not comparing all properties in columns object because width can be different after resizing.
		if (!prevState.columnResized || !isEmpty(differenceBy(nextProps.columns, prevState.columns, "headerLabel")) || editorSizeUpdated) {
			updatedState.columns = nextProps.columns;
		}
		return (updatedState);
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			rowCount: this.props.rowCount,
			columns: this.props.columns,
			columnResized: false
		};
		this.virtualizedTableRef = React.createRef();
		this.lastChecked = isEmpty(props.rowsSelected) ? null : props.rowsSelected.slice(-1).pop();

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
		this.uuid = uuid4();
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
		if (evt.target.className === "cds--select-option") {
			evt.stopPropagation(); // stop propagation when selecting dropdown select options within table rows
		} else {
			// Set selections
			const selected = !this.isRowSelected(rowData.originalRowIndex);
			if (typeof this.props.setRowsSelected === "function") {
				this.props.setRowsSelected({
					"index": index,
					"originalRowIndex": rowData.originalRowIndex,
					"selected": selected,
					"isOverSelectOption": this.isOverSelectOption,
					"selectMultipleRows": evt.shiftKey ? evt.shiftKey : false,
					"lastCheckedRow": this.lastChecked === null ? 0 : this.lastChecked }, evt);

				// Track lastChecked row for shift key selection
				this.lastChecked = rowData.index;
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

	// Returns an object of deltas for every column - {columnKey: individualDelta}
	getColumnWiseDeltas(columns, deltaX) {
		const columnWiseDeltas = {};
		if (columns.length > 0) {
			// sort columns in ascending order of widths because smallest column will reach MINIMUM_COLUMN_WIDTH first
			columns.sort((a, b) => a.width - b.width);
			let totalDelta = deltaX;
			// Finalize individualDelta for 1 column at a time starting from smallest column
			// If individualDelta is greater than maximum allowed delta for the column, set individualDelta = maximum allowed delta until column reaches MINIMUM_COLUMN_WIDTH
			// Total delta will reduce after every iteration
			for (let i = 0; i < columns.length; i++) {
				const widthOfAllColumns = columns.slice(i).reduce((prev, current) => prev + current.width, 0);
				let individualDelta = Math.round((columns[i].width * totalDelta) / widthOfAllColumns);
				// check if individualDelta is greater than the maximum allowed delta for this column
				if (columns[i].headerLabel.length > 0 && columns[i].width - individualDelta < MINIMUM_COLUMN_WIDTH) {
					individualDelta = columns[i].width - MINIMUM_COLUMN_WIDTH;
				} else if (columns[i].width - individualDelta < MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL) {
					individualDelta = columns[i].width - MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL;
				}
				totalDelta -= individualDelta;
				columnWiseDeltas[columns[i].key] = individualDelta;
			}
			if (totalDelta > 0) {
				// deltaX is greater than maximum allowed delta for all columns.
				// Don't allow resizing by setting individualDelta = 0 for ALL columns
				return mapValues(columnWiseDeltas, () => 0);
			}
		}
		return columnWiseDeltas;
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

	selectAll(evt, { checked, id }) {
		this.props.setAllRowsSelected(checked);
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
		const checkbox = this.props.selectable && this.props.rowSelection !== ROW_SELECTION.SINGLE
			? (<div role="checkbox" aria-checked={this.props.checkedAll} className="properties-vt-header-checkbox">
				<Checkbox
					id={`properties-vt-hd-cb-${this.uuid}-${scrollKey}`}
					onChange={this.selectAll}
					checked={this.props.checkedAll}
					labelText={translatedHeaderCheckboxLabel}
					hideLabel
					readOnly={this.props.readOnly}
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
			switch (this.props.sortColumns[dataKey]) {
			case SORT_DIRECTION.ASC:
				type = <ArrowUp disabled={this.props.tableState === STATES.DISABLED} />;
				break;
			case SORT_DIRECTION.DESC:
				type = <ArrowDown disabled={this.props.tableState === STATES.DISABLED} />;
				break;
			default:
				type = <ArrowsVertical disabled={this.props.tableState === STATES.DISABLED} />;
			}
			sortIcon = (<span className="properties-ft-column-sort-icon">
				{type}
			</span>);
		}

		const infoIcon = isEmpty(columnData.description)
			? null
			: (<div className="properties-vt-info-icon-tip">
				<Tooltip
					id="properties-tooltip-info"
					tip={columnData.description}
					direction="bottom"
					className="properties-tooltips"
					showToolTipOnClick
				>
					<Information className="properties-vt-info-icon" />
				</Tooltip>
			</div>);

		const resizeElem = columnData.resizable && !this.isLastColumn(dataKey)
			? (<Draggable
				axis="x"
				defaultClassName="properties-vt-header-resize"
				defaultClassNameDragging="properties-vt-header-resize-active"
				onDrag={
					(evt, { deltaX }) => {
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
		const headerDisplayLabel = typeof label === "string" ? (<span>{label}</span>) : label;
		const header = (<div className="properties-vt-label-tip-icon">
			<TruncatedContentTooltip
				tooltipText={columnData.headerLabel}
				content={headerDisplayLabel}
				disabled={columnData.disabled}
			/>
			{infoIcon}
		</div>);
		return (
			<div data-id={`properties-vt-header-${dataKey}`}
				className={classNames({ "properties-vt-column-with-resize": resizeElem !== "", "properties-vt-column-without-resize": resizeElem === "" })}
			>
				<div className={classNames("properties-vt-column properties-tooltips-container", { "sort-column-active": dataKey === this.props.sortBy })}>
					{header}
					{disableSort === false && sortIcon}
				</div>
				{ resizeElem }
			</div>
		);
	}

	/* Columns are not resizable by default. Host application specifies resizable columns in parameter definition.
	* When a column is resized, width of ALL the columns to the right of resized column is adjusted.
	* Every column grows/shrinks directly proportional to column width.
	* Example: If a column width is reduced by 10px and there are 4 columns on the right of resized column having widths [40, 30, 20, 10],
	* Then 10px will be adjusted in 4 columns as - [4px, 3px, 2px, 1px]
	* When every column's width reaches MINIMUM_COLUMN_WIDTH (56px), resizing is stopped.
	* Special case - For columns without labels, when their width reaches MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL (32px), resizing is stopped.
	*/
	resizeColumn({ dataKey, deltaX }) {
		this.setState((prevState) => {

			const columns = prevState.columns;
			// Calculate number of resizable columns on the right of resized column
			const resizedColumnIndex = this.getColumnIndex(columns, dataKey);
			const allColumnsOnRight = columns.slice(resizedColumnIndex + 1);
			// Exclude columns having staticWidth: true
			const nonStaticColumns = allColumnsOnRight.filter((column) => !column.staticWidth);

			const resizableColumns = nonStaticColumns.filter((column) => {
				// When shrinking, get columns having width greater than MINIMUM_COLUMN_WIDTH
				if (deltaX >= 0) {
					if (column.headerLabel.length > 0) {
						// Column with label has min width 56px
						return (column.width > MINIMUM_COLUMN_WIDTH);
					}
					// Column without label has min width 32px
					return (column.width > MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL);
				}
				// When expanding, get all columns
				return true;
			});

			// Get column wise delta for resizableColumns
			const columnWiseDeltas = this.getColumnWiseDeltas(resizableColumns, deltaX);
			const columnsToBeResized = Object.keys(columnWiseDeltas);

			// check if all column wise deltas are 0. This happens when deltaX is more than maximum allowed delta for all columns
			const everyColumnHasZeroDelta = Object.values(columnWiseDeltas).every((delta) => delta === 0);

			if ((columns[resizedColumnIndex].width + deltaX) > MINIMUM_COLUMN_WIDTH && !isEmpty(columnWiseDeltas) && !everyColumnHasZeroDelta) {
				columns[resizedColumnIndex].width += deltaX;
				// Adjust width of all resizable columns
				columnsToBeResized.forEach((columnKey) => {
					const idx = columns.findIndex((col) => col.key === columnKey);
					columns[idx].width -= columnWiseDeltas[columnKey];
				});
			}
			return {
				columnResized: true,
				columns: columns
			};
		});
	}

	overSelectOption(evt) {
		// Incase of readonly table disable all events
		if (!this.props.readOnly) {
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
	}

	// Responsible for rendering a table row given an array of columns.
	rowRenderer(scrollKey, { className, columns, index, key, rowData, style }) {
		let selectOption = "";
		let deleteOption = "";
		let selectedRow = false;
		const rowDisabled = typeof rowData.disabled === "boolean" ? rowData.disabled : false;
		const fieldsTableLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.EXPRESSION_FIELDS_TABLE_LABEL);
		const valuesTableLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.EXPRESSION_VALUES_TABLE_LABEL);
		const functionsTableLabel = formatMessage(this.reactIntl, MESSAGE_KEYS.EXPRESSION_FUNCTIONS_TABLE_LABEL);
		if (typeof this.props.rowHeight === "function" && this.props.rowHeight({ index }) === 0) {
			return null;
		}

		if (this.props.selectable) {
			const rowSelected = this.props.sortDirection ? this.isRowSelected(rowData.index) : this.isRowSelected(rowData.originalRowIndex); // use current row index when Sorted
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
					onKeyDown={(evt) => {
						if (evt.code === "Space" || evt.code === "Enter") {
							this.onRowClick(evt, rowData, index);
						}
					}}
				>
					<Checkbox
						id={`properties-vt-row-cb-${this.uuid}-${scrollKey}-${index}`}
						key={`properties-vt-row-cb-${scrollKey}-${index}`}
						labelText={translatedRowCheckboxLabel}
						hideLabel
						checked={rowSelected}
						disabled={rowDisabled}
						readOnly={this.props.readOnly}
					/>
				</div>);
			// Don't show delete icon for tables in expression builder
			} else if (this.props.rowSelection === ROW_SELECTION.SINGLE && !(this.props.tableLabel === fieldsTableLabel ||
				this.props.tableLabel === valuesTableLabel || this.props.tableLabel === functionsTableLabel
			)) {
				const toolTip = formatMessage(this.reactIntl, MESSAGE_KEYS.TABLE_DELETEICON_TOOLTIP);
				const tooltipId = "tooltip-delete-row";
				deleteOption = (
					<Tooltip
						id={tooltipId}
						tip={toolTip}
						direction="left"
						className="properties-tooltips icon-tooltip"
					>
						<Button
							kind="ghost"
							size="sm"
							type="delete"
							className="delete-button"
							iconDescription="Delete"
							hasIconOnly
							onClick={this.props.deleteRow}
							renderIcon={TrashCan}
						/>
					</Tooltip>
				);
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
			>
				{selectOption}
				{columns}
				{deleteOption}
			</div>
		</div>);
	}

	render() {
		const defaultTestHeight = 2000; // 2000 is set to accommodate test data "category-selection-data" with all categories expanded

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
								// AutoSizer manages width and height properties so the table fills the available space.
								// It does a direct DOM manipulation to the parent, outside React's VirtualDOM.
								// Since the actual DOM is not available when unit testing, we are passing in a default
								// width of 500 and a default height of 300.
								height={this.props.tableHeight || height || defaultTestHeight}

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
								tabIndex={-1}
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
	tableHeight: PropTypes.number.isRequired,
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
	deleteRow: PropTypes.func,
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
	intl: PropTypes.object.isRequired,
	readOnly: PropTypes.bool
};

export default injectIntl(VirtualizedTable);
