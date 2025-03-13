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

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"; // getSortedRowModel
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import { v4 as uuid4 } from "uuid";
import { isEmpty, differenceBy, mapValues } from "lodash";
import { Checkbox, Loading } from "@carbon/react";
import { ArrowUp, ArrowDown, ArrowsVertical, Information } from "@carbon/react/icons";

import Tooltip from "../../../Tooltip/Tooltip.jsx";
import TruncatedContentTooltip from "../truncated-content-Tooltip/index.js";
import { SORT_DIRECTION, STATES, ROW_SELECTION, MINIMUM_COLUMN_WIDTH, MINIMUM_COLUMN_WIDTH_WITHOUT_LABEL } from "../../constants/constants.js";

import defaultMessages from "../../../../locales/common-properties/locales/en.json";

import classNames from "classnames";


const DEFAULT_COLUMN_WIDTH = 120;
const DEFAULT_ROW_HEIGHT = 32; // $spacing-07

const VirtualizedGrid = (props) => {
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
		overscan: 5
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
		props.columns.forEach((col, colIdx) => colDefs.push({
			accessorFn: (row) => row.columns?.[colIdx].content,
			header: col.label,
			size: col.width,
			id: col.key,
			enableResizing: col.resizable
		}));
		return colDefs;
	}, props.columns);

	const table = useReactTable({
		data: props.data,
		columns,
		defaultColumn: {
			size: DEFAULT_COLUMN_WIDTH
		},
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel()
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
			? (<th role="checkbox" aria-checked={props.checkedAll} className="properties-vt-header-checkbox">
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
			const rowSelected = props.sortDirection ? isRowSelected(rowData.index) : isRowSelected(rowData.originalRowIndex); // use current row index when Sorted
			const rowDisabled = typeof rowData.disabled === "boolean" ? rowData.disabled : false;
			const translatedRowCheckboxLabel = props.intl.formatMessage(
				{ id: "virtualizedTable.row.checkbox.label", defaultMessage: defaultMessages["virtualizedTable.row.checkbox.label"] },
				{ row_index: rowIndex + 1, table_label: (props.tableLabel ? props.tableLabel : "") }
			);

			selectOption = (<td className="properties-vt-row-checkbox"
				role="gridcell"
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
				setIsOverSelectOptionState(!isOverSelectOption); // TODO test
			} else if (evt.type === "blur" && keyBoardEventCalled) {
				setKeyBoardEventCalledState(false);
				setIsOverSelectOptionState(!isOverSelectOption); // TODO test
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
				<th key="properties-grid-fake-col-row-0-start" className="properties-autosized-vt-header properties-grid-fake-col" style={{ width: `${before}px` }} />
				{renderHeaderCheckbox()}
				{columnItems.map((virtualColumn) => {
					const header = headerGroup.headers[virtualColumn.index];
					const headerLabel = props.columns[virtualColumn.index].label;
					const headerDisplayLabel = typeof headerLabel === "string" ? (<span>{headerLabel}</span>) : headerLabel;
					const infoIcon = isEmpty(props.columns[virtualColumn.index].description)
						? null
						: (<div className="properties-vt-info-icon-tip">
							<Tooltip
								id="properties-tooltip-info"
								tip={props.columns[virtualColumn.index].description}
								direction="bottom"
								className="properties-tooltips"
								showToolTipOnClick
							>
								<Information className="properties-vt-info-icon" />
							</Tooltip>
						</div>);
					const headerTooltip = (<div className="properties-vt-label-tip-icon">
						<TruncatedContentTooltip
							tooltipText={props.columns[virtualColumn.index].headerLabel}
							content={headerDisplayLabel}
							disabled={props.columns[virtualColumn.index].disabled}
						/>
						{infoIcon}
					</div>);
					return (<th key={`properties-grid-${header.id}`}
						className="properties-autosized-vt-header sticky-row properties-vt-column properties-tooltips-container"
						style={{ width: Math.max(colSizes[virtualColumn.index], props.columns[virtualColumn.index].width) }}
					>
						{headerTooltip}
						<div className={classNames("properties-grid-header-resizer", { "resizing": header.column.getIsResizing() })}
							onMouseDown={header.getResizeHandler()}
							onTouchStart={header.getResizeHandler()}
						/>
					</th>);
				})}
				<th key="properties-grid-fake-col-row-0-end" className="properties-autosized-vt-header properties-grid-fake-col" style={{ width: `${excess}px` }} />
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

				return (<tr key={`properties-grid-body-row-${virtualRow.index}}`}
					className={classNames("properties-grid-body-row properties-vt-double-click",
						// { "properties-vt-row-selected": selectedRow },
						// { "properties-vt-row-disabled": rowDisabled },
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

	// const getCell = (row, cellType, rowIndex, columnIndex, cellValue, columnType) => {
	// 	const key = row.id;
	// 	if (columnIndex === 0) {
	// 		return (
	// 			<div key={`cell-index-${key}-${cellValue}`}
	// 				className="cellIndex"
	// 			>{cellValue}</div>
	// 		);
	// 	}
	// 	const className = classNames({ "resizable-header": cellType === "header" },
	// 		{ "table-column-cells": cellType === "body" }
	// 	);

	// 	return (<div className={className} key={key} >
	// 		<Tooltip
	// 			id={`${rowIndex}-${columnIndex}-cell-Tooltip`}
	// 			className="infinite-table-cell-Tooltip-container"
	// 			tip={`${cellValue}`} // needs to be a string
	// 			direction="bottom"
	// 			showTooltipIfTruncated
	// 		>
	// 			{`${cellValue}`}
	// 		</Tooltip>
	// 	</div>);
	// };

	const onRowClick = (evt, rowIndex, rowData) => {
		if (evt.target.className === "cds--select-option") {
			evt.stopPropagation(); // stop propagation when selecting dropdown select options within table rows
		} else { // TODO
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
				setLastCheckedState(rowData.index);
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

	// const isLastColumn = (dataKey) => {
	// 	const columnIndex = getColumnIndex(props.columns, dataKey);
	// 	const isLastColumn = (columnIndex === (props.columns.length - 1));
	// 	return isLastColumn;
	// };

	const setAllRowsSelected = (evt, { checked, id }) => {
		props.setAllRowsSelected(checked);
	};

	return (<div ref={parentRef} className="properties-tanstack-grid properties-vt" tabIndex={0}>
		<table className="properties-autosized-vt">
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

export default injectIntl(VirtualizedGrid);
