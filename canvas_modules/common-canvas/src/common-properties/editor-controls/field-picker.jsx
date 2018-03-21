/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 18] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import EditorControl from "./editor-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import PropertiesButtons from "../properties-buttons.jsx";
import PropertyUtils from "../util/property-utils";

import { Tr, Td } from "reactable";
import Button from "ap-components-react/dist/components/Button";
import Checkbox from "ap-components-react/dist/components/Checkbox";
import { injectIntl, intlShape } from "react-intl";

import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "../constants/constants";
import { DATA_TYPES, TOOL_TIP_DELAY } from "../constants/constants.js";
import { ParamRole } from "../constants/form-constants";
import Icon from "../../icons/icon.jsx";

import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";

import Tooltip from "../../tooltip/tooltip.jsx";

import uuid4 from "uuid/v4";

class FieldPicker extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			fields: props.fields,
			filterIcons: [],
			filterText: "",
			initialControlValues: [],
			newControlValues: [],
			headerWidth: 756
		};
		this.multiSchema = props.controller.getDatasetMetadataSchemas() &&
			props.controller.getDatasetMetadataSchemas().length > 1;
		this.filterList = [];
		this.updateDimensions = this.updateDimensions.bind(this);

		this.filterType = this.filterType.bind(this);
		this.getDefaultRow = this.getDefaultRow.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.getVisibleData = this.getVisibleData.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleCheckAll = this.handleCheckAll.bind(this);
		this.handleFieldChecked = this.handleFieldChecked.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.getNewSelections = this.getNewSelections.bind(this);
		this.setReadOnlyColumnValue = this.setReadOnlyColumnValue.bind(this);
		this.onSort = this.onSort.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this._getRecordForRow = this._getRecordForRow.bind(this);
		this.removeInvalidFields = this.removeInvalidFields.bind(this);
	}

	componentWillMount() {
		this.dataColumnIndex = PropertyUtils.getTableFieldIndex(this.props.control);
		if (this.dataColumnIndex === -1) {
			this.dataColumnIndex = 0; // default to 0
		}

		this.filterList = this.getAvailableFilters();

		const controlName = this.props.control.name;
		const parmName = this.props.propertyId ? this.props.propertyId.name : null;
		let controlValues = [];
		if (this.props.currentControlValues[controlName]) {
			controlValues = this.props.currentControlValues[controlName];
		} else if (parmName &&
				PropertyUtils.toType(this.props.propertyId.col) === "number" &&
				this.props.currentControlValues[parmName]) {
			const rowIdx = this.props.propertyId.row;
			const colIdx = this.props.propertyId.col;
			controlValues = this.props.currentControlValues[parmName][rowIdx][colIdx];
		}
		// Remove invalid input field names
		controlValues = this.removeInvalidFields(controlValues);
		this.setState({
			initialControlValues: this.props.currentControlValues[controlName],
			newControlValues: controlValues
		});
	}

	componentDidMount() {
		this.updateDimensions();
		window.addEventListener("resize", this.updateDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions);
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

	/**
	 * Removes input selections that are not present in the current set of data models.
	 *
	 * @param {array} controlValues: Array of current control values
	 * @return {array} The input array minus any rows that have invalid field names
	 */
	removeInvalidFields(controlValues) {
		const validFields = [];
		const isTable = this.props.control.valueDef.propType === "structure";
		for (let idx = 0; idx < controlValues.length; idx++) {
			let fieldName;
			if (isTable) {
				fieldName = controlValues[idx][this.dataColumnIndex];
			} else {
				fieldName = controlValues[idx];
			}

			const foundField = this.props.fields.find(function(field) {
				return field.name === fieldName || fieldName === field.schema + "." + field.origName;
			});
			if (foundField) {
				validFields.push(controlValues[idx]);
			}
		}
		return validFields;
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
		const newControlValues = this.state.newControlValues;
		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			let checked = false;

			if (this.state.checkedAll) {
				checked = true;
			} else if (newControlValues) {
				for (let j = 0; j < newControlValues.length; j++) {
					let key = [];
					if (this.props.control.defaultRow) {
						key = newControlValues[j] && typeof newControlValues[j] !== "undefined" ? newControlValues[j][this.dataColumnIndex] : "";
					} else {
						key = newControlValues[j];
					}
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
		const initialValues = this.state.initialControlValues;
		if (this.state.newControlValues) {
			for (let i = 0; i < this.state.newControlValues.length; i++) {
				if (typeof initialValues === "undefined" || initialValues === null || initialValues.indexOf(this.state.newControlValues[i]) < 0) {
					deltas.push(i);
				}
			}
		}
		return deltas;
	}

	setReadOnlyColumnValue() {
		const controlValues = this.state.newControlValues;
		let updatePropertyValues = false;
		for (var rowIndex = 0; rowIndex < controlValues.length; rowIndex++) {
			for (var colIndex = 0; colIndex < this.props.control.subControls.length; colIndex++) {
				const columnDef = this.props.control.subControls[colIndex];
				if (columnDef.controlType === "readonly" && columnDef.generatedValues && columnDef.generatedValues.operation === "index") {
					updatePropertyValues = true;
					const index = typeof columnDef.generatedValues.startValue !== "undefined" ? columnDef.generatedValues.startValue + rowIndex : rowIndex + 1;
					controlValues[rowIndex][colIndex] = index;
				}
			}
		}
		if (updatePropertyValues) {
			this.setState({ newControlValues: controlValues });
		}
	}

	handleSave() {
		if (this.props.control.subControls) {
			this.setReadOnlyColumnValue();
		}
		const propertyId = this.props.propertyId;
		this.props.controller.updatePropertyValue(propertyId, this.state.newControlValues);
		this.props.controller.updateSelectedRows(this.props.control.name, this.getNewSelections());
		this.props.closeFieldPicker();
	}

	handleCancel() {
		this.handleReset();
		this.props.closeFieldPicker();
	}

	handleCheckAll(evt) {
		const selectAll = [];
		const that = this;

		const data = this.state.fields;
		const newControlValues = this.state.newControlValues;

		const visibleData = this.getVisibleData();

		if (evt.target.checked) {
			for (let i = 0; i < data.length; i++) {
				const fieldName = data[i].name;
				// add already selected fields
				const selected = (!newControlValues) ? [] : newControlValues.filter(function(element) {
					if (that.props.control.defaultRow) {
						return element[that.dataColumnIndex] === fieldName;
					}
					return element === fieldName;
				});

				if (selected.length > 0) {
					const found = this.getDefaultRow(selected[0]);
					if (found !== false) {
						selectAll.push(found);
					} else {
						selectAll.push(selected[0]);
					}
				} else { // if data is in visibleData, add it
					const visible = visibleData.some(function(element) {
						return element.name === data[i].name;
					});
					if (visible) {
						if (this.props.control.defaultRow) {
							selectAll.push(this._getRecordForRow(fieldName));
						} else {
							selectAll.push(fieldName);
						}
					}
				}
			}
		} else if (newControlValues) {
			for (let l = 0; l < newControlValues.length; l++) {
				const duplicate = visibleData.some(function(field) {
					let key = [];
					if (that.props.control.defaultRow) {
						key = newControlValues[l][that.dataColumnIndex];
					} else {
						key = newControlValues[l];
					}
					return field.name === key;
				});
				if (!duplicate) {
					selectAll.push(newControlValues[l]);
				}
			}
		}

		this.setState({
			newControlValues: selectAll,
			checkedAll: selectAll.length === data.length
		});
	}

	getDefaultRow(field) {
		const initialControlValues = this.state.initialControlValues;
		if (!initialControlValues) {
			return false;
		}
		for (let i = 0; i < initialControlValues.length; i++) {
			if ((this.props.control.defaultRow && initialControlValues[i][this.dataColumnIndex] === field) ||
					(initialControlValues[i] === field)) {
				return initialControlValues[i];
			}
		}
		return false;
	}

	handleFieldChecked(evt) {
		const current = this.state.newControlValues;
		const selectedFieldName = evt.currentTarget.getAttribute("data-name");
		const selectedField = this._getRecordForRow(selectedFieldName);

		const that = this;
		if (evt.target.checked) {
			const newValue = this.props.control.defaultRow ? [selectedField] : selectedField;
			this.setState({ newControlValues: current.concat(newValue) });
		} else if (current) {
			const modified = current.filter(function(element) {
				if (that.props.control.defaultRow) {
					return element[that.dataColumnIndex] !== selectedField[that.dataColumnIndex];
				}
				return element !== selectedFieldName;
			});

			this.setState({
				newControlValues: modified,
				checkedAll: false
			});
		}
	}

	_getRecordForRow(selectedFieldName) {
		let selectedField = [];
		// if selectedField is in the original list, grab that row instead of generating new selectedField
		const found = this.getDefaultRow(selectedFieldName);
		if (found !== false) {
			selectedField = found;
			if (this.props.control.valueDef.isMap) {
				selectedField[this.dataColumnIndex] = selectedFieldName;
			}
		}

		if (selectedField.length === 0) {
			if (this.props.control.subControls) {
				for (let i = 0; i < this.props.control.subControls.length; i++) {
					if (i === this.dataColumnIndex) { // role===ParamRole.COLUMN
						selectedField.push(selectedFieldName);
					} else if (typeof this.props.control.defaultRow !== "undefined") {
						let defaultValue = this._getDefaultRowValue(i);
						if ((typeof defaultValue === "undefined" || defaultValue === null) &&
									this.props.control.subControls[i].role === ParamRole.NEW_COLUMN) {
							// Set the default name to the column name for role===ParamRole.NEW_COLUMN
							defaultValue = selectedFieldName;
						}
						selectedField.push(defaultValue);
					} else {
						selectedField.push(null);
					}
				}
			} else {
				selectedField.push(selectedFieldName);
			}
		}
		return selectedField;
	}

	_getDefaultRowValue(index) {
		// The defaultRow may not be in-sync with the columns.  In some cases, the defaultRow will not contain the key column.
		let defaultIndex = index - 1;
		if (this.props.control.subControls.length === this.props.control.defaultRow.length || index < this.dataColumnIndex) {
			// This will handle most cases
			defaultIndex = index;
		}
		if (typeof this.props.control.defaultRow[defaultIndex] !== "undefined" && this.props.control.defaultRow[defaultIndex] !== null &&
		this.props.control.defaultRow[defaultIndex].parameterRef) {
			return this.props.controller.getPropertyValue({ name: this.props.control.defaultRow[defaultIndex].parameterRef });
		}
		return this.props.control.defaultRow[defaultIndex];
	}

	handleReset() {
		let checkedAll = false;
		if (this.state.initialControlValues && (this.state.initialControlValues === this.state.fields.length)) {
			checkedAll = true;
		}
		this.setState({
			newControlValues: this.state.initialControlValues,
			filterIcons: [],
			filterText: "",
			checkedAll: checkedAll
		});
	}

	filterType(evt) {
		const type = evt.currentTarget.getAttribute("data-type");
		const iconsSelected = this.state.filterIcons;
		const index = iconsSelected.indexOf(type);
		if (index < 0) {
			iconsSelected.push(type);
		} else {
			iconsSelected.splice(index, 1);
		}
		this.setState({ filterIcons: iconsSelected });
	}

	onFilter(filterString) {
		this.setState({ filterText: filterString });
	}

	onSort(spec) {
		let controlValue = this.state.fields;
		controlValue = sortBy(controlValue, function(field) {
			switch (spec.column) {
			case "fieldName": return field.origName;
			case "dataType": return field.type;
			case "schemaName": return field.schema;
			default: return null;
			}
		});
		if (spec.direction > 0) {
			controlValue = controlValue.reverse();
		}
		this.setState({ fields: controlValue });
	}

	_genBackButton() {
		if (this.props.rightFlyout) {
			const applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.APPLYBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.APPLYBUTTON_LABEL);
			const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.REJECTBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.REJECTBUTTON_LABEL);

			return (<PropertiesButtons
				okHandler={this.handleSave}
				cancelHandler={this.handleCancel}
				showPropertiesButtons={this.props.showPropertiesButtons}
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
			/>);
		}

		const saveTooltip = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_SAVEBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_SAVEBUTTON_TOOLTIP);
		const tooltipId = uuid4() + "-tooltip-fp-" + this.props.control.name;
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
					<Button
						id="field-picker-back-button"
						back icon="back"
						onClick={this.handleSave}
					/>
					<label className="control-label">{this.props.title}</label>
				</Tooltip>
			</div>
		);
	}

	_genResetButton() {
		const resetLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_LABEL);
		const resetTooltip = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_TOOLTIP);
		const tooltipId = uuid4() + "-tooltip-fp-" + this.props.control.name;
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
		const that = this;
		let checkedAll = this.state.checkedAll;
		// check all box should be checked if all in view is selected
		const visibleData = this.getVisibleData();
		const newControlValues = this.state.newControlValues;
		if (visibleData.length > 0 && visibleData.length < this.state.fields.length) {
			// need to compare the contents to make sure the visible ones are selected
			const sameData = newControlValues.filter(function(row) {
				let match = false;
				for (let k = 0; k < visibleData.length; k++) {
					let key = row;
					if (that.props.control.defaultRow) {
						key = row[that.dataColumnIndex];
						if (key === visibleData[k].name) {
							match = true;
							break;
						}
					} else if (key === visibleData[k].name) {
						match = true;
						break;
					}
				}
				return match;
			});
			checkedAll = sameData.length === visibleData.length;
		} else if (this.state.newControlValues &&
								this.state.fields.length === this.state.newControlValues.length) {
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
				scrollKey={this.props.control.name}
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
	currentControlValues: PropTypes.object.isRequired,
	fields: PropTypes.array,
	control: PropTypes.object,
	title: PropTypes.string,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
	intl: intlShape
};

export default injectIntl(FieldPicker);
