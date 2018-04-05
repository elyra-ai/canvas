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
import FlexibleTable from "./../../editor-controls/flexible-table.jsx";
import PropertiesButtons from "./../properties-buttons";
import PropertyUtils from "./../../util/property-utils";

import { Tr, Td } from "reactable";
import Button from "ap-components-react/dist/components/Button";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import { injectIntl, intlShape } from "react-intl";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS, DATA_TYPES, TOOL_TIP_DELAY } from "./../../constants/constants";
import Icon from "./../../../icons/icon.jsx";

import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";

import Tooltip from "./../../../tooltip/tooltip.jsx";

import uuid4 from "uuid/v4";

class FieldPicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			fields: this.props.fields, // list of fields dynamically adjusted by filtered or sort criteria
			filterIcons: [],
			filterText: "",
			selectedFields: this.props.currentFields, // list of fields selected
			headerWidth: 756
		};
		this.multiSchema = props.controller.getDatasetMetadataSchemas() &&
			props.controller.getDatasetMetadataSchemas().length > 1;
		this.filterList = [];

		this.updateDimensions = this.updateDimensions.bind(this);
		this.filterType = this.filterType.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.getVisibleData = this.getVisibleData.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleCheckAll = this.handleCheckAll.bind(this);
		this.handleFieldChecked = this.handleFieldChecked.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.getNewSelections = this.getNewSelections.bind(this);
		this.onSort = this.onSort.bind(this);
		this.onFilter = this.onFilter.bind(this);
	}

	componentWillMount() {
		this.filterList = this.getAvailableFilters();
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
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

	getTableData(checkboxWidth, fieldWidth, dataWidth) {
		const fields = this.getVisibleData();
		const tableData = [];
		const selectedFields = this.state.selectedFields;
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			let checked = false;

			if (this.state.checkedAll) {
				checked = true;
			} else if (selectedFields) {
				for (let j = 0; j < selectedFields.length; j++) {
					const key = selectedFields[j];
					// control values can be prefix by schema but don't have to be
					if (key === field.name || key === field.schema + "." + field.origName) {
						checked = true;
						break;
					}
				}
			}

			const columns = [];
			columns.push(<Td key="field-picker-column-checkbox" column="checkbox" style={{ "width": checkboxWidth }}><div className="field-picker-checkbox">
				<Checkbox id={"field-picker-checkbox-" + i}
					checked={checked}
					onChange={this.handleFieldChecked}
					data-name={field.name}
					data-type={field.type}
				/></div></Td>);
			columns.push(<Td key="field-picker-column-fieldname" column="fieldName" style={{ "width": fieldWidth }}>{field.origName}</Td>);

			if (this.multiSchema) {
				columns.push(<Td key="field-picker-column-schemaname" column="schemaName" style={{ "width": fieldWidth }}>{field.schema}</Td>);
			}
			columns.push(<Td key="field-picker-column-datatype" column="dataType" style={{ "width": dataWidth }}><div className="field-picker-data">
				<div className={"field-picker-data-type-icon"}>
					<Icon type={field.type} />
				</div>
				<div className="field-type">{field.type}</div>
			</div></Td>);

			tableData.push(<Tr key="field-picker-data-rows" className="field-picker-data-rows">{columns}</Tr>);
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
			return row.name.toLowerCase().indexOf(that.state.filterText.toLowerCase()) > -1;
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

	updateDimensions() {
		// This is needed for field-picker in modal dialogs. This can be removed in issue #1038
		const table = document.getElementById("flexible-table-container-wrapper");
		if (table !== null) {
			const tableRect = table.getBoundingClientRect();
			if (this.state.headerWidth !== tableRect.width) {
				this.setState({ headerWidth: tableRect.width });
			}
		}
	}

	handleSave() {
		this.props.closeFieldPicker(this.state.selectedFields, this.getNewSelections());
	}

	handleCancel() {
		this.handleReset();
		this.props.closeFieldPicker();
	}

	handleCheckAll(evt) {
		let selectAll = [];
		const selectedFields = this.state.selectedFields;
		const visibleData = this.getVisibleData();

		if (evt.target.checked) {
			selectAll = Array.from(this.state.selectedFields);
			for (const field of visibleData) {
				selectAll.push(field.name);
			}
			selectAll = Array.from(new Set(selectAll));
		} else if (selectedFields) {
			for (const selectedValue of selectedFields) {
				const duplicate = visibleData.some(function(field) {
					return field.name === selectedValue;
				});
				if (!duplicate) {
					selectAll.push(selectedValue);
				}
			}
		}

		this.setState({
			selectedFields: selectAll,
			checkedAll: selectAll.length === this.state.fields.length
		});
	}

	handleFieldChecked(evt) {
		const current = this.state.selectedFields;
		const selectedFieldName = evt.currentTarget.getAttribute("data-name");

		if (evt.target.checked) {
			this.setState({ selectedFields: current.concat(selectedFieldName) });
		} else if (current) {
			const modified = current.filter(function(element) {
				return element !== selectedFieldName;
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
			const applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
			const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);

			return (<PropertiesButtons
				okHandler={this.handleSave}
				cancelHandler={this.handleCancel}
				showPropertiesButtons
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
			/>);
		}

		const saveTooltip = PropertyUtils.formatMessage(this.props.intl,
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
							id="field-picker-back-button"
							back icon="back"
							onClick={this.handleSave}
						/>
						<label className="control-label">{this.props.title}</label>
					</div>
				</Tooltip>
			</div>
		);
	}

	_genResetButton() {
		const resetLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_LABEL);
		const resetTooltip = PropertyUtils.formatMessage(this.props.intl,
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
					<div id="reset-fields-button"
						className="button"
						onClick={this.handleReset}
						onMouseEnter={this.mouseEnterResetButton}
						onMouseLeave={this.mouseLeaveResetButton}
					>
						<div id="reset-fields-button-label">{resetLabel}</div>
						<div className="reset-fields-button-icon">
							<Icon type="reset" />
						</div>
					</div>
				</Tooltip>
			</div>);
	}

	_genFilterTypes() {
		const that = this;
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
							<li className="filter-list-li filter"
								data-type={filter.type}
								onClick={that.filterType.bind(that)}
								disabled={!enabled}
							>
								<Icon type={filter.type} disabled={!enabled} />
							</li>
						</Tooltip>
					</div>
				</div>
			);
			return (row);
		});

		const filterLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_FILTER_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_FILTER_LABEL);
		return (
			<ul id="field-picker-filter-list">
				<li id="filter-list-title" className="filter-list-li">
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
		if (visibleData.length > 0 && visibleData.length < this.state.fields.length) {
			// need to compare the contents to make sure the visible ones are selected
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
		} else if (this.state.selectedFields && this.state.fields.length === this.state.selectedFields.length) {
			checkedAll = true;
		} else {
			checkedAll = false;
		}

		const headerWidthSections = this.state.headerWidth / 10;
		let checkboxWidth = Math.round(headerWidthSections);
		let fieldWidth = Math.round(headerWidthSections * 6);
		let dataWidth = Math.round(headerWidthSections * 3);

		if (this.props.rightFlyout) {
			checkboxWidth = 66;
			fieldWidth = 392;
			dataWidth = 196;
		}

		if (this.multiSchema) {
			fieldWidth /= 2;
		}

		const fieldColumnLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_FIELDCOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_FIELDCOLUMN_LABEL);
		// TODO: debug why resource key not used
		const schemaColumnLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_SCHEMACOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SCHEMACOLUMN_LABEL);
		const dataTypeColumnLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_DATATYPECOLUMN_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_DATATYPECOLUMN_LABEL);

		const headers = [];
		headers.push({ "key": "checkbox", "label": <div className="field-picker-checkbox">
			<Checkbox id={"field-picker-checkbox-all"}
				onChange={this.handleCheckAll}
				checked={checkedAll}
			/>
		</div>, "width": checkboxWidth });
		headers.push({ "key": "fieldName", "label": fieldColumnLabel, "width": fieldWidth });
		if (this.multiSchema) {
			headers.push({ "key": "schemaName", "label": schemaColumnLabel, "width": fieldWidth });
		}
		headers.push({ "key": "dataType", "label": dataTypeColumnLabel, "width": dataWidth });

		const tableData = this.getTableData(checkboxWidth, fieldWidth, dataWidth);

		return (
			<FlexibleTable className="table" id="table"
				sortable={["fieldName", "schemaName", "dataType"]}
				filterable={["fieldName"]}
				onFilter={this.onFilter}
				columns={headers}
				data={tableData}
				onSort={this.onSort}
				filterKeyword={this.state.filterText}
				scrollKey="field-picker"
				noAutoSize
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
				<div className="field-picker-top-row">
					{filterTypes}
					{resetButton}
				</div>
				{table}
				{backButton}
			</div>);
		}

		return (<div>
			<div className="field-picker-top-row">
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
	intl: intlShape
};

export default injectIntl(FieldPicker);
