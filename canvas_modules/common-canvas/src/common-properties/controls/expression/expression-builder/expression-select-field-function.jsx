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

import React from "react";
import PropTypes from "prop-types";
import { Dropdown, Tabs, Tab } from "carbon-components-react";
import FlexibleTable from "./../../../components/flexible-table/flexible-table.jsx";
import { MESSAGE_KEYS, EXPRESSION_TABLE_ROWS, SORT_DIRECTION, ROW_SELECTION } from "./../../../constants/constants";
import PropertyUtils from "./../../../util/property-utils";
import sortBy from "lodash/sortBy";
import uuid4 from "uuid/v4";

export default class ExpressionSelectFieldOrFunction extends React.Component {

	constructor(props) {
		super(props);
		this.recentUseCat = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_RECENTLY_USED);
		this.recentUseCatInfo = {
			id: this.recentUseCat,
			locLabel: this.recentUseCat,
			field_columns: {
				field_column_info: {
					locLabel: PropertyUtils.formatMessage(this.reactIntl,
						MESSAGE_KEYS.EXPRESSION_RECENTLY_USED_COLUMN)
				},
				value_column_info: {
					locLabel: PropertyUtils.formatMessage(this.reactIntl,
						MESSAGE_KEYS.EXPRESSION_VALUE_COLUMN)
				}
			}
		};
		this.inCategories = Object.keys(props.functionList);
		this.fields = this._makeDatasetFields(props.controller.getDatasetMetadataFields(), props.controller.getExpressionInfo().fields);
		this.state = {
			fieldSelected: 0,
			valueSelected: 0,
			functionSelected: 0,
			fieldTableSortSpec: null,
			valuesTableSortSpec: null,
			functionTableSortSpec: null,
			functionCategory: this.inCategories[0], // set the initial function category to the first one in the list.
			selectedTab: 0,
			fieldCategory: "fields",
			currentFieldDataset: this.fields.field_table_info[0].field_value_groups
		};
		this.controller = props.controller;
		this.reactIntl = props.controller.getReactIntl();
		this.onFunctionCatChange = this.onFunctionCatChange.bind(this);
		this.onFieldCatChange = this.onFieldCatChange.bind(this);
		this.onFieldFilter = this.onFieldFilter.bind(this);
		this.onValueFilter = this.onValueFilter.bind(this);
		this.onFunctionFilter = this.onFunctionFilter.bind(this);
		this.language = props.language;

		this.onFieldTableClick = this.onFieldTableClick.bind(this);
		this.onFieldTableDblClick = this.onFieldTableDblClick.bind(this);
		this.onFunctionTableClick = this.onFunctionTableClick.bind(this);
		this.onFunctionTableDblClick = this.onFunctionTableDblClick.bind(this);
		this.onValueTableClick = this.onValueTableClick.bind(this);
		this.onValueTableDblClick = this.onValueTableDblClick.bind(this);

		this.sortTableRows = this.sortTableRows.bind(this);
	}

	onTabClick(tabidx, evt) {
		this.setState({
			selectedTab: tabidx
		});
	}

	onFunctionCatChange(evt) {
		this.setState({
			functionCategory: evt.selectedItem.value,
			functionSelected: 0
		});
	}

	onFieldCatChange(evt) {
		let currentData = [];
		if (evt.selectedItem.value === this.recentUseCat) {
			currentData = this.props.controller.getExpressionFieldsRecentlyUsed();
		} else {
			for (let index = 0; index < this.fields.field_table_info.length; index++) {
				if (evt.selectedItem.value === this.fields.field_table_info[index].id) {
					currentData = this.fields.field_table_info[index].field_value_groups;
				}
			}
		}
		this.setState({
			fieldCategory: evt.selectedItem.value,
			fieldSelected: 0,
			currentFieldDataset: currentData
		});
	}

	onFieldTableClick(row, evt, rowKey) {
		this.setState({
			fieldSelected: rowKey,
			valueSelected: 0
		});

	}

	onFieldTableDblClick(evt, rowKey, index) {
		const field = this.state.currentFieldDataset[rowKey];
		let value = field.id;
		if (this.state.fieldCategory !== this.recentUseCat) {
			this.props.controller.updateExpressionFieldsRecentlyUsed(field);
		}
		if (this.props.onChange) {
			const quote = (this.language === "CLEM" && this.state.fieldCategory !== "globals") ? "'" : "";
			value = quote + field.id + quote;
			this.props.onChange(value);
		}
	}

	onFieldFilter(filterString) {
		this.setState({ fieldFilterText: filterString });
	}

	onValueTableClick(row, evt, rowKey) {
		this.setState({
			valueSelected: rowKey
		});
	}

	onValueTableDblClick(evt, rowKey, index) {
		if (this.props.onChange) {
			const field = this.state.currentFieldDataset[this.state.fieldSelected];
			if (field.values) {
				const quote = "\"";
				const value = field.values[rowKey].value;
				const fieldValue = (typeof value === "string") ? quote + value + quote : value;
				this.props.onChange(fieldValue);
			} else if (field.range) {
				this.props.onChange(rowKey === 0 ? field.range.min.value : field.range.max.value);
			}
		}
		this.setState({
			valueSelected: rowKey
		});
	}

	onValueFilter(filterString) {
		this.setState({ valueFilterText: filterString });
	}

	onFunctionTableClick(row, evt, rowKey) {
		this.setState({
			functionSelected: rowKey
		});
	}

	onFunctionTableDblClick(evt, rowKey, index) {
		let field;
		if (this.state.functionCategory === this.recentUseCat) {
			field = this.props.controller.getExpressionRecentlyUsed()[rowKey];
		} else {
			field = this.props.functionList[this.state.functionCategory].functionList[rowKey];
			this.props.controller.updateExpressionRecentlyUsed(field);
		}
		const value = field.value;
		if (this.props.onChange) {
			this.props.onChange(value);
		}
	}

	onFunctionFilter(filterString) {
		this.setState({ functionFilterText: filterString });
	}

	setSortColumn(table, spec) {
		switch (table) {
		case "fieldTable": {
			// const sortedData = this.sortTableRows(this.state.currentFieldDataset, spec);
			this.setState({ fieldTableSortSpec: spec }); // , currentFieldDataset: sortedData });
			break;
		}
		case "valuesTable": {
			this.setState({ valuesTableSortSpec: spec });
			break;
		}
		case "functionTable": {
			this.setState({ functionTableSortSpec: spec });
			break;
		}
		default:
		}
	}

	sortTableRows(data, spec) {
		let colIdx = 0;

		if (data.length > 0) {
			const tableColumns = data[0].columns;
			for (let idx = 0; idx < tableColumns.length; idx++) {
				if (tableColumns[idx].column === spec.column) {
					colIdx = idx;
					break;
				}
			}

			const sortedData = sortBy(data, function(row) {
				return row.columns[colIdx].value;
			});
			if (spec.direction === SORT_DIRECTION.DESC) {
				sortedData.reverse();
			}
			return sortedData;
		}
		return data;
	}

	createContentObject(label) {
		return (
			<div className="properties-table-cell-control">
				<div className="properties-expr-table-cell">
					<span>
						{label}
					</span>
				</div>
			</div>
		);
	}

	_makeDatasetFields(dataset, fieldDataset) {
		const fieldColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELD_COLUMN);
		const storageColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_STORAGE_COLUMN);
		const valueColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_VALUE_COLUMN);
		const dropdownLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELDS_DROPDOWN_TITLE);
		const fieldsCatInfo = {
			id: "fields",
			locLabel: dropdownLabel,
			field_columns: {
				field_column_info: {
					locLabel: fieldColumn
				},
				value_column_info: {
					locLabel: valueColumn
				},
				additional_column_info: [
					{
						id: "storage",
						locLabel: storageColumn
					}
				]
			}
		};

		const fieldsTableInfo = {
			id: "fields",
			field_value_groups: []
		};
		dataset.forEach((field) => {
			var entry = {
				id: field.name,
				additional_column_entries: [
					{
						id: "storage",
						value: field.type
					}
				]
			};
			if (field.metadata.values) {
				entry.values = [];
				field.metadata.values.forEach((val) => {
					entry.values.push({ value: val });
				});
			}
			if (field.metadata.range) {
				entry.range = {};
				if (field.metadata.range.min) {
					entry.range.min = { value: field.metadata.range.min };
				}
				if (field.metadata.range.max) {
					entry.range.max = { value: field.metadata.range.max };
				}
			}
			fieldsTableInfo.field_value_groups.push(entry);
		});
		// if fields already exists in metadata, update it instead of adding it to the front
		let catIndex;
		let infoIndex;
		for (let index = 0; index < fieldDataset.field_categories.length; index++) {
			if (fieldDataset.field_categories[index].id === "fields") {
				catIndex = index;
			}
		}
		for (let index = 0; index < fieldDataset.field_table_info.length; index++) {
			if (fieldDataset.field_table_info[index].id === "fields") {
				infoIndex = index;
			}
		}
		if (typeof catIndex !== "undefined") {
			fieldDataset.field_categories[catIndex] = fieldsCatInfo;
		} else {
			fieldDataset.field_categories.unshift(fieldsCatInfo);
		}
		if (typeof infoIndex !== "undefined") {
			fieldDataset.field_table_info[infoIndex] = fieldsTableInfo;
		} else {
			fieldDataset.field_table_info.unshift(fieldsTableInfo);
		}
		return fieldDataset;
	}


	_makeFieldAndValuesContent() {
		// Make field and value tables headers.
		const fieldCategory = this._makeFieldDropdown();
		const fieldHeaders = [];
		const valueHeader = [];
		const sortable = ["fieldName"];

		let categoryInfo = null;
		let tableContents = null;
		if (this.state.fieldCategory === this.recentUseCat) {
			// get recently used category info and table contents
			categoryInfo = this.recentUseCatInfo;
			tableContents = { id: this.recentUseCat, field_value_groups: this.props.controller.getExpressionFieldsRecentlyUsed() };
		} else {
			// get category info and table contents
			for (let index = 0; index < this.fields.field_categories.length; index++) {
				if (this.state.fieldCategory === this.fields.field_categories[index].id) {
					categoryInfo = this.fields.field_categories[index];
				}
			}
			for (let index = 0; index < this.fields.field_table_info.length; index++) {
				if (this.state.fieldCategory === this.fields.field_table_info[index].id) {
					tableContents = this.fields.field_table_info[index];
				}
			}
		}

		if (categoryInfo) {
			fieldHeaders.push({ key: "fieldName", label: categoryInfo.field_columns.field_column_info.locLabel });
			valueHeader.push({ key: "values", label: categoryInfo.field_columns.value_column_info.locLabel });
			if (categoryInfo.field_columns.additional_column_info) {
				for (let i = 0; i < categoryInfo.field_columns.additional_column_info.length; i++) {
					sortable.push(categoryInfo.field_columns.additional_column_info[i].id);
					fieldHeaders.push({ key: categoryInfo.field_columns.additional_column_info[i].id, label: categoryInfo.field_columns.additional_column_info[i].locLabel });
				}
			}
		}


		let tableData = [];
		let valuesTableData = [];
		if (tableContents && tableContents.field_value_groups) {
			for (let index = 0; index < tableContents.field_value_groups.length; index++) {
				const field = tableContents.field_value_groups[index];
				const fieldColumns = [];
				if (!this.state.fieldFilterText || this.state.fieldFilterText.length === 0 ||
								(field.id.toLowerCase().indexOf(this.state.fieldFilterText.toLowerCase()) > -1)) {
					fieldColumns.push({ column: "fieldName", content: this.createContentObject(field.id), value: field.id });
					if (field.additional_column_entries) {
						this._makeAdditionalColumnsContent(field, fieldColumns);
					}
					tableData.push({ columns: fieldColumns, rowKey: index });
					if (index === this.state.fieldSelected) {
						valuesTableData = this._makeValuesContent(field, valuesTableData);
					}
				}
			}
		}

		// set the selected row and adjust if the table is sorted.
		let selectedField = this.state.fieldSelected;
		if (this.state.fieldTableSortSpec !== null) {
			tableData = this.sortTableRows(tableData, this.state.fieldTableSortSpec);
			selectedField = tableData.findIndex((row) => row.rowKey === this.state.fieldSelected);
		}

		// set the selected row and adjust if the table is sorted.
		let selectedValue = this.state.valueSelected;
		if (this.state.valuesTableSortSpec !== null) {
			valuesTableData = this.sortTableRows(valuesTableData, this.state.valuesTableSortSpec);
			selectedValue = valuesTableData.findIndex((row) => row.rowKey === this.state.valueSelected);
		}

		return (
			<div className="properties-field-and-values-table-container" >
				{fieldCategory}
				<div className="properties-field-table-container" >
					<FlexibleTable
						columns={fieldHeaders}
						data={tableData}
						sortable={sortable}
						filterable={["fieldName"]}
						onFilter={this.onFieldFilter}
						rows={EXPRESSION_TABLE_ROWS}
						controller={this.props.controller}
						rowSelection={ROW_SELECTION.SINGLE}
						updateRowSelections={this.onFieldTableClick}
						selectedRows={[selectedField]}
						onRowDoubleClick={this.onFieldTableDblClick}
						onSort={this.setSortColumn.bind(this, "fieldTable")}
					/>
				</div>
				<div className="properties-value-table-container" >
					<FlexibleTable
						columns={valueHeader}
						data={valuesTableData}
						sortable={["values"]}
						filterable={["values"]}
						onFilter={this.onValueFilter}
						rows={EXPRESSION_TABLE_ROWS}
						controller={this.props.controller}
						rowSelection={ROW_SELECTION.SINGLE}
						updateRowSelections={this.onValueTableClick}
						selectedRows={[selectedValue]}
						onRowDoubleClick={this.onValueTableDblClick}
						onSort={this.setSortColumn.bind(this, "valuesTable")}
					/>
				</div>
			</div>
		);

	}

	_makeValuesContent(field, valuesTableData) {
		const minLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_MIN_LABEL);
		const maxLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_MAX_LABEL);
		if (field.values) {
			for (let idx = 0; idx < field.values.length; idx++) {
				this._addValueRow(field.values[idx].value, idx, valuesTableData);
			}
		} else if (field.range) {
			if (field.range.min) {
				this._addValueRow(minLabel + ": " + field.range.min.value, 0, valuesTableData);
			}
			if (field.range.max) {
				this._addValueRow(maxLabel + ": " + field.range.max.value, 1, valuesTableData);
			}
		}
		return valuesTableData;
	}

	_addValueRow(content, index, valuesTableData) {
		if (!this.state.valueFilterText || this.state.valueFilterText.length === 0 ||
					(String(content).toLowerCase()
						.indexOf(this.state.valueFilterText.toLowerCase()) > -1)) {
			const valueColumns = [{ column: "values", content: this.createContentObject(content), value: content }];
			valuesTableData.push({ columns: valueColumns, rowKey: index });
		}
	}

	_makeFunctionsContent() {
		if (this.props.functionList) {
			const categories = Object.keys(this.props.functionList);
			const selectCategory = this._makeFunctionDropdown(categories);
			const functionsTable = this._makeFunctionsTable(categories);
			return (
				<div className="properties-expression-function-table-container" >
					{selectCategory}
					{functionsTable}
				</div>
			);
		}
		return (<span>PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS);</span>);
	}

	_makeAdditionalColumnsContent(field, fieldColumns) {
		for (let i = 0; i < field.additional_column_entries.length; i++) {
			fieldColumns.push({ column: field.additional_column_entries[i].id,
				content: this.createContentObject(field.additional_column_entries[i].value), value: field.additional_column_entries[i].value });
		}
	}

	_makeFunctionDropdown(categories) {
		let items = categories.map((val, index) => ({ value: val, label: this.props.functionList[val].locLabel }));
		// Add "Recently Used" category as second category
		const first = items.slice(0, 1);
		const last = items.slice(1);
		items = first.concat({ value: this.recentUseCat, label: this.recentUseCat }, last);
		const label = (this.state.functionCategory === this.recentUseCat) ? this.recentUseCat : this.props.functionList[this.state.functionCategory].locLabel;
		return (
			<div className="properties-expression-function-select">
				<Dropdown
					id={"properties-expression-function-select-dropdown-" + uuid4()}
					light
					label={label}
					items={items}
					onChange={this.onFunctionCatChange}
				/>
			</div>);
	}

	_makeFieldDropdown() {
		const items = [];
		for (let i = 0; i < this.fields.field_categories.length; i++) {
			items.push({ value: this.fields.field_categories[i].id, label: this.fields.field_categories[i].locLabel });
		}
		const first = items.slice(0, 1);
		const last = items.slice(1);
		const newItems = first.concat({ value: this.recentUseCat, label: this.recentUseCat }, last);
		const label = (this.state.fieldCategory === this.recentUseCat) ? this.recentUseCat : items[0].label;
		return (
			<div className="properties-expression-field-select">
				<Dropdown
					id={"properties-expression-field-select-dropdown-" + uuid4()}
					light
					label={label}
					items={newItems}
					onChange={this.onFieldCatChange}
				/>
			</div>);
	}


	_makeFunctionsTable(categories) {
		const headers = [];
		const functionColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FUNCTION_COLUMN);
		const returnColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_RETURN_COLUMN);


		headers.push({ key: "function", label: functionColumn, width: 73 });
		headers.push({ key: "return", label: returnColumn, width: 27 });
		const table = this._buildFunctionTable(this.state.functionCategory);

		let data = table.rows;
		let selectedFunction = this.state.functionSelected;
		if (this.state.functionTableSortSpec !== null) {
			data = this.sortTableRows(data, this.state.functionTableSortSpec);
			selectedFunction = data.findIndex((row) => row.rowKey === this.state.functionSelected);
		}

		return (
			<div className="properties-functions-table-container" >
				<div className="properties-functions-table" >
					<FlexibleTable
						columns={headers}
						data={data}
						sortable={["function", "return"]}
						filterable={["function"]}
						onFilter={this.onFunctionFilter}
						rows={EXPRESSION_TABLE_ROWS}
						controller={this.props.controller}
						rowSelection={ROW_SELECTION.SINGLE}
						updateRowSelections={this.onFunctionTableClick}
						selectedRows={[selectedFunction]}
						onRowDoubleClick={this.onFunctionTableDblClick}
						onSort={this.setSortColumn.bind(this, "functionTable")}
					/>
				</div>
				<div className="properties-help-table-container" >
					{table.helpContainer}
				</div>
			</div>
		);
	}

	_buildFunctionTable(category) {
		const table = { rows: [], helpContainer: (<div />) };
		const categoryFunctions = (category === this.recentUseCat) ? this.props.controller.getExpressionRecentlyUsed() : this.props.functionList[category].functionList;
		if (categoryFunctions) {
			for (let index = 0; index < categoryFunctions.length; index++) {
				const catFunction = categoryFunctions[index];
				const columns = [];
				if (!this.state.functionFilterText || this.state.functionFilterText.length === 0 ||
					(catFunction.locLabel.toLowerCase().indexOf(this.state.functionFilterText.toLowerCase()) > -1)) {
					columns.push({ column: "function", content: this.createContentObject(catFunction.locLabel), value: catFunction.locLabel });
					columns.push({ column: "return", content: this.createContentObject(catFunction.return_type), value: catFunction.return_type });
					table.rows.push({ columns: columns, rowKey: index });
					if (index === this.state.functionSelected) {
						table.helpContainer = (
							<div className="properties-function-help-text" >
								<span className="properties-function-help-command">{catFunction.locLabel}:</span>
								<br />
								<br />
								<span>{catFunction.help}</span>
							</div>
						);
					}
				}
			}
		}
		return table;
	}

	render() {
		const tabContent = [];
		const fieldAndValueTable = this._makeFieldAndValuesContent();
		const functionsTable = this._makeFunctionsContent();
		const fieldsTab = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELD_TAB);
		const functionsTab = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FUNCTIONS_TAB);

		tabContent.push(
			<Tab
				key={0}
				id={"expresson-builder-fields-tab"}
				tabIndex={0}
				label={fieldsTab}
				onClick={this.onTabClick.bind(this, 0)}
			>
				{fieldAndValueTable}
			</Tab>
		);

		tabContent.push(
			<Tab
				key={1}
				id={"expresson-builder-function-tab"}
				tabIndex={1}
				label={functionsTab}
				onClick={this.onTabClick.bind(this, 1)}
			>
				{functionsTable}
			</Tab>
		);


		return (
			<div className="properties-expression-selection-fieldOrFunction" >
				<Tabs key={"tab.1"} className="properties-primaryTabs" selected={this.state.selectedTab}>
					{tabContent}
				</Tabs>
			</div>
		);
	}
}

ExpressionSelectFieldOrFunction.propTypes = {
	controller: PropTypes.object.isRequired,
	onChange: PropTypes.func,
	functionList: PropTypes.array,
	language: PropTypes.string
};
