/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 18] */
/* eslint max-depth: ["error", 6] */

import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
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

import resetIcon from "../../../assets/images/reset_32.svg";
import resetHoverIcon from "../../../assets/images/reset_32_hover.svg";

import dateEnabledIcon from "../../../assets/images/date-enabled-icon.svg";
import integerEnabledIcon from "../../../assets/images/integer-enabled-icon.svg";
import doubleEnabledIcon from "../../../assets/images/double-enabled-icon.svg";
import stringEnabledIcon from "../../../assets/images/string-enabled-icon.svg";
import timeEnabledIcon from "../../../assets/images/time-enabled-icon.svg";
import timestampEnabledIcon from "../../../assets/images/timestamp-enabled-icon.svg";

import dateDisabledIcon from "../../../assets/images/date-disabled-icon.svg";
import integerDisabledIcon from "../../../assets/images/integer-disabled-icon.svg";
import doubleDisabledIcon from "../../../assets/images/double-disabled-icon.svg";
import stringDisabledIcon from "../../../assets/images/string-disabled-icon.svg";
import timeDisabledIcon from "../../../assets/images/time-disabled-icon.svg";
import timestampDisabledIcon from "../../../assets/images/timestamp-disabled-icon.svg";

import sortBy from "lodash/sortBy";

class FieldPicker extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			data: this.props.dataModel,
			fields: this.formatSchemaFields(this.props.dataModel),
			filterIcons: [],
			filterList: [],
			filterText: "",
			initialControlValues: [],
			newControlValues: [],
			hoverResetIcon: false,
			headerWidth: 756
		};

		this.dateEnabledIcon = dateEnabledIcon;
		this.integerEnabledIcon = integerEnabledIcon;
		this.doubleEnabledIcon = doubleEnabledIcon;
		this.stringEnabledIcon = stringEnabledIcon;
		this.timeEnabledIcon = timeEnabledIcon;
		this.timestampEnabledIcon = timestampEnabledIcon;

		this.dateDisabledIcon = dateDisabledIcon;
		this.integerDisabledIcon = integerDisabledIcon;
		this.doubleDisabledIcon = doubleDisabledIcon;
		this.stringDisabledIcon = stringDisabledIcon;
		this.timeDisabledIcon = timeDisabledIcon;
		this.timestampDisabledIcon = timestampDisabledIcon;

		this.updateDimensions = this.updateDimensions.bind(this);

		this.filterType = this.filterType.bind(this);
		this.formatSchemaFields = this.formatSchemaFields.bind(this);
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
		this.mouseEnterResetButton = this.mouseEnterResetButton.bind(this);
		this.mouseLeaveResetButton = this.mouseLeaveResetButton.bind(this);
		this.onSort = this.onSort.bind(this);
		this.onFilter = this.onFilter.bind(this);
		this._getRecordForRow = this._getRecordForRow.bind(this);
	}

	componentWillMount() {
		this.dataColumnIndex = PropertyUtils.getTableFieldIndex(this.props.control);
		if (this.dataColumnIndex === -1) {
			this.dataColumnIndex = 0; // default to 0
		}

		const filters = this.getAvailableFilters();

		const controlName = this.props.control.name;
		let controlValues = [];
		if (this.props.currentControlValues[controlName]) {
			controlValues = this.props.currentControlValues[controlName];
		}
		this.setState({
			initialControlValues: this.props.currentControlValues[controlName],
			newControlValues: controlValues,
			filterList: filters
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

	getAvailableFilters() {
		const filters = [];
		for (const schema of this.state.data) {
			const fields = schema.fields;
			const filterList = DATA_TYPES;

			for (let i = 0; i < filterList.length; i++) {
				for (let j = 0; j < fields.length; j++) {
					var field = fields[j];

					if (filterList[i] === field.type) {
						const filter = {
							"type": field.type,
							"icon": {
								"enabled": <img src={this[field.type + "EnabledIcon"]} />,
								"disabled": <img src={this[field.type + "DisabledIcon"]} />
							}
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

	getTableData(checkboxWidth, fieldWidth, dataWidth) {
		const fields = this.getVisibleData();
		const tableData = [];
		const newControlValues = this.state.newControlValues;
		for (let i = 0; i < fields.length; i++) {
			var field = fields[i];
			var checked = false;

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

					if (this.multiSchema && key.indexOf(".") > -1) {
						if (this.compareNameSchema(key, field)) {
							checked = true;
							break;
						}
					}

					if (key === field.name) {
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
					data-schema={field.schema}
					data-type={field.type}
				/></div></Td>);
			columns.push(<Td key="field-picker-column-fieldname" column="fieldName" style={{ "width": fieldWidth }}>{field.name}</Td>);

			if (this.multiSchema) {
				columns.push(<Td key="field-picker-column-schemaname" column="schemaName" style={{ "width": fieldWidth }}>{field.schema}</Td>);
			}
			columns.push(<Td key="field-picker-column-datatype" column="dataType" style={{ "width": dataWidth }}><div>
				<div className={"field-picker-data-type-icon field-picker-data-" + field.type + "-type-icon"}>
					<img src={this[field.type + "EnabledIcon"]} />
				</div>
				{field.type}
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

	formatSchemaFields(dataModel) {
		let fields = [];
		if (dataModel.length > 1) {
			this.multiSchema = true;
			for (let idx = 0; idx < dataModel.length; idx++) {
				const schemas = this.props.controller.getDatasetMetadataSchemas();
				dataModel[idx].fields.forEach(function(field) {
					field.schema = schemas[idx];
				});
				fields = fields.concat(dataModel[idx].fields);
			}
		} else {
			this.multiSchema = false;
			if (dataModel.length > 0) {
				fields = fields.concat(dataModel[0].fields);
			}
		}
		return fields;
	}

	compareNameSchema(key, field) {
		const keyField = key.split(".");
		return keyField[0].trim() === field.schema.toString() &&
						keyField[1].trim() === field.name;
	}

	handleSave() {
		if (this.props.control.subControls) {
			this.setReadOnlyColumnValue();
		}
		this.props.controller.updatePropertyValue({ name: this.props.control.name }, this.state.newControlValues);
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
				let schemaName = data[i].name;
				if (this.state.fields.filter((field) => field.name === schemaName).length > 1) {
					schemaName = data[i].schema + "." + schemaName;
				}

				// add already selected fields
				const selected = (!newControlValues) ? [] : newControlValues.filter(function(element) {
					if (that.props.control.defaultRow) {
						return element[that.dataColumnIndex] === schemaName;
					}
					return element === schemaName;
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
							selectAll.push(this._getRecordForRow(schemaName));
						} else {
							selectAll.push(schemaName);
						}
					}
				}
			}
		} else if (newControlValues) {
			for (let l = 0; l < newControlValues.length; l++) {
				const duplicate = visibleData.some(function(field) {
					let key = [];
					let found = false;
					if (that.props.control.defaultRow) {
						key = newControlValues[l][that.dataColumnIndex];
					} else {
						key = newControlValues[l];
					}

					if (that.multiSchema && key.indexOf(".") > -1) {
						found = that.compareNameSchema(key, field);
					} else {
						found = field.name === key;
					}

					return found;
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
		let selectedFieldName = evt.currentTarget.getAttribute("data-name");
		const selectedFieldSchema = evt.currentTarget.getAttribute("data-schema");

		// if more than one field with the same name, append schema name to selectedField
		if (this.state.fields.filter((field) => field.name === selectedFieldName).length > 1) {
			selectedFieldName = selectedFieldSchema + "." + selectedFieldName;
		}
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

	mouseEnterResetButton() {
		this.setState({ hoverResetIcon: true });
	}

	mouseLeaveResetButton() {
		this.setState({ hoverResetIcon: false });
	}

	onFilter(filterString) {
		this.setState({ filterText: filterString });
	}

	onSort(spec) {
		let controlValue = this.state.fields;
		controlValue = sortBy(controlValue, function(field) {
			switch (spec.column) {
			case "fieldName": return field.name;
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
		const tooltipId = "tooltip-fp-" + this.props.control.name;
		return (
			<div>
				<div className="properties-tooltips-container" data-tip={saveTooltip} data-for={tooltipId}>
					<Button
						id="field-picker-back-button"
						back icon="back"
						onClick={this.handleSave}
					/>
				</div>
				<label className="control-label">{this.props.title}</label>
				<ReactTooltip
					id={tooltipId}
					place="top"
					type="light"
					effect="solid"
					border
					className="properties-tooltips"
					delayShow={TOOL_TIP_DELAY}
				/>
			</div>
		);
	}

	_genResetButton() {
		let resetIconImage = (<img src={resetIcon} />);
		if (this.state.hoverResetIcon) {
			resetIconImage = (<img src={resetHoverIcon} />);
		}

		const resetLabel = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_LABEL, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_LABEL);
		const resetTooltip = PropertyUtils.formatMessage(this.props.intl,
			MESSAGE_KEYS.FIELDPICKER_RESETBUTTON_TOOLTIP, MESSAGE_KEYS_DEFAULTS.FIELDPICKER_RESETBUTTON_TOOLTIP);
		const tooltipId = "tooltip-fp-" + this.props.control.name;

		return (<div>
			<div className="properties-tooltips-fp-reset" data-tip={resetTooltip} data-for={tooltipId}>
				<div id="reset-fields-button"
					className="button"
					onClick={this.handleReset}
					onMouseEnter={this.mouseEnterResetButton}
					onMouseLeave={this.mouseLeaveResetButton}
				>
					<div id="reset-fields-button-label">{resetLabel}</div>
					<div id="reset-fields-button-icon">
						{resetIconImage}
					</div>
				</div>
			</div>
			<ReactTooltip
				id={tooltipId}
				place="top"
				type="light"
				effect="solid"
				border
				className="properties-tooltips"
				delayShow={TOOL_TIP_DELAY}
			/>
		</div>);
	}

	_genFilterTypes() {
		const that = this;
		const filters = this.state.filterList.map(function(filter, ind) {
			let enabled = true;
			for (let i = 0; i < that.state.filterIcons.length; i++) {
				if (filter.type === that.state.filterIcons[i]) {
					enabled = false;
					break;
				}
			}
			const filterTooltipId = "tooltip-filters-" + ind;
			const icon = enabled ? filter.icon.enabled : filter.icon.disabled;
			const className = enabled
				? "filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-enabled-icon"
				: "filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-disabled-icon";
			const row = (
				<div key={"filters" + ind}>
					<div className="properties-tooltips-filter" data-tip={filter.type} data-for={filterTooltipId}>
						<li className={className}
							data-type={filter.type}
							onClick={that.filterType.bind(that)}
						>
							{icon}
						</li>
					</div>
					<ReactTooltip
						id={filterTooltipId}
						place="top"
						type="light"
						effect="solid"
						border
						className="properties-tooltips"
						delayShow={TOOL_TIP_DELAY}
					/>
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

					if (that.multiSchema && key.indexOf(".") > -1) {
						if (that.compareNameSchema(key, visibleData[k])) {
							match = true;
							break;
						}
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
	dataModel: PropTypes.array,
	control: PropTypes.object,
	title: PropTypes.string,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
	intl: intlShape
};

export default injectIntl(FieldPicker);
