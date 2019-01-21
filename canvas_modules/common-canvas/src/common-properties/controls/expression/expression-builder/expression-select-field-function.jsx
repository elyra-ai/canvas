/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Dropdown from "carbon-components-react/lib/components/DropdownV2";
import Tabs from "carbon-components-react/lib/components/Tabs";
import Tab from "carbon-components-react/lib/components/Tab";
import FlexibleTable from "./../../../components/flexible-table/flexible-table.jsx";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, EXPRESSION_TABLE_ROWS } from "./../../../constants/constants";
import PropertyUtils from "./../../../util/property-utils";

export default class ExpressionSelectFieldOrFunction extends React.Component {

	constructor(props) {
		super(props);
		this.inCategories = Object.keys(props.functionList);
		this.fields = this._makeDatasetFields(props.controller.getDatasetMetadataFields(), props.controller.getExpressionInfo().fields);
		this.state = {
			fieldSelectedRow: 0,
			valueSelectedRow: 0,
			functionSelectedRow: 0,
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
		this.recentUseCat = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_RECENTLY_USED, MESSAGE_KEYS_DEFAULTS.EXPRESSION_RECENTLY_USED);
		this.language = props.language;
	}

	onTabClick(tabidx, evt) {
		this.setState({
			selectedTab: tabidx
		});
	}

	onFunctionCatChange(evt) {
		this.setState({
			functionCategory: evt.selectedItem.value,
			functionSelectedRow: 0
		});
	}

	onFieldCatChange(evt) {
		var currentData = [];
		for (let index = 0; index < this.fields.field_table_info.length; index++) {
			if (evt.selectedItem.value === this.fields.field_table_info[index].id) {
				currentData = this.fields.field_table_info[index].field_value_groups;
			}
		}
		this.setState({
			fieldCategory: evt.selectedItem.value,
			fieldSelectedRow: 0,
			currentFieldDataset: currentData
		});
	}

	onFieldTableClick(row, evt) {
		this.setState({
			fieldSelectedRow: row,
			valueSelectedRow: 0
		});
	}

	onFieldTableDblClick(row, evt) {
		if (this.props.onChange) {
			let quote = "";
			if (this.language === "CLEM") {
				quote = "'";
			}
			if (this.state.fieldCategory === "globals") {
				quote = "";
			}
			const field = this.state.currentFieldDataset[row].id;
			this.props.onChange(quote + field + quote);
		}
	}

	onFieldFilter(filterString) {
		this.setState({ fieldFilterText: filterString });
	}

	onValueTableClick(row, evt) {
		this.setState({
			valueSelectedRow: row
		});
	}

	onValueTableDblClick(row, evt) {
		if (this.props.onChange) {
			const field = this.state.currentFieldDataset[this.state.fieldSelectedRow];
			if (field.values) {
				const quote = "\"";
				const value = field.values[row].value;
				const fieldValue = (typeof value === "string") ? quote + value + quote : value;
				this.props.onChange(fieldValue);
			} else if (field.range) {
				this.props.onChange(row === 0 ? field.range.min.value : field.range.max.value);
			}
		}
		this.setState({
			valueSelectedRow: row
		});
	}

	onValueFilter(filterString) {
		this.setState({ valueFilterText: filterString });
	}

	onFunctionTableClick(row, evt) {
		this.setState({
			functionSelectedRow: row
		});
	}

	onFunctionTableDblClick(row, evt) {
		let value;
		if (this.state.functionCategory === this.recentUseCat) {
			const recentlyUsedList = this.props.controller.getExpressionRecentlyUsed();
			value = recentlyUsedList[row].value;
		} else {
			const rowSelected = this.props.functionList[this.state.functionCategory].functionList[row];
			this.props.controller.updateExpressionRecentlyUsed(rowSelected);
			value = rowSelected.value;
		}
		if (this.props.onChange) {
			this.props.onChange(value);
		}
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
			MESSAGE_KEYS.EXPRESSION_FIELD_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FIELD_COLUMN);
		const storageColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_STORAGE_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_STORAGE_COLUMN);
		const valueColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_VALUE_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_VALUE_COLUMN);
		const dropdownLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELDS_DROPDOWN_TITLE, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FIELDS_DROPDOWN_TITLE);

		var datasetCategories = {
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

		var datasetTableInfo = {
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
			datasetTableInfo.field_value_groups.push(entry);
		});
		fieldDataset.field_categories.unshift(datasetCategories);
		fieldDataset.field_table_info.unshift(datasetTableInfo);
		return fieldDataset;
	}


	_makeFieldAndValuesContent() {
		// Make field and value tables headers.
		const fieldCategory = this._makeFieldDropdown();
		const fieldHeaders = [];
		const valueHeader = [];
		const sortable = ["fieldName"];

		var tableContents = null;
		// get the table contents
		for (let index = 0; index < this.fields.field_table_info.length; index++) {
			if (this.state.fieldCategory === this.fields.field_table_info[index].id) {
				tableContents = this.fields.field_table_info[index];
			}
		}
		// get column metadata
		var categoryInfo = null;
		for (let index = 0; index < this.fields.field_categories.length; index++) {
			if (this.state.fieldCategory === this.fields.field_categories[index].id) {
				categoryInfo = this.fields.field_categories[index];
			}
		}

		fieldHeaders.push({ key: "fieldName", label: categoryInfo.field_columns.field_column_info.locLabel });
		valueHeader.push({ key: "values", label: categoryInfo.field_columns.value_column_info.locLabel });
		if (categoryInfo.field_columns.additional_column_info) {
			for (let i = 0; i < categoryInfo.field_columns.additional_column_info.length; i++) {
				sortable.push(categoryInfo.field_columns.additional_column_info[i].id);
				fieldHeaders.push({ key: categoryInfo.field_columns.additional_column_info[i].id, label: categoryInfo.field_columns.additional_column_info[i].locLabel });
			}
		}
		const tableData = [];
		let valuesTableData = [];
		if (tableContents && tableContents.field_value_groups) {
			for (let index = 0; index < tableContents.field_value_groups.length; index++) {
				const field = tableContents.field_value_groups[index];
				const fieldColumns = [];
				const rowClass = (index === this.state.fieldSelectedRow)
					? "table-row table-selected-row"
					: "table-row";
				if (!this.state.fieldFilterText || this.state.fieldFilterText.length === 0 ||
								(field.id.toLowerCase().indexOf(this.state.fieldFilterText.toLowerCase()) > -1)) {
					fieldColumns.push({ column: "fieldName", content: this.createContentObject(field.id), value: field.id });
					if (field.additional_column_entries) {
						this._makeAdditionalColumnsContent(field, fieldColumns);
					}
					tableData.push({ className: rowClass, columns: fieldColumns,
						onClickCallback: this.onFieldTableClick.bind(this, index), onDblClickCallback: this.onFieldTableDblClick.bind(this, index) });
					if (index === this.state.fieldSelectedRow) {
						valuesTableData = this._makeValuesContent(field, valuesTableData);
					}
				}
			}
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
					/>
				</div>
			</div>
		);

	}

	_makeValuesContent(field, valuesTableData) {
		const minLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_MIN_LABEL, MESSAGE_KEYS_DEFAULTS.EXPRESSION_MIN_LABEL);
		const maxLabel = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_MAX_LABEL, MESSAGE_KEYS_DEFAULTS.EXPRESSION_MAX_LABEL);
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
		const valueRowClass = (this.state.valueSelectedRow === index)
			? "table-row table-selected-row"
			: "table-row";
		if (!this.state.valueFilterText || this.state.valueFilterText.length === 0 ||
					(String(content).toLowerCase()
						.indexOf(this.state.valueFilterText.toLowerCase()) > -1)) {
			const valueColumns = [{ column: "values", content: this.createContentObject(content), value: content }];
			valuesTableData.push({ className: valueRowClass, columns: valueColumns,
				onClickCallback: this.onValueTableClick.bind(this, index), onDblClickCallback: this.onValueTableDblClick.bind(this, index) });
		}
	}

	_makeFunctionsContent() {
		if (this.props.functionList) {
			const categories = Object.keys(this.props.functionList);
			const selectCategory = this._makeSelect(categories);
			const functionsTable = this._makeFunctionsTable(categories);
			return (
				<div className="properties-expression-function-table-container" >
					{selectCategory}
					{functionsTable}
				</div>
			);
		}
		return (<span>PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS, MESSAGE_KEYS_DEFAULTS.EXPRESSION_NO_FUNCTIONS);</span>);
	}

	_makeAdditionalColumnsContent(field, fieldColumns) {
		for (let i = 0; i < field.additional_column_entries.length; i++) {
			fieldColumns.push({ column: field.additional_column_entries[i].id,
				content: this.createContentObject(field.additional_column_entries[i].value), value: field.additional_column_entries[i].value });
		}
	}

	_makeSelect(categories) {
		let items = categories.map((val, index) => ({ value: val, label: this.props.functionList[val].locLabel }));
		// Add "Recently Used" category as second category
		const first = items.slice(0, 1);
		const last = items.slice(1);
		items = first.concat({ value: this.recentUseCat, label: this.recentUseCat }, last);
		const label = (this.state.functionCategory === this.recentUseCat) ? this.recentUseCat : this.props.functionList[this.state.functionCategory].locLabel;
		return (
			<div className="properties-expression-function-select">
				<Dropdown
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
		return (
			<div className="properties-expression-field-select">
				<Dropdown
					light
					label={items[0].label}
					items={items}
					onChange={this.onFieldCatChange}
				/>
			</div>);
	}

	_makeFunctionsTable(categories) {
		const headers = [];
		const functionColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FUNCTION_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FUNCTION_COLUMN);
		const returnColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_RETURN_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_RETURN_COLUMN);


		headers.push({ key: "function", label: functionColumn, width: 73 });
		headers.push({ key: "return", label: returnColumn, width: 27 });
		const table = this._buildFunctionTable(this.state.functionCategory);
		return (
			<div className="properties-functions-table-container" >
				<div className="properties-functions-table" >
					<FlexibleTable
						columns={headers}
						data={table.rows}
						rows={EXPRESSION_TABLE_ROWS}
						controller={this.props.controller}
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
				const rowClass = (index === this.state.functionSelectedRow)
					? "table-row table-selected-row"
					: "table-row";

				columns.push({ column: "function", content: this.createContentObject(catFunction.locLabel) });
				columns.push({ column: "return", content: this.createContentObject(catFunction.return_type) });
				table.rows.push({ className: rowClass, columns: columns,
					onClickCallback: this.onFunctionTableClick.bind(this, index), onDblClickCallback: this.onFunctionTableDblClick.bind(this, index) });
				if (index === this.state.functionSelectedRow) {
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
		return table;
	}

	render() {
		const tabContent = [];
		const fieldAndValueTable = this._makeFieldAndValuesContent();
		const functionsTable = this._makeFunctionsContent();
		const fieldsTab = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELD_TAB, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FIELD_TAB);
		const functionsTab = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FUNCTIONS_TAB, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FUNCTIONS_TAB);

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
