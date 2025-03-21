/*
 * Copyright 2025 Elyra Authors
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

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import { v4 as uuid4 } from "uuid";
import { isEmpty, includes } from "lodash";
import { Checkbox, Toggletip, ToggletipButton, ToggletipContent, Tooltip } from "@carbon/react";
import { ArrowUp, ArrowDown, ArrowsVertical, Information } from "@carbon/react/icons";

// import Tooltip from "../../../tooltip/tooltip.jsx";
import TruncatedContentTooltip from "../truncated-content-tooltip";
import { ROW_SELECTION } from "../../constants/constants.js";

import defaultMessages from "../../../../locales/common-properties/locales/en.json";

import classNames from "classnames";


const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 32; // $spacing-07

const VirtualizedGrid = (props) => {
	const [sorting, setSorting] = useState([]);
	const [isOverSelectOption, setIsOverSelectOptionState] = useState(false);
	const [mouseEventCalled, setMouseEventCalledState] = useState(false);
	const [keyBoardEventCalled, setKeyBoardEventCalledState] = useState(false);
	const [lastChecked, setLastCheckedState] = useState(isEmpty(props.rowsSelected) ? null : props.rowsSelected.slice(-1).pop());
	const uuid = uuid4();

	const parentRef = useRef(null);
	const rowVirtualizer = useVirtualizer({
		count: props.rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => DEFAULT_ROW_HEIGHT,
		overscan: 3
	});

	const columnVirtualizer = useVirtualizer({
		count: props.columns.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (colIdx) => DEFAULT_COLUMN_WIDTH, // props.columns[colIdx].width ||
		horizontal: true,
		overscan: 3
	});

	const columns = React.useMemo(() => {
		const colDefs = [];
		props.columns.forEach((col, colIdx) => {
			const columnDef = {
				accessorFn: (row) => row.columns?.[colIdx]?.content,
				header: col.label,
				size: col.width,
				id: col.key,
				enableResizing: col.resizable,
				enableSorting: props.onSort && includes(props.sortColumns, col.key)
			};
			colDefs.push(columnDef);
		});
		return colDefs;
	}, [props.columns]);

	const table = useReactTable({
		data: props.data,
		columns,
		defaultColumn: {
			size: DEFAULT_COLUMN_WIDTH
		},
		state: {
			sorting,
		},
		sortDescFirst: false,
		onSortingChange: setSorting,
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel(),
		enableSortingRemoval: false // disable the ability to remove sorting on columns (always none -> asc -> desc -> asc)
	});

	// Calculate column sizes when changed from resizing
	const colSizes = React.useMemo(() => {
		const virtualizedItems = columnVirtualizer.getMeasurements();
		const headers = table.getLeafHeaders();
		const colSizeDefs = {};
		headers.forEach((header, idx) => {
			colSizeDefs[idx] = header.column.getSize();

			// This is needed for scrolling smoothly
			if (virtualizedItems[idx].size !== colSizeDefs[idx]) {
				columnVirtualizer.resizeItem(idx, colSizeDefs[idx]);
			}
		});
		return colSizeDefs;
	}, [table.getState().columnSizingInfo, props.excessWidth]);

	useEffect(() => {
		if (props.onSort && table.getState().sorting.length > 0) {
			props.onSort(table.getState().sorting[0].id, table.getState().sorting[0].desc);
		}
	}, [table.getState().sorting]);

	useEffect(() => {
		if (typeof props.scrollToIndex !== "undefined") {
			let repeatScroll;
			let virtualRows = rowVirtualizer.getVirtualItems().map((vrow) => vrow.index);
			const maxRetryCount = Math.ceil((props.scrollToIndex + 1) / rowVirtualizer.getVirtualItems().length) + 1;

			const keepScrolling = (direction) => {
				let retryCount = maxRetryCount;
				const rowVisible = document.querySelectorAll(`tr[data-id=${props.scrollKey}-${props.scrollToIndex}]`);
				virtualRows = rowVirtualizer.getVirtualItems().map((vrow) => vrow.index);
				if (rowVisible?.[0]) {
					rowVisible?.[0].scrollIntoView({ "behavior": "instant", "block": direction === "down" ? "start" : "end" });
					retryCount = 0;
				} else {
					const scrollRowIdx = direction === "down" ? virtualRows.length - 1 : virtualRows[0];
					const scrollBlock = direction === "down" ? "start" : "end";
					const scrollToRow = document.querySelectorAll(`tr[data-id=${props.scrollKey}-${scrollRowIdx}]`);
					if (scrollToRow?.[0]) {
						scrollToRow?.[0].scrollIntoView({ "behavior": "instant", "block": scrollBlock });
					}
					retryCount--;
				}

				if (retryCount === 0) {
					clearInterval(repeatScroll);
				}
			};

			if (!includes(virtualRows, props.scrollToIndex)) {
				// Keep scrolling until the row is in view
				if (props.scrollToIndex > virtualRows[virtualRows.length - 1]) { // scroll down the table
					repeatScroll = setInterval(() => keepScrolling("down"), 1);
				} else { // scroll up the table
					repeatScroll = setInterval(() => keepScrolling("up"), 1);
				}
			} else {
				const row = document.querySelectorAll(`tr[data-id=${props.scrollKey}-${props.scrollToIndex}]`);
				if (row?.[0]) {
					row?.[0].scrollIntoView({ "behavior": "instant", "block": "center" });
				}
			}
		}
	}, [props.scrollToIndex]);

	const checkboxLabelColumnIndex = React.useMemo(() => {
		if (typeof props.columns === "undefined" || props.columns.length === 0) {
			return 0;
		}
		// If 1st column is Index, use the next column for labeling
		for (let i = 0; i < props.columns.length; i++) {
			if (props.columns[i].operation !== "index") {
				return i;
			}
		}
		// Use first column by default
		return 0;
	}, [props.columns]);

	const renderHeaderCheckbox = () => {
		const headerCheckboxLabel = (typeof props.columns === "undefined" || props.columns.length === 0) ? "" : props.columns[checkboxLabelColumnIndex].headerLabel;
		const translatedHeaderCheckboxLabel = props.intl.formatMessage(
			{ id: "virtualizedTable.header.checkbox.label", defaultMessage: defaultMessages["virtualizedTable.header.checkbox.label"] },
			{ header_checkbox_label: headerCheckboxLabel }
		);
		const checkbox = props.selectable && props.rowSelection !== ROW_SELECTION.SINGLE
			? (<th className="properties-vt-column properties-vt-header-checkbox">
				<Checkbox
					id={`properties-vt-hd-cb-${uuid}-${props.scrollKey}`}
					onChange={setAllRowsSelected}
					checked={props.checkedAll}
					labelText={translatedHeaderCheckboxLabel}
					hideLabel
					readOnly={props.readOnly}
				/>
			</th>)
			: "";
		return checkbox;
	};

	const renderDataRowCheckbox = (rowIndex, rowData) => {
		if (props.summaryTable) {
			return <div className="properties-vt-row-checkbox" />;
		}

		let selectOption = "";
		if (props.selectable && props.rowSelection !== ROW_SELECTION.SINGLE) {
			const rowSelected = isRowSelected(rowData.originalRowIndex); // use current row index when Sorted
			const rowDisabled = typeof rowData.disabled === "boolean" ? rowData.disabled : false;
			const translatedRowCheckboxLabel = props.intl.formatMessage(
				{ id: "virtualizedTable.row.checkbox.label", defaultMessage: defaultMessages["virtualizedTable.row.checkbox.label"] },
				{ row_index: rowIndex + 1, table_label: (props.tableLabel ? props.tableLabel : "") }
			);

			selectOption = (<td className="properties-vt-row-checkbox"
				onMouseEnter={(evt) => overSelectOption(evt)}
				onMouseLeave={(evt) => overSelectOption(evt)}
				onFocus={(evt) => overSelectOption(evt)}
				onBlur={(evt) => overSelectOption(evt)}
				onKeyDown={(evt) => {
					if (evt.code === "Space" || evt.code === "Enter") {
						onRowClick(evt, rowIndex, rowData);
					}
				}}
			>
				<Checkbox
					id={`properties-vt-row-cb-${uuid}-${props.scrollKey}-${rowIndex}`}
					key={`properties-vt-row-cb-${props.scrollKey}-${rowIndex}`}
					labelText={translatedRowCheckboxLabel}
					hideLabel
					checked={rowSelected}
					disabled={rowDisabled}
					readOnly={props.readOnly}
				/>
			</td>);
		}
		return selectOption;
	};

	const overSelectOption = (evt) => {
		// Incase of readonly table disable all events
		if (!props.readOnly) {
			// Differentiate between mouse and keyboard event
			if (evt.type === "mouseenter" && !keyBoardEventCalled) {
				setMouseEventCalledState(true);
				setIsOverSelectOptionState(true);
			} else if (evt.type === "mouseleave" && mouseEventCalled) {
				setMouseEventCalledState(false);
				setIsOverSelectOptionState(false);
			} else if (evt.type === "focus" && !mouseEventCalled) {
				setKeyBoardEventCalledState(true);
				setIsOverSelectOptionState(!isOverSelectOption);
			} else if (evt.type === "blur" && keyBoardEventCalled) {
				setKeyBoardEventCalledState(false);
				setIsOverSelectOptionState(!isOverSelectOption);
			}
		}
	};

	const tableHeader = (groups) => (<thead className="properties-grid-header">
		{groups.map((headerGroup) => {
			const columnItems = columnVirtualizer.getVirtualItems();
			const [before, after] = columnItems.length > 1
				? [columnItems[1].index === 0
					? columnItems[0].end
					: columnItems[1].start - columnItems[0].end, columnVirtualizer.getTotalSize() - columnItems[columnItems.length - 1].end]
				: [0, 0];
			const excess = after + props.excessWidth;

			return (<tr className="properties-vt-row-class" key="canvas-grid-header-row-0" data-role="properties-header-row">
				<th key="properties-grid-fake-col-row-0-start" className="properties-grid-fake-col" style={{ width: `${before}px` }} />
				{renderHeaderCheckbox()}
				{columnItems.map((virtualColumn) => {
					const virtualHeader = headerGroup.headers[virtualColumn.index];
					const header = props.columns[virtualColumn.index];
					const headerLabel = header.label;
					const headerDisplayLabel = typeof headerLabel === "string" ? (<span>{headerLabel}</span>) : headerLabel;
					const infoIcon = isEmpty(header.description)
						? null
						: (<div className="properties-vt-info-icon-tip">
							<Toggletip align="bottom" onClick={(evt) => evt.stopPropagation()}>
								<ToggletipButton><Information className="properties-vt-info-icon" /></ToggletipButton>
								<ToggletipContent className="properties-grid-th-toggletip">{header.description}</ToggletipContent>
							</Toggletip>
						</div>);
					const sortable = includes(props.sortColumns, header.key);
					const headerContentTooltip = (<div className={classNames("properties-vt-label-tip-icon", { "header-disabled": !sortable })}>
						<TruncatedContentTooltip
							tooltipText={header.headerLabel}
							content={headerDisplayLabel}
							disabled={header.disabled}
						/>
						{infoIcon}
					</div>);
					let sortIcon = null;
					if (!sortable) {
						sortIcon = null;
					} else if (virtualHeader.column.getIsSorted() === "asc") {
						sortIcon = <ArrowUp className="properties-ft-column-sort-icon asc" />;
					} else if (virtualHeader.column.getIsSorted() === "desc") {
						sortIcon = <ArrowDown className="properties-ft-column-sort-icon desc" />;
					} else { // false
						sortIcon = <ArrowsVertical className="properties-ft-column-sort-icon default" />;
					}

					let headerDisplay = headerContentTooltip;
					if (sortable) {
						headerDisplay = (<button className={classNames("properties-vt-header-btn cds--table-sort", { "header-disabled": !sortable })} disabled={!sortable}>
							{headerContentTooltip}
							{sortIcon}
						</button>);
					}

					const resizeHandle = header.resizable
						? (<div className={classNames("properties-vt-header-resize", { "resizing": virtualHeader.column.getIsResizing() })}
							onMouseDown={virtualHeader.getResizeHandler()}
							onTouchStart={virtualHeader.getResizeHandler()}
							role="button" tabIndex="0"
							aria-label="Resize column"
						/>)
						: null;
					return (<th key={`properties-grid-${virtualHeader.id}`}
						className={classNames("properties-autosized-vt-header sticky-row properties-vt-column properties-tooltips-container",
							{ "properties-vt-column-with-resize": header.resizable },
							{ "properties-vt-column-sortable": sortable },
							{ "sort-column-active": sortable && (virtualHeader.column.getIsSorted() === "asc" || virtualHeader.column.getIsSorted() === "desc") }
						)}
						style={{ width: Math.max(colSizes[virtualColumn.index], header.width) }}
						onClick={virtualHeader.column.getToggleSortingHandler()}
						aria-label={headerLabel}
						data-id={`properties-vt-header-${header.key}`}
					>
						{headerDisplay}
						{resizeHandle}
					</th>);
				})}
				<th key="properties-grid-fake-col-row-0-end" className="properties-grid-fake-col" style={{ width: `${excess}px` }} />
			</tr>);
		})}
	</thead>);

	const tableBody = (tableRows) => {
		const rowItems = rowVirtualizer.getVirtualItems();
		const columnItems = columnVirtualizer.getVirtualItems();
		const [before, after] = columnItems.length > 1
			? [columnItems[1].index === 0
				? columnItems[0].end
				: columnItems[1].start - columnItems[0].end, columnVirtualizer.getTotalSize() - columnItems[columnItems.length - 1].end]
			: [0, 0];
		const excess = after + props.excessWidth;

		return (<tbody key="properties-grid-body-key" className="properties-grid-body" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
			{rowItems.map((virtualRow) => {
				const row = tableRows[virtualRow.index];
				const originalRowIndex = props.getOriginalRowIndex(row.original, virtualRow.index);

				const visibleCells = row.getVisibleCells();
				const rowData = columnItems.map((virtualColumn) => {
					const cell = visibleCells[virtualColumn.index];
					return (<td key={`properties-grid-row-${virtualRow.index}-${virtualColumn.index}`}
						className={classNames("properties-grid-body-row-cell")}
						style={{
							minHeight: DEFAULT_ROW_HEIGHT,
							width: Math.max(colSizes[virtualColumn.index], props.columns[virtualColumn.index].width)
						}}
					>
						{cell.getValue()}
					</td>);
				});
				rowData.originalRowIndex = originalRowIndex;
				const rowSelected = isRowSelected(rowData.originalRowIndex);
				const rowDisabled = typeof rowData.disabled === "boolean" ? rowData.disabled : false;

				return (<tr key={`properties-grid-body-row-${virtualRow.index}}`} data-id={`${props.scrollKey}-${originalRowIndex}`}
					className={classNames("properties-grid-body-row properties-vt-row-class properties-vt-double-click",
						{ "properties-vt-row-selected": rowSelected },
						{ "properties-vt-row-disabled": rowDisabled },
						{ "properties-vt-row-non-interactive": !props.selectable } // ReadonlyTable with single row selection is non-interactive.
					)}
					data-role="properties-data-row"
					style={{ transform: `translateY(${virtualRow.start}px)` }}
					onMouseDown={(evt) => onRowClick(evt, virtualRow.index, rowData)}
					onDoubleClick={(evt) => onRowDoubleClick(evt, rowData.rowKey, virtualRow.index)}
				>
					<td key={`properties-grid-body-row-${virtualRow.index}-fake-col-start`} className="properties-grid-fake-col" style={{ width: `${before}px` }} />
					{renderDataRowCheckbox(virtualRow.index, rowData)}
					{rowData}
					<td key={`properties-grid-body-row-${virtualRow.index}-fake-col-end`} className="properties-grid-fake-col" style={{ width: `${excess}px` }} />
				</tr>);
			})}
		</tbody>);
	};

	const onRowClick = (evt, rowIndex, rowData) => {
		if (evt.target.className === "cds--select-option") {
			evt.stopPropagation(); // stop propagation when selecting dropdown select options within table rows
		} else {
			// Set selections
			const selected = !isRowSelected(rowData.originalRowIndex);
			if (typeof props.setRowsSelected === "function") {
				props.setRowsSelected({
					"index": rowIndex,
					"originalRowIndex": rowData.originalRowIndex,
					"selected": selected,
					"isOverSelectOption": isOverSelectOption,
					"selectMultipleRows": evt.shiftKey ? evt.shiftKey : false,
					"lastCheckedRow": lastChecked === null ? 0 : lastChecked }, evt);

				// Track lastChecked row for shift key selection
				setLastCheckedState(rowData.originalRowIndex);
			}
		}
	};

	const onRowDoubleClick = (evt, rowKey, index) => {
		if (props.onRowDoubleClick) {
			props.onRowDoubleClick(evt, rowKey, index);
		}
	};

	const isRowSelected = (index) => {
		if (props.rowsSelected) {
			return props.rowsSelected.indexOf(index) > -1;
		}
		return false;
	};

	const setAllRowsSelected = (evt, { checked, id }) => {
		props.setAllRowsSelected(checked);
	};

	return (<div ref={parentRef} className="properties-tanstack-grid properties-vt" tabIndex={0}>
		<table aria-label={props.tableLabel ? props.tableLabel : ""} className={classNames("properties-autosized-vt",
			{ "properties-vt-single-selection": props.rowSelection && props.rowSelection === ROW_SELECTION.SINGLE },
			{ "properties-light-disabled": !props.light })}
		>
			{props.showHeader ? tableHeader(table.getHeaderGroups()) : null}
			{tableBody(table.getRowModel().rows)}
		</table>
	</div>);
};

VirtualizedGrid.defaultProps = {
	disableHeader: false
};

VirtualizedGrid.propTypes = {
	data: PropTypes.array.isRequired,
	tableLabel: PropTypes.string,
	tableHeight: PropTypes.number.isRequired,
	excessWidth: PropTypes.number.isRequired,
	selectable: PropTypes.bool,
	summaryTable: PropTypes.bool,
	rowSelection: PropTypes.string,
	showHeader: PropTypes.bool,
	columns: PropTypes.array.isRequired,
	rowCount: PropTypes.number.isRequired,
	rowGetter: PropTypes.func.isRequired,
	rowHeight: PropTypes.oneOfType([
		PropTypes.func.isRequired,
		PropTypes.number.isRequired
	]),
	onRowDoubleClick: PropTypes.func,
	getOriginalRowIndex: PropTypes.func,
	rowsSelected: PropTypes.array, // Required if selectable is true
	checkedAll: PropTypes.bool, // Required if selectable is true
	setRowsSelected: PropTypes.func, // Required if selectable is true
	setAllRowsSelected: PropTypes.func, // Required if selectable is true
	scrollToIndex: PropTypes.number,
	onSort: PropTypes.func,
	sortColumns: PropTypes.array,
	onHeaderClick: PropTypes.func,
	scrollKey: PropTypes.string,
	tableState: PropTypes.string,
	light: PropTypes.bool,
	intl: PropTypes.object.isRequired,
	readOnly: PropTypes.bool
};

export default injectIntl(VirtualizedGrid);
