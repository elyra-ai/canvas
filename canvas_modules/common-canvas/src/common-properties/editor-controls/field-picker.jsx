/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 14] */
/* eslint max-depth: ["error", 5] */

import logger from "../../../utils/logger";
import React from "react";
import EditorControl from "./editor-control.jsx";
import FlexibleTable from "./flexible-table.jsx";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Tr, Td } from "reactable";
import {
	Button,
	Checkbox
} from "ap-components-react/dist/ap-components-react";

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
		this.getTableData = this.getTableData.bind(this);
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

	// reactable
	getTableData(headers) {
		const fields = this.state.fields;
		const tableData = [];
		logger.info(JSON.stringify("control vals: " + this.state.newControlValues));
		for (let i = 0; i < fields.length; i++) {
			var field = fields[i];
			var checked = false;

			if (this.state.checkedAll) {
				checked = true;
			} else {
				for (let j = 0; j < this.state.newControlValues.length; j++) {
					let key = [];
					if (this.props.control.defaultRow) {
						key = this.state.newControlValues[j].split(",")[0];
					} else {
						key = this.state.newControlValues[j];
					}
					if (key.indexOf(field.name) >= 0) {
						checked = true;
						break;
					}
				}
			}

			if (this.state.filterIcons.length === 0 || this.state.filterIcons.indexOf(field.type) < 0) {
				if (!this.state.filterText || field.name.indexOf(this.state.filterText) > -1) {
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
			}
		}
		return tableData;
	}

	handleBack() {
		this.props.updateControlValue(this.state.controlName, this.state.newControlValues);
		this.props.updateSelectedRows(this.state.controlName, this.getNewSelections());
		this.props.closeFieldPicker();
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

	handleCheckAll(evt) {
		const selectAll = [];
		const that = this;
		if (evt.target.checked) {
			const data = this.state.fields;
			for (let i = 0; i < data.length; i++) {
				const selected = this.state.newControlValues.filter(function(element) {
					if (that.props.control.defaultRow) {
						return JSON.parse(element)[0].indexOf(data[i].name) > -1;
					}
					return element.indexOf(data[i].name) > -1;
				});
				if (selected.length > 0) {
					// add the already selected fields
					if (this.props.control.defaultRow) {
						selectAll.push(JSON.parse(selected));
					} else {
						selectAll.push(selected[0]);
					}
				} else if (this.props.control.defaultRow) { // add remaining fields
					const index = this.props.control.valueDef.isMap ? 0 : 1;
					let defaultValue = this.props.control.defaultRow[index];
					// Set the default name to the column name for role==="new_column"
					if ((typeof defaultValue === "undefined" || defaultValue === null) &&
								this.props.control.subControls[1].role === "new_column") {
						defaultValue = data[i].name;
					}
					selectAll.push([data[i].name, defaultValue]);
				} else {
					selectAll.push(data[i].name);
				}
			}
		}

		if (this.props.control.defaultRow) {
			this.setState({
				newControlValues: EditorControl.stringifyStructureStrings(selectAll),
				checkedAll: evt.target.checked
			});
		} else {
			this.setState({
				newControlValues: selectAll,
				checkedAll: evt.target.checked
			});
		}
	}

	handleFieldChecked(evt) {
		const current = this.state.newControlValues;
		const initialControlValues = this.state.initialControlValues;
		const selectedFieldName = evt.currentTarget.getAttribute("data-name");
		let selectedField = [];
		// if selectedField is in the original list, grab that row instead of generating new selectedField
		for (let i = 0; i < initialControlValues.length; i++) {
			if (initialControlValues[i].split(",")[0].indexOf(selectedFieldName) > -1) {
				selectedField = initialControlValues[i];
				break;
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
				selectedField = EditorControl.stringifyStructureStrings(
					[[selectedFieldName, defaultValue]])[0];
			} else {
				selectedField = selectedFieldName;
			}
		}

		if (evt.target.checked) {
			this.setState({ newControlValues: current.concat(selectedField) });
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
			newControlValues: this.state.initialControlValues
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
		const header = (
			<div className="field-picker-top-row">
				<Button
					id="field-picker-back-button"
					back icon="back"
					onClick={this.handleBack}
				/>
				<label className="control-label">{label}</label>
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
			const tooltip = <Tooltip className="filter-icons-tooltips" id={"filter-tooltip-" + filter.type}>{filter.type}</Tooltip>;
			const icon = enabled ? filter.icon.enabled : filter.icon.disabled;
			const className = enabled
				? "filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-enabled-icon"
				: "filter-list-li filter-list-li-icon filter-list-data-" + filter.type + "-disabled-icon";
			const row = (
				<OverlayTrigger placement="top" overlay={tooltip} key={"filters" + ind}>
					<li className={className}
						data-type={filter.type}
						onClick={that.filterType.bind(that)}
					>
						{icon}
					</li>
				</OverlayTrigger>
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
		// check all box should be checked if all is selected
		if (this.state.data.fields.length === this.state.newControlValues.length) {
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
		</div>, "width": 20 });
		headers.push({ "key": "fieldName", "label": "Field name", "width": 40 });
		headers.push({ "key": "dataType", "label": "Data type", "width": 40 });

		const tableData = this.getTableData(headers);

		const table = (
			<FlexibleTable className="table" id="table"
				sortable={["fieldName", "dataType"]}
				filterable={["fieldName"]}
				onFilter={this.onFilter}
				columns={headers}
				data={tableData}
				onSort={this.onSort}
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
	closeFieldPicker: React.PropTypes.func.isRequired,
	currentControlValues: React.PropTypes.object.isRequired,
	dataModel: React.PropTypes.object.isRequired,
	updateControlValue: React.PropTypes.func,
	control: React.PropTypes.object,
	title: React.PropTypes.string
};
