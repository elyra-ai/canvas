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

/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import FlexibleTable from "./../flexible-table";
import PropertiesButtons from "./../properties-buttons";
import PropertyUtils from "./../../util/property-utils";

import { Button } from "carbon-components-react";

import { MESSAGE_KEYS, DATA_TYPE, TOOL_TIP_DELAY, SORT_DIRECTION, ROW_SELECTION } from "./../../constants/constants";
import Icon from "./../../../icons/icon.jsx";
import { ArrowLeft24, Reset24 } from "@carbon/icons-react";

import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import isEqual from "lodash/isEqual";
import has from "lodash/has";

import Tooltip from "./../../../tooltip/tooltip.jsx";

import uuid4 from "uuid/v4";

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
			let fieldContent = (
				<div className="properties-fp-field">
					<div className="properties-fp-field-name">
						{field.origName}
					</div>
				</div>
			);
			if (this.props.dmIcon) {
				const metadata = this.props.controller.getDatasetMetadataFields();
				const dmIconType = PropertyUtils.getDMFieldIcon(metadata,
					field.origName, this.props.dmIcon);
				const dmIcon = dmIconType ? <Icon type={dmIconType} /> : null;
				fieldContent = (
					<div className="properties-fp-field">
						<div className="properties-fp-field-type-icon">
							{dmIcon}
						</div>
						<div className="properties-fp-field-name">
							{field.origName}
						</div>
					</div>
				);
			}
			columns.push({
				column: "fieldName",
				content: fieldContent,
				fieldName: field.origName
			});
			if (this.multiSchema) {
				const schemaContent = (<div className="properties-fp-schema">
					{field.schema}
				</div>);
				columns.push({ column: "schemaName", content: schemaContent });
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
		let current = currField.filter(function(value, index, arr) {
			const idx = fields.findIndex((field) => field.name === currField[index]);
			return (idx === -1 || rowsIndex.includes(idx));
		});
		for (let i = 0; i < rowsIndex.length; i++) {
			const field = fields[rowsIndex[i]];
			if (field && !current.includes(field)) {
				const fieldName = field.name;
				current.push(fieldName);
			}
		}
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
		if (this.props.rightFlyout) {
			const applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL);
			const rejectLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL);

			return (<PropertiesButtons
				okHandler={this.handleSave}
				cancelHandler={this.handleCancel}
				showPropertiesButtons
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
			/>);
		}

		const saveTooltip = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_TOOLTIP);
		const tooltipId = uuid4() + "-tooltip-fp";
		const tooltip = (
			<div className="properties-tooltips">
				{saveTooltip}
			</div>
		);

		return (
			<div>
				<Tooltip
					id={tooltipId}
					tip={tooltip}
					direction="left"
					delay={TOOL_TIP_DELAY}
					className="properties-tooltips"
				>
					<div>
						<Button
							className="properties-fp-back-button"
							renderIcon={ArrowLeft24}
							iconDescription={this.props.title}
							size="small"
							kind="primary"
							onClick={this.handleSave}
						/>
						<label className="properties-fp-button-label">{this.props.title}</label>
					</div>
				</Tooltip>
			</div>
		);
	}

	_genResetButton() {
		const resetLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL);
		const resetTooltip = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_TOOLTIP);
		const tooltipId = uuid4() + "-tooltip-fp";
		const tooltip = (
			<div className="properties-tooltips">
				{resetTooltip}
			</div>
		);
		return (
			<div className="properties-tooltips-fp-reset">
				<Tooltip
					id={tooltipId}
					tip={tooltip}
					direction="top"
					delay={TOOL_TIP_DELAY}
					className="properties-tooltips"
				>
					<Button
						className="properties-fp-reset-button-container"
						onClick={this.handleReset}
						renderIcon={Reset24}
						iconDescription={resetLabel}
						size="small"
						kind="ghost"
					>
						<span>{resetLabel}</span>
					</Button>
				</Tooltip>
			</div>);
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
			const filterTooltipId = uuid4() + "-tooltip-filters-" + ind;
			const tooltip = (
				<div className="properties-tooltips">
					{filter.type}
				</div>
			);
			const row = (
				<li key={"filters" + ind} className="properties-fp-filter-list-li">
					<div className="properties-tooltips-filter">
						<Tooltip
							id={filterTooltipId}
							tip={tooltip}
							direction="top"
							delay={TOOL_TIP_DELAY}
							className="properties-tooltips"
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
				sortable={["fieldName", "schemaName", "dataType"]}
				filterable={["fieldName"]}
				onFilter={this.onFilter}
				columns={headers}
				data={tableData}
				onSort={this.onSort}
				filterKeyword={this.state.filterText}
				scrollKey="field-picker"
				rows={-1}
				controller={this.props.controller}
				selectedRows={this.selectedRowsIndex}
				updateRowSelections={this.updateFieldSelections}
				rowSelection={ROW_SELECTION.MULTIPLE}
			/>
		);
	}

	render() {
		const backButton = this._genBackButton();
		const resetButton = this._genResetButton();
		const filterTypes = this._genFilterTypes();
		const table = this._genTable();

		if (this.props.rightFlyout) {
			return (<div>
				<div className="properties-fp-top-row">
					{filterTypes}
					{resetButton}
				</div>
				{table}
				{backButton}
			</div>);
		}

		return (<div>
			<div className="properties-fp-top-row">
				{backButton}
				{resetButton}
			</div>
			{filterTypes}
			{table}
		</div>);
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
