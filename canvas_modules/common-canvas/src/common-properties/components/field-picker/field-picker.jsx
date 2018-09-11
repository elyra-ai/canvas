/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import FlexibleTable from "./../flexible-table";
import PropertiesButtons from "./../properties-buttons";
import PropertyUtils from "./../../util/property-utils";

import Button from "carbon-components-react/lib/components/Button";
import Checkbox from "carbon-components-react/lib/components/Checkbox";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, DATA_TYPES, TOOL_TIP_DELAY, FP_CHECKBOX_WIDTH } from "./../../constants/constants";
import Icon from "./../../../icons/icon.jsx";

import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import isEqual from "lodash/isEqual";

import Tooltip from "./../../../tooltip/tooltip.jsx";

import uuid4 from "uuid/v4";

export default class FieldPicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			fields: this.props.fields, // list of fields dynamically adjusted by filtered or sort criteria
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
	}

	componentWillMount() {
		this.filterList = this.getAvailableFilters();
	}

	componentWillReceiveProps(newProps) {
		let fields = this.state.fields;
		let selectedFields = this.state.selectedFields;
		if (newProps.fields) {
			if (!isEqual(Object.keys(newProps.fields), Object.keys(this.state.fields))) {
				fields = newProps.fields;
			}
		}
		if (newProps.currentFields) {
			if (!isEqual(Object.keys(newProps.currentFields), Object.keys(this.state.selectedFields))) {
				selectedFields = newProps.currentFields;
			}
		}
		this.setState({ fields: fields, selectedFields: selectedFields });
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
		if (spec.direction > 0) {
			fields = fields.reverse();
		}
		this.setState({ fields: fields });
	}

	getAvailableFilters() {
		const filters = [];
		const filterList = DATA_TYPES;
		for (let i = 0; i < filterList.length; i++) {
			for (let j = 0; j < this.props.fields.length; j++) {
				const field = this.props.fields[j];
				if (filterList[i] === field.type) {
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
		return filters;
	}

	getTableData(checkedAll) {
		const fields = this.getVisibleData();
		const tableData = [];
		const selectedFields = this.state.selectedFields;
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			let checked = false;

			if (checkedAll) {
				checked = true;
			} else if (selectedFields) {
				for (let j = 0; j < selectedFields.length; j++) {
					const key = selectedFields[j];
					if (key === field.name) {
						checked = true;
						break;
					}
				}
			}
			// TODO need to make checkbox Id unique
			const columns = [];
			columns.push({
				column: "checkbox",
				width: FP_CHECKBOX_WIDTH,
				content: (<div className="properties-fp-checkbox">
					<Checkbox id={"properties-fp-checkbox-" + i}
						checked={checked}
						onChange={this.handleFieldChecked.bind(this, field.name)}
						data-name={field.name}
						data-type={field.type}
						hideLabel
						labelText={field.name}
					/></div>)
			});
			columns.push({ column: "fieldName", content: field.origName });
			if (this.multiSchema) {
				columns.push({ column: "schemaName", content: field.schema });
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
				return row.name.toLowerCase().indexOf(that.state.filterText.toLowerCase()) > -1;
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

	handleCheckAll(checked) {
		let selectAll = [];
		const selectedFields = this.state.selectedFields;
		const visibleData = this.getVisibleData();

		if (checked) {
			selectAll = Array.from(this.state.selectedFields);
			for (const field of visibleData) {
				selectAll.push(field.name);
			}
			selectAll = Array.from(new Set(selectAll));
		} else if (selectedFields) {
			for (const selectedValue of selectedFields) {
				// if selectedValue is already checked, don't re-check it
				if (!this.isFieldInList(visibleData, selectedValue)) {
					selectAll.push(selectedValue);
				}
			}
		}

		this.setState({
			selectedFields: selectAll,
			checkedAll: checked
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

	handleFieldChecked(fieldName, checked) {
		const current = this.state.selectedFields;

		if (checked) {
			this.setState({ selectedFields: current.concat(fieldName) });
		} else if (current) {
			const modified = current.filter(function(element) {
				return element !== fieldName;
			});

			this.setState({
				selectedFields: modified,
				checkedAll: false
			});
		}
	}

	handleReset() {
		let checkedAll = false;
		if (this.props.currentFields && (this.props.currentFields === this.state.fields.length)) {
			checkedAll = true;
		}
		this.setState({
			selectedFields: this.props.currentFields,
			filterIcons: [],
			filterText: "",
			checkedAll: checkedAll
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
			const applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
			const rejectLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);

			return (<PropertiesButtons
				okHandler={this.handleSave}
				cancelHandler={this.handleCancel}
				showPropertiesButtons
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
			/>);
		}

		const saveTooltip = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SAVEBUTTON_TOOLTIP);
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
							icon="arrow--left"
							type="button"
							small
							kind="secondary"
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
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_LABEL);
		const resetTooltip = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_TOOLTIP);
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
					<button type="button"
						className="properties-fp-reset-button-container"
						onClick={this.handleReset}
						onMouseEnter={this.mouseEnterResetButton}
						onMouseLeave={this.mouseLeaveResetButton}
					>
						<div className="properties-fp-reset-button label">{resetLabel}</div>
						<div className="properties-fp-reset-button icon">
							<Icon type="reset" />
						</div>
					</button>
				</Tooltip>
			</div>);
	}

	_genFilterTypes() {
		const that = this;
		const filterLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_FILTER_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_FILTER_LABEL);
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
				<div key={"filters" + ind}>
					<div className="properties-tooltips-filter">
						<Tooltip
							id={filterTooltipId}
							tip={tooltip}
							direction="top"
							delay={TOOL_TIP_DELAY}
							className="properties-tooltips"
							disable={isEmpty(filter.type)}
						>
							<button type="button" className="properties-fp-filter-list-li properties-fp-filter"
								data-type={filter.type}
								onClick={that.filterType.bind(that)}
								aria-label={filterLabel + " " + filter.type}
							>
								<Icon type={filter.type} disabled={!enabled} />
							</button>
						</Tooltip>
					</div>
				</div>
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
		let checkedAll = this.state.checkedAll;
		// check all box should be checked if all in view is selected
		const visibleData = this.getVisibleData();
		const selectedFields = this.state.selectedFields;
		// need to always compare contents to make sure the visible ones are selected
		// because selectedFields may contain invalid fields
		const sameData = selectedFields.filter(function(row) {
			let match = false;
			for (let k = 0; k < visibleData.length; k++) {
				if (row === visibleData[k].name) {
					match = true;
					break;
				}
			}
			return match;
		});
		checkedAll = sameData.length === visibleData.length;

		const fieldColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_FIELDCOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_FIELDCOLUMN_LABEL);
		// TODO: debug why resource key not used
		const schemaColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_SCHEMACOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SCHEMACOLUMN_LABEL);
		const dataTypeColumnLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.FIELDPICKER_DATATYPECOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_DATATYPECOLUMN_LABEL);
		// TODO get label from resource and make id unique
		const headers = [];
		headers.push({ "key": "checkbox", "label": <div className="properties-fp-checkbox">
			<Checkbox id={"properties-fp-checkbox-all"}
				onChange={this.handleCheckAll.bind(this)}
				checked={checkedAll}
				hideLabel
				labelText="Check all fields"
			/>
		</div>, "width": FP_CHECKBOX_WIDTH });
		headers.push({ "key": "fieldName", "label": fieldColumnLabel });
		if (this.multiSchema) {
			headers.push({ "key": "schemaName", "label": schemaColumnLabel });
		}
		headers.push({ "key": "dataType", "label": dataTypeColumnLabel });

		const tableData = this.getTableData(checkedAll);

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
				noAutoSize
				controller={this.props.controller}
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
	fields: PropTypes.array,
	title: PropTypes.string,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
};
