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

/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import FlexibleTable from "./../flexible-table";
import TruncatedContentTooltip from "./../truncated-content-tooltip";
import PropertiesButtons from "./../properties-buttons";
import * as PropertyUtils from "./../../util/property-utils";

import { Button } from "@carbon/react";

import { MESSAGE_KEYS, DATA_TYPE, SORT_DIRECTION, ROW_SELECTION } from "./../../constants/constants";
import Icon from "./../../../icons/icon.jsx";
import { Reset } from "@carbon/react/icons";

import { has, isEmpty, sortBy, isEqual } from "lodash";

import Tooltip from "./../../../tooltip/tooltip.jsx";

export default class FieldPicker extends React.Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		if (!isEqual(nextProps.fields, prevState.origFields)) {
			let selectedFields = prevState.selectedFields;
			if (nextProps.currentFields) {
				if (!isEqual(Object.keys(nextProps.currentFields), Object.keys(prevState.selectedFields))) {
					selectedFields = nextProps.currentFields;
				}
			}
			return ({ fields: nextProps.fields, selectedFields: selectedFields, origFields: nextProps.fields });
		}
		return ({});
	}
	constructor(props) {
		super(props);
		this.state = {
			fields: this.props.fields, // list of fields dynamically adjusted by filtered or sort criteria
			origFields: this.props.fields,
			filterIcons: [],
			filterText: "",
			selectedFields: this.props.currentFields // list of fields selected
		};
		this.multiSchema = props.controller.getDatasetMetadataSchemas() &&
			props.controller.getDatasetMetadataSchemas().length > 1;
		this.filterList = [];

		this.filterType = this.filterType.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.getVisibleData = this.getVisibleData.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.getNewSelections = this.getNewSelections.bind(this);
		this.onSort = this.onSort.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this.updateFieldSelections = this.updateFieldSelections.bind(this);
		this.filterList = this.getAvailableFilters();
	}

	onFilter(filterString) {
		this.setState({ filterText: filterString });
	}

	/**
	* Reorder the current list of fields displayed according to the sort column
	* @param spec object with a column and direction to sort
	*/
	onSort(spec) {
		let fields = Array.from(this.state.fields);
		fields = sortBy(fields, function(field) {
			switch (spec.column) {
			case "fieldName": return field.origName;
			case "dataType": return field.type;
			case "schemaName": return field.schema;
			default: return null;
			}
		});
		if (spec.direction === SORT_DIRECTION.DESC) {
			fields.reverse();
		}
		this.setState({ fields: fields });
	}

	getAvailableFilters() {
		const filters = [];
		for (const key in DATA_TYPE) {
			if (has(DATA_TYPE, key)) {
				const dataType = DATA_TYPE[key];
				for (const field of this.props.fields) {
					if (dataType === field.type) {
						const filter = {
							"type": field.type
						};
						let duplicate = false;
						for (const filtered of filters) {
							if (filtered.type === filter.type) {
								duplicate = true;
								break;
							}
						}
						if (!duplicate) {
							filters.push(filter);
						}
						break;
					}
				}
			}
		}
		return filters;
	}

	getTableData() {
		const fields = this.getVisibleData();
		const tableData = [];
		const selectedFields = this.state.selectedFields;
		const selectedRowsIndex = [];
		for (let i = 0; i < selectedFields.length; i++) {
			const idx = fields.findIndex((field) => field.name === selectedFields[i]);
			if (idx !== -1) {
				selectedRowsIndex.push(idx);
			}
		}
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			const columns = [];
			let dmIcon = null;
			if (this.props.dmIcon && this.props.dmIcon !== "type") {
				const metadata = this.props.controller.getDatasetMetadataFields();
				const dmIconType = PropertyUtils.getDMFieldIcon(metadata, field.origName, this.props.dmIcon);
				const icon = dmIconType ? <Icon type={dmIconType} /> : null;
				// don't show icon for type since it's already being displayed
				if (icon) {
					dmIcon = (
						<div className="properties-fp-field-type-icon">
							{icon}
						</div>
					);
				}
			}
			const fpFieldName = (
				<span className="properties-fp-field-name">
					{field.origName}
				</span>
			);

			const fieldNameWithTooltip = (
				<TruncatedContentTooltip
					content={fpFieldName}
					tooltipText={field.origName}
					disabled={false}
				/>
			);
			const fieldContent = (
				<div className="properties-fp-field">
					{dmIcon}
					{fieldNameWithTooltip}
				</div>
			);

			columns.push({
				column: "fieldName",
				content: fieldContent,
				fieldName: field.origName,
				value: field.origName
			});
			if (this.multiSchema) {
				const schemaContent = (<div className="properties-fp-schema">
					{field.schema}
				</div>);
				columns.push({ column: "schemaName", content: schemaContent, value: field.schema });
			}
			columns.push({
				column: "dataType",
				content: (<div className="properties-fp-data">
					<div className={"properties-fp-data-type-icon"}>
						<Icon type={field.type} />
					</div>
					<div className="properties-fp-field-type">{field.type}</div>
				</div>),
				value: field.type
			});

			tableData.push({ className: "properties-fp-data-rows", columns: columns });
		}
		this.selectedRowsIndex = selectedRowsIndex;
		return tableData;
	}

	/**
	* Returns list of visible fields from search or filter
	*/
	getVisibleData() {
		const that = this;
		const data = this.state.fields;
		const	filteredData = data.filter(function(row) {
			return that.state.filterIcons.indexOf(row.type) < 0;
		});

		const visibleData = filteredData.filter(function(row) {
			if (typeof that.state.filterText !== "undefined" && that.state.filterText !== null) {
				return row.origName.toLowerCase().indexOf(that.state.filterText.toLowerCase()) > -1;
			}
			return true;
		});

		return visibleData;
	}

	/**
	 * Returns any new columns that were not a part of the original set.
	 */
	getNewSelections() {
		const deltas = [];
		const initialValues = this.props.currentFields;
		if (this.state.selectedFields) {
			for (let i = 0; i < this.state.selectedFields.length; i++) {
				if (typeof initialValues === "undefined" || initialValues === null || initialValues.indexOf(this.state.selectedFields[i]) < 0) {
					deltas.push(i);
				}
			}
		}
		return deltas;
	}

	handleSave() {
		this.props.closeFieldPicker(this.state.selectedFields, this.getNewSelections());
	}

	handleCancel() {
		this.handleReset();
		this.props.closeFieldPicker();
	}

	updateFieldSelections(rowsIndex) {
		const fields = this.getVisibleData();
		const currField = Array.from(this.state.selectedFields);
		// Remove previously selected fields
		let current = currField.filter(function(value, index, arr) {
			const idx = fields.findIndex((field) => field.name === currField[index]);
			return (idx === -1);
		});
		// Add new selections in current
		rowsIndex.forEach((rowIndex) => {
			current.push(fields[rowIndex].name);
		});

		current = Array.from(new Set(current));
		this.setState({
			selectedFields: current
		});
	}

	/**
	* Returns true if field is found in list, else false
	* @param list array of fields to search through
	* @param fieldName field name to find in data
	*/
	isFieldInList(list, fieldName) {
		return list.some(function(field) {
			return field.name === fieldName;
		});
	}

	handleReset() {
		this.setState({
			selectedFields: this.props.currentFields,
			filterIcons: [],
			filterText: "",
		});
	}

	filterType(evt) {
		const type = evt.currentTarget.getAttribute("data-type");
		const iconsSelected = Array.from(this.state.filterIcons);
		const index = iconsSelected.indexOf(type);
		if (index < 0) {
			iconsSelected.push(type);
		} else {
			iconsSelected.splice(index, 1);
		}
		this.setState({ filterIcons: iconsSelected });
	}

	_genBackButton() {
		let applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL);

		if (!this.props.rightFlyout) {
			applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_MODAL_LABEL);
		}

		return (<PropertiesButtons
			okHandler={this.handleSave}
			cancelHandler={this.handleCancel}
			showPropertiesButtons
			applyLabel={applyLabel}
			rejectLabel={rejectLabel}
		/>);
	}

	_genResetButton() {
		const resetLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL);
		const Reset24 = React.forwardRef((props, ref) => <Reset ref={ref} size={24} {...props} />);
		const defaultSelections = this.props.currentFields;
		const selectedFields = this.state.selectedFields;
		const isSelectionEqual = defaultSelections.length === selectedFields.length && defaultSelections.every((field) => selectedFields.indexOf(field) > -1);
		return (
			<Button
				className="properties-fp-reset-button-container"
				disabled={isSelectionEqual}
				onClick={this.handleReset}
				renderIcon={Reset24}
				iconDescription={resetLabel}
				size="sm"
				kind="ghost"
			>
				<span>{resetLabel}</span>
			</Button>
		);
	}

	_genFilterTypes() {
		const that = this;
		const filterLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_FILTER_LABEL);
		const filters = this.filterList.map(function(filter, ind) {
			let enabled = true;
			for (let i = 0; i < that.state.filterIcons.length; i++) {
				if (filter.type === that.state.filterIcons[i]) {
					enabled = false;
					break;
				}
			}
			const filterTooltipId = "tooltip-filters-" + ind;
			const dataTypeLabel = PropertyUtils.formatMessage(that.props.controller.getReactIntl(), MESSAGE_KEYS[`FIELDPICKER_${filter.type.toUpperCase()}_LABEL`]);
			const tooltip = (
				<div className="properties-tooltips">
					{dataTypeLabel}
				</div>
			);
			const row = (
				<li key={"filters" + ind} className="properties-fp-filter-list-li">
					<div className="properties-tooltips-filter">
						<Tooltip
							id={filterTooltipId}
							tip={tooltip}
							direction="bottom"
							className="properties-tooltips icon-tooltip"
							disable={isEmpty(filter.type)}
						>
							<Button
								className="properties-fp-filter"
								data-type={filter.type}
								onClick={that.filterType.bind(that)}
								aria-label={filterLabel + " " + filter.type}
								kind="ghost"
							>
								<Icon type={filter.type} disabled={!enabled} />
							</Button>
						</Tooltip>
					</div>
				</li>
			);
			return (row);
		});
		return (
			<ul className="properties-fp-filter-list">
				<li className="properties-fp-filter-list-title properties-fp-filter-list-li">
					{filterLabel}
				</li>
				{filters}
			</ul>
		);
	}

	_genTable() {

		const fieldColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_FIELDCOLUMN_LABEL);
		// TODO: debug why resource key not used
		const schemaColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SCHEMACOLUMN_LABEL);
		const dataTypeColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_DATATYPECOLUMN_LABEL);
		// TODO get label from resource and make id unique
		const headers = [];
		headers.push({ "key": "fieldName", "label": fieldColumnLabel });
		if (this.multiSchema) {
			headers.push({ "key": "schemaName", "label": schemaColumnLabel });
		}
		headers.push({ "key": "dataType", "label": dataTypeColumnLabel });

		const tableData = this.getTableData();

		return (
			<FlexibleTable className="properties-fp-table"
				enableTanstackTable={this.props.controller.getPropertiesConfig().enableTanstackTable === true}
				sortable={["fieldName", "schemaName", "dataType"]}
				filterable={["fieldName"]}
				onFilter={this.onFilter}
				columns={headers}
				data={tableData}
				onSort={this.onSort}
				filterKeyword={this.state.filterText}
				scrollKey="field-picker"
				noAutoSize
				tableLabel={this.props.title ? this.props.title : ""}
				selectedRows={this.selectedRowsIndex}
				updateRowSelections={this.updateFieldSelections}
				rowSelection={ROW_SELECTION.MULTIPLE}
				light={this.props.controller.getLight() && !this.props.controller.isTearsheetContainer()}
			/>
		);
	}

	render() {
		const backButton = this._genBackButton();
		const resetButton = this._genResetButton();
		const filterTypes = this._genFilterTypes();
		const table = this._genTable();

		return (<React.Fragment>
			<div className="properties-fp-top-row">
				{filterTypes}
				{resetButton}
			</div>
			{table}
			{backButton}
		</React.Fragment>);
	}
}

FieldPicker.propTypes = {
	closeFieldPicker: PropTypes.func.isRequired,
	currentFields: PropTypes.array.isRequired,
	fields: PropTypes.array, // in current data model
	title: PropTypes.string,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
	dmIcon: PropTypes.string
};
