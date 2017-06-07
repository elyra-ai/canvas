/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/
/* eslint complexity: ["error", 14] */

// import logger from "../../../utils/logger";
import React from "react";
import EditorControl from "./editor-control.jsx";
import { Table } from "Reactable";
import {
	Button,
	Checkbox,
	TextField
} from "ap-components-react/dist/ap-components-react";

import Isvg from "react-inlinesvg";
import search32 from "../../../assets/images/search_32.svg";
import reset32 from "../../../assets/images/reset_32.svg";

import dateIcon from "../../../assets/images/date_icon.svg";
import integerIcon from "../../../assets/images/integer_icon.svg";
import realIcon from "../../../assets/images/real_icon.svg";
import stringIcon from "../../../assets/images/string_icon.svg";
import timeIcon from "../../../assets/images/time_icon.svg";
import timestampIcon from "../../../assets/images/timestamp_icon.svg";

const dateSvgIcon = (<Isvg id="filter-date-icon" key="filter-date-icon" src={dateIcon} />);
const integerSvgIcon = (<Isvg id="filter-integer-icon" key="filter-integer-icon" src={integerIcon} />);
const realSvgIcon = (<Isvg id="filter-real-icon" key="filter-real-icon" src={realIcon} />);
const stringSvgIcon = (<Isvg id="filter-string-icon" key="filter-string-icon"	src={stringIcon} />);
const timeSvgIcon = (<Isvg id="filter-time-icon" key="filter-time-icon"	src={timeIcon} />);
const timestampSvgIcon = (<Isvg id="filter-timestamp-icon" key="filter-timestamp-icon" src={timestampIcon} />);

export default class FieldPicker extends EditorControl {
	constructor(props) {
		super(props);

		this.state = {
			checkedAll: false,
			controlName: "",
			data: this.props.dataModel,
			filterIcons: [],
			filterKeyword: "",
			filterList: [],
			initialControlValues: [],
			newControlValues: []
		};

		this.filterType = this.filterType.bind(this);
		this.getTableData = this.getTableData.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleCheckAll = this.handleCheckAll.bind(this);
		this.handleFieldChecked = this.handleFieldChecked.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	componentWillMount() {
		const columns = this.state.data.columns;
		const filterList = ["Date", "Integer", "Real", "String", "Time", "Timestamp"];
		var filters = [];

		for (let i = 0; i < filterList.length; i++) {
			for (let j = 0; j < columns.length; j++) {
				var column = columns[j];

				if (filterList[i] === column.storage) {
					switch (filterList[i]) {
					case "Date":
						filters.push({ "type": "Date", "icon": dateSvgIcon });
						break;
					case "Integer":
						filters.push({ "type": "Integer", "icon": integerSvgIcon });
						break;
					case "Real":
						filters.push({ "type": "Real", "icon": realSvgIcon });
						break;
					case "String":
						filters.push({ "type": "String", "icon": stringSvgIcon });
						break;
					case "Time":
						filters.push({ "type": "Time", "icon": timeSvgIcon });
						break;
					case "Timestamp":
						filters.push({ "type": "Timestamp", "icon": timestampSvgIcon });
						break;
					default:
					}
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
	getTableData() {
		const columns = this.state.data.columns;
		const tableData = [];
		console.log(JSON.stringify("control vals: " + this.state.newControlValues));
		for (let i = 0; i < columns.length; i++) {
			var column = columns[i];
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
					if (key.indexOf(column.name) >= 0) {
						checked = true;
						break;
					}
				}
			}

			if (this.state.filterIcons.length === 0 || this.state.filterIcons.indexOf(column.storage) < 0) {
				var typeIcon = <div></div>;

				switch (column.storage) {
				case "Date": typeIcon = dateSvgIcon; break;
				case "Integer": typeIcon = integerSvgIcon; break;
				case "Real": typeIcon = realSvgIcon; break;
				case "String": typeIcon = stringSvgIcon; break;
				case "Time": typeIcon = timeSvgIcon; break;
				case "Timestamp": typeIcon = timestampSvgIcon; break;
				default:
				}

				tableData.push({
					"checkbox": <div className="field-picker-checkbox">
					<Checkbox id={"field-picker-checkbox-" + i}
						checked={checked}
						onChange={this.handleFieldChecked}
						data-name={column.name}
					/></div>,
					"fieldName": column.name,
					"dataType": <div>
						<div className="field-picker-data-type-icon">{typeIcon}</div>
						{column.storage}
					</div>
				});
			}
		}
		return tableData;
	}

	handleBack() {
		this.props.updateControlValue(this.state.controlName, this.state.newControlValues);
		this.props.closeFieldPicker();
	}

	handleCheckAll(evt) {
		const selectAll = [];
		if (evt.target.checked) {
			const data = this.state.data.columns;
			for (let i = 0; i < data.length; i++) {
				const selected = this.state.newControlValues.filter(function(element) {
					return element.indexOf(data[i].name) > -1;
				});
				if (selected.length > 0) {
					// add the already selected fields
					if (this.props.control.defaultRow) {
						selectAll.push(JSON.parse(selected));
					} else {
						selectAll.push(JSON.parse(selected)[0]);
					}
				} else if (this.props.control.defaultRow) { // add remaining fields
					selectAll.push([data[i].name, this.props.control.defaultRow]);
				} else {
					selectAll.push([data[i].name]);
				}
			}
		}
		this.setState({
			newControlValues: EditorControl.stringifyStructureStrings(selectAll),
			checkedAll: evt.target.checked
		});
	}

	handleFieldChecked(evt) {
		const current = this.state.newControlValues;
		let selectedField = [];
		if (this.props.control.defaultRow) {
			selectedField = EditorControl.stringifyStructureStrings([[evt.currentTarget.dataset.name, this.props.control.defaultRow]]);
		} else {
			selectedField = [evt.currentTarget.dataset.name];
		}
		if (evt.target.checked) {
			this.setState({ newControlValues: current.concat(selectedField[0]) });
		} else {
			const modified = current.filter(function(element) {
				return element !== selectedField[0];
			});

			this.setState({ newControlValues: modified });
		}
	}

	handleFilterChange(evt) {
		this.setState({ filterKeyword: evt.target.value });
	}

	handleReset() {
		if (this.state.initialControlValues.length !== this.state.data.columns.length) {
			this.setState({ checkedAll: false });
		}
		this.setState({
			newControlValues: this.state.initialControlValues
		});
	}

	filterType(evt) {
		if (evt.currentTarget.style.fill === "") {
			evt.currentTarget.style.fill = "#D8D8D8";

			const type = evt.currentTarget.dataset.type;
			console.log("filter type deselected: " + type);

			const iconsSelected = this.state.filterIcons;
			iconsSelected.push(type);
			this.setState({ filterIcons: iconsSelected });

		} else { // reset
			evt.currentTarget.style.fill = "";

			const iconsDeselected = this.state.filterIcons;
			const index = iconsDeselected.indexOf(evt.currentTarget.dataset.type);
			if (index > -1) {
				iconsDeselected.splice(index, 1);
			}
			this.setState({ filterIcons: iconsDeselected });
		}
	}

	render() {
		var header = (
			<div>
				<Button
					id="field-picker-back-button"
					back icon="back"
					onClick={this.handleBack}
				/>
				<label className="control-label">Select Fields for Node</label>
				<div id="reset-fields-button"
					className="button"
					onClick={this.handleReset}
				>
					<div id="reset-fields-button-label">Reset</div>
					<div id="reset-fields-button-icon">
						<Isvg src={reset32} />
					</div>
				</div>
			</div>
		);

		var that = this;
		const filters = this.state.filterList.map(function(filter, ind) {
			return (
				<li className="filter-list-li filter-list-li-icon"
					key={"filters" + ind}
					data-type={filter.type}
					onClick={that.filterType.bind(that)}
				>
					{filter.icon}
				</li>
			);
		});

		const search = (
			<div>
				<TextField
					type="search"
					id="field-picker-search"
					className="field-picker-toolbar"
					placeholder="Search for a field"
					disabledPlaceholderAnimation
					onChange={this.handleFilterChange}
					value={this.state.filterKeyword}
				/>
				<div id="field-picker-search-icon"
					className="field-picker-toolbar"
				>
					<Isvg id="field-picker-search-icon"
						src={search32}
					/>
				</div>
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
		if (this.state.data.columns.length === this.state.newControlValues.length) {
			checkedAll = true;
		} else {
			checkedAll = false;
		}

		const headers = [
			{ "key": "checkbox", "label": <div className="field-picker-checkbox">
					<Checkbox id={"field-picker-checkbox-all"}
						onChange={this.handleCheckAll}
						checked={checkedAll}
					/>
				</div> },
			{ "key": "fieldName", "label": "Field name" },
			{ "key": "dataType", "label": "Data type" }
		];

		const tableData = this.getTableData();

		var table = (<div id="field-picker-table-container">
			<Table className="table" id="table"
				sortable
				filterable={["fieldName"]}
				hideFilterInput
				filterBy={this.state.filterKeyword}
				columns={headers}
				data={tableData}
			/>
		</div>);

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
	control: React.PropTypes.object
};
