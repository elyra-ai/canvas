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
		this.state = {
			fieldSelectedRow: 0,
			valueSelectedRow: 0,
			functionSelectedRow: 0,
			functionCategory: this.inCategories[0] // set the initial function category to the first one in the list.
		};
		this.selectedTab = 0;
		this.reactIntl = props.controller.getReactIntl();
		this.datasetFields = props.controller.getDatasetMetadataFields();
		this.onFunctionCatChange = this.onFunctionCatChange.bind(this);
		this.onFieldFilter = this.onFieldFilter.bind(this);
		this.onValueFilter = this.onValueFilter.bind(this);
		this.recentUseCat = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_RECENTLY_USED, MESSAGE_KEYS_DEFAULTS.EXPRESSION_RECENTLY_USED);

	}

	onTabClick(tabidx, evt) {
		this.selectedTab = tabidx;
	}

	onFunctionCatChange(evt) {
		this.setState({
			functionCategory: evt.selectedItem.value,
			functionSelectedRow: 0
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
			this.props.onChange(this.datasetFields[row].name);
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
			const field = this.datasetFields[this.state.fieldSelectedRow];
			if (field.metadata.values) {
				this.props.onChange(field.metadata.values[row]);
			} else if (field.metadata.range) {
				this.props.onChange(row === 0 ? field.metadata.range.min : field.metadata.range.max);
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

	_makeFieldAndValuesContent() {
		// Make field and value tables headers.
		const fieldHeaders = [];
		const fieldColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELD_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FIELD_COLUMN);
		const storageColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_STORAGE_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_STORAGE_COLUMN);
		const valueColumn = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_VALUE_COLUMN, MESSAGE_KEYS_DEFAULTS.EXPRESSION_VALUE_COLUMN);


		fieldHeaders.push({ key: "fieldName", label: fieldColumn });
		fieldHeaders.push({ key: "storage", label: storageColumn });
		const valueHeader = [{ key: "values", label: valueColumn }];

		// go through the data set and make the fields and the values tables.
		const fieldTableData = [];
		let valuesTableData = [];
		for (let index = 0; index < this.datasetFields.length; index++) {
			const field = this.datasetFields[index];
			const fieldColumns = [];
			const rowClass = (index === this.state.fieldSelectedRow)
				? "table-row table-selected-row"
				: "table-row";
			// only include rows that meet the filter tex
			if (!this.state.fieldFilterText || this.state.fieldFilterText.length === 0 ||
					(field.name.toLowerCase().indexOf(this.state.fieldFilterText.toLowerCase()) > -1)) {
				fieldColumns.push({ column: "fieldName", content: this.createContentObject(field.name), value: field.name });
				fieldColumns.push({ column: "storage", content: this.createContentObject(field.type), value: field.type });
				fieldTableData.push({ className: rowClass, columns: fieldColumns,
					onClickCallback: this.onFieldTableClick.bind(this, index), onDblClickCallback: this.onFieldTableDblClick.bind(this, index) });
				// Make the content of the values table the values of the field selected.
				if (index === this.state.fieldSelectedRow) {
					valuesTableData = this._makeValuesContent(field, valuesTableData);
				}
			}
		}
		const fieldsTitle = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_FIELDS_TITLE, MESSAGE_KEYS_DEFAULTS.EXPRESSION_FIELDS_TITLE);
		const valuesTitle = PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_VALUES_TITLE, MESSAGE_KEYS_DEFAULTS.EXPRESSION_VALUES_TITLE);

		return (
			<div className="properties-field-and-values-table-container" >
				<div className="properties-field-table-container" >
					<div className="properties-field-table-title" >
						<span>{fieldsTitle}</span>
					</div>
					<FlexibleTable
						columns={fieldHeaders}
						data={fieldTableData}
						sortable={["fieldName", "storage"]}
						filterable={["fieldName"]}
						onFilter={this.onFieldFilter}
						rows={EXPRESSION_TABLE_ROWS}
						controller={this.props.controller}
					/>
				</div>
				<div className="properties-value-table-container" >
					<div className="properties-field-table-title" >
						<span>{valuesTitle}</span>
					</div>
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

		if (field.metadata.values) {
			for (let idx = 0; idx < field.metadata.values.length; idx++) {
				this._addValueRow(field.metadata.values[idx], idx, valuesTableData);
			}
		} else if (field.metadata.range) {
			if (field.metadata.range.min) {
				this._addValueRow(minLabel + ": " + field.metadata.range.min, 0, valuesTableData);
			}
			if (field.metadata.range.max) {
				this._addValueRow(maxLabel + ": " + field.metadata.range.max, 1, valuesTableData);
			}
		}
		return valuesTableData;
	}

	_addValueRow(content, index, valuesTableData) {
		const valueRowClass = (this.state.valueSelectedRow === index)
			? "table-row table-selected-row"
			: "table-row";
		if (!this.state.valueFilterText || this.state.valueFilterText.length === 0 ||
					(content.toLowerCase().indexOf(this.state.valueFilterText.toLowerCase()) > -1)) {
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
					<br />
					{selectCategory}
					{functionsTable}
				</div>
			);
		}
		return (<span>PropertyUtils.formatMessage(this.reactIntl,
			MESSAGE_KEYS.EXPRESSION_NO_FUNCTIONS, MESSAGE_KEYS_DEFAULTS.EXPRESSION_NO_FUNCTIONS);</span>);
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
				<Tabs key={"tab.1"} className="properties-primaryTabs" selected={this.selectedTab}>
					{tabContent}
				</Tabs>
			</div>
		);
	}
}

ExpressionSelectFieldOrFunction.propTypes = {
	controller: PropTypes.object.isRequired,
	onChange: PropTypes.func,
	functionList: PropTypes.array
};
