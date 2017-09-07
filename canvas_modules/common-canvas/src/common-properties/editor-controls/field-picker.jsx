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

// import logger from "../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import EditorControl from "./editor-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import { Tr, Td } from "reactable";
import { Button, Checkbox } from "ap-components-react/dist/ap-components-react";

import { DATA_TYPES } from "../constants/constants.js";

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

var _ = require("underscore");

export default class FieldPicker extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			checkedAll: false,
			controlName: "",
			data: this.props.dataModel,
			fields: this.props.dataModel.fields,
			filterIcons: [],
			filterList: [],
			filterText: "",
			initialControlValues: [],
			newControlValues: [],
			hoverResetIcon: false
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

		this.filterType = this.filterType.bind(this);
		this.getDefaultRow = this.getDefaultRow.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.getVisibleData = this.getVisibleData.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleCheckAll = this.handleCheckAll.bind(this);
		this.handleFieldChecked = this.handleFieldChecked.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.getNewSelections = this.getNewSelections.bind(this);
		this.mouseEnterResetButton = this.mouseEnterResetButton.bind(this);
		this.mouseLeaveResetButton = this.mouseLeaveResetButton.bind(this);
		this.onSort = this.onSort.bind(this);
		this.onFilter = this.onFilter.bind(this);
	}

	componentWillMount() {
		const fields = this.state.data.fields;
		const filterList = DATA_TYPES;
		const filters = [];

		for (let i = 0; i < filterList.length; i++) {
			for (let j = 0; j < fields.length; j++) {
				var field = fields[j];

				if (filterList[i] === field.type) {
					filters.push({
						"type": field.type,
						"icon": {
							"enabled": <img src={this[field.type + "EnabledIcon"]} />,
							"disabled": <img src={this[field.type + "DisabledIcon"]} />
						}
					});
					break;
				}
			}
		}

		const controlName = this.props.control.name;
		this.setState({
			controlName: controlName,
			initialControlValues: this.props.currentControlValues[controlName],
			newControlValues: this.props.currentControlValues[controlName],
			filterList: filters
		});
	}

	getTableData() {
		const fields = this.getVisibleData();
		const tableData = [];
		const newControlValues = this.state.newControlValues;
		for (let i = 0; i < fields.length; i++) {
			var field = fields[i];
			var checked = false;

			if (this.state.checkedAll) {
				checked = true;
			} else {
				for (let j = 0; j < newControlValues.length; j++) {
					let key = [];
					if (this.props.control.defaultRow) {
						key = newControlValues[j][0];
					} else {
						key = newControlValues[j];
					}
					if (key.indexOf(field.name) >= 0) {
						checked = true;
						break;
					}
				}
			}

			const columns = [
				<Td key="field-picker-column-checkbox" column="checkbox" style={{ "width": "18%" }}><div className="field-picker-checkbox">
					<Checkbox id={"field-picker-checkbox-" + i}
						checked={checked}
						onChange={this.handleFieldChecked}
						data-name={field.name}
					/></div></Td>,
				<Td key="field-picker-column-fieldname" column="fieldName" style={{ "width": "42%" }}>{field.name}</Td>,
				<Td key="field-picker-column-datatype" column="dataType" style={{ "width": "40%" }}><div>
					<div className={"field-picker-data-type-icon field-picker-data-" + field.type + "-type-icon"}>
						<img src={this[field.type + "EnabledIcon"]} />
					</div>
					{field.type}
				</div></Td>
			];
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
			return row.name.indexOf(that.state.filterText) > -1;
		});

		return visibleData;
	}

	/**
	 * Returns any new columns that were not a part of the original set.
	 */
	getNewSelections() {
		const deltas = [];
		for (let i = 0; i < this.state.newControlValues.length; i++) {
			if (this.state.initialControlValues.indexOf(this.state.newControlValues[i]) < 0) {
				deltas.push(i);
			}
		}
		return deltas;
	}

	handleBack() {
		this.props.updateControlValue(this.state.controlName, this.state.newControlValues);
		this.props.updateSelectedRows(this.state.controlName, this.getNewSelections());
		this.props.closeFieldPicker();
	}

	handleCheckAll(evt) {
		const selectAll = [];
		const that = this;

		const data = this.state.fields;
		const newControlValues = this.state.newControlValues;

		const visibleData = this.getVisibleData();

		if (evt.target.checked) {
			for (let i = 0; i < data.length; i++) { // add already selected fields
				const selected = newControlValues.filter(function(element) {
					if (that.props.control.defaultRow) {
						return element[0] === data[i].name;
					}
					return element === data[i].name;
				});
				if (selected.length > 0) {
					const found = this.getDefaultRow(selected[0]);
					if (found !== false) {
						selectAll.push(found);
					} else {
						selectAll.push(selected[0]);
					}
				} else { // if data is in visibleData, add it
					const duplicate = visibleData.some(function(element) {
						return element.name === data[i].name;
					});
					if (duplicate) {
						const row = data[i];
						const found = this.getDefaultRow(data[i].name);
						if (found !== false) {
							selectAll.push(found);
						} else if (this.props.control.defaultRow) { // add remaining fields
							const index = this.props.control.valueDef.isMap ? 0 : 1;
							let defaultValue = this.props.control.defaultRow[index];
							// Set the default name to the column name for role==="new_column"
							if ((typeof defaultValue === "undefined" || defaultValue === null) &&
										this.props.control.subControls[1].role === "new_column") {
								defaultValue = row.name;
							}
							selectAll.push([row.name, defaultValue]);
						} else {
							selectAll.push(row.name);
						}
					}
				}
			}
		} else {
			for (let l = 0; l < newControlValues.length; l++) {
				const duplicate = visibleData.some(function(element) {
					let found = false;
					if (that.props.control.defaultRow) {
						found = element.name === newControlValues[l][0];
					} else {
						found = element.name === newControlValues[l];
					}
					return found;
				});
				if (!duplicate) {
					selectAll.push(newControlValues[l]);
				}
			}
		}

		if (this.props.control.defaultRow) {
			this.setState({
				newControlValues: selectAll,
				checkedAll: evt.target.checked
			});
		} else {
			this.setState({
				newControlValues: selectAll,
				checkedAll: evt.target.checked
			});
		}

		if (selectAll.length !== data.length) {
			this.setState({
				checkedAll: false
			});
		}
	}

	getDefaultRow(field) {
		const initialControlValues = this.state.initialControlValues;
		for (let i = 0; i < initialControlValues.length; i++) {
			if ((this.props.control.defaultRow && initialControlValues[i][0] === field) ||
					(initialControlValues[i] === field)) {
				return initialControlValues[i];
			}
		}
		return false;
	}

	handleFieldChecked(evt) {
		const current = this.state.newControlValues;
		const selectedFieldName = evt.currentTarget.getAttribute("data-name");
		let selectedField = [];
		// if selectedField is in the original list, grab that row instead of generating new selectedField
		const found = this.getDefaultRow(selectedFieldName);
		if (found !== false) {
			selectedField = found;
			if (this.props.control.defaultRow) {
				selectedField = found;
			}
		}

		if (selectedField.length === 0) {
			if (this.props.control.defaultRow) {
				const index = this.props.control.valueDef.isMap ? 0 : 1;
				let defaultValue = this.props.control.defaultRow[index];
				// Set the default name to the column name for role==="new_column"
				if ((typeof defaultValue === "undefined" || defaultValue === null) &&
							this.props.control.subControls[1].role === "new_column") {
					defaultValue = selectedFieldName;
				}
				selectedField = [selectedFieldName, defaultValue];
			} else {
				selectedField = selectedFieldName;
			}
		}

		if (evt.target.checked) {
			this.setState({ newControlValues: current.concat([selectedField]) });
		} else {
			const modified = current.filter(function(element) {
				return element !== selectedField;
			});

			this.setState({
				newControlValues: modified,
				checkedAll: false
			});
		}
	}

	handleReset() {
		if (this.state.initialControlValues.length !== this.state.data.fields.length) {
			this.setState({ checkedAll: false });
		}
		this.setState({
			newControlValues: this.state.initialControlValues,
			filterIcons: [],
			filterText: ""
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
		controlValue = _.sortBy(controlValue, function(field) {
			return spec.column === "fieldName" ? field.name : field.type;
		});
		if (spec.direction > 0) {
			controlValue = controlValue.reverse();
		}
		this.setState({ fields: controlValue });
	}

	render() {
		let resetIconImage = (<img src={resetIcon} />);
		if (this.state.hoverResetIcon) {
			resetIconImage = (<img src={resetHoverIcon} />);
		}

		const title = this.props.title ? this.props.title : "Node";
		const label = "Select Fields for " + title;
		const tooltipId = "tooltip-fp-" + this.props.control.name;
		const header = (
			<div className="field-picker-top-row">
				<div className="properties-tooltips-container" data-tip="Save and return" data-for={tooltipId}>
					<Button
						id="field-picker-back-button"
						back icon="back"
						onClick={this.handleBack}
					/>
				</div>
				<label className="control-label">{label}</label>
				<div className="properties-tooltips-fp-reset" data-tip="Reset to previous values" data-for={tooltipId}>
					<div id="reset-fields-button"
						className="button"
						onClick={this.handleReset}
						onMouseEnter={this.mouseEnterResetButton}
						onMouseLeave={this.mouseLeaveResetButton}
					>
						<div id="reset-fields-button-label">Reset</div>
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
				/>
			</div>
		);

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
					/>
				</div>
			);
			return (row);
		});

		const search = (
			<div>
				<div >
					<ul id="field-picker-filter-list">
						<li id="filter-list-title" className="filter-list-li">
							Filter:
						</li>
						{filters}
					</ul>
				</div>
			</div>
		);

		let checkedAll = this.state.checkedAll;
		// check all box should be checked if all in view is selected
		const visibleData = this.getVisibleData();
		const newControlValues = this.state.newControlValues;
		if (visibleData.length > 0 && visibleData.length < this.state.data.fields.length) {
			// need to compare the contents to make sure the visible ones are selected
			const sameData = newControlValues.filter(function(row) {
				let match = false;
				for (let k = 0; k < visibleData.length; k++) {
					if (that.props.control.defaultRow && row[0] === visibleData[k].name) {
						match = true;
						break;
					} else if (row === visibleData[k].name) {
						match = true;
						break;
					}
				}
				return match;
			});
			checkedAll = sameData.length === visibleData.length;
		} else if (this.state.data.fields.length === this.state.newControlValues.length) {
			checkedAll = true;
		} else {
			checkedAll = false;
		}

		const headers = [];
		headers.push({ "key": "checkbox", "label": <div className="field-picker-checkbox">
			<Checkbox id={"field-picker-checkbox-all"}
				onChange={this.handleCheckAll}
				checked={checkedAll}
			/>
		</div>, "width": 18 });
		headers.push({ "key": "fieldName", "label": "Field name", "width": 42 });
		headers.push({ "key": "dataType", "label": "Data type", "width": 40 });

		const tableData = this.getTableData();

		const table = (
			<FlexibleTable className="table" id="table"
				sortable={["fieldName", "dataType"]}
				filterable={["fieldName"]}
				onFilter={this.onFilter}
				columns={headers}
				data={tableData}
				onSort={this.onSort}
				filterKeyword={this.state.filterText}
			/>
		);

		return (
			<div>
				{header}
				{search}
				{table}
			</div>
		);
	}
}

FieldPicker.propTypes = {
	closeFieldPicker: PropTypes.func.isRequired,
	currentControlValues: PropTypes.object.isRequired,
	dataModel: PropTypes.object.isRequired,
	updateControlValue: PropTypes.func,
	control: PropTypes.object,
	title: PropTypes.string
};
