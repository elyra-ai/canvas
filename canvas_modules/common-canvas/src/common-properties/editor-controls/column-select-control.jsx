/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import logger from "../../../utils/logger";
import React from "react";
import { FormControl, OverlayTrigger, Tooltip } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import ReactDOM from "react-dom";
import { Button } from "ap-components-react/dist/ap-components-react";
import Isvg from "react-inlinesvg";
import remove32 from "../../../assets/images/remove_32.svg";

var _ = require("underscore");

export default class ColumnSelectControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name),
			selectedValues: []
		};

		this._update_callback = null;

		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
		this.handleChangeMultiColumn = this.handleChangeMultiColumn.bind(this);
		this.removeSelected = this.removeSelected.bind(this);
		this.selectionChanged = this.selectionChanged.bind(this);
	}

	componentDidMount() {
		this.selectionChanged([]);
	}

	handleChangeMultiColumn(evt) {
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		this.setState({ selectedValues: values });
		this.selectionChanged(values);
	}

	handleChange(evt) {
		this.setState({ selectedValues: evt.target.value });
		this.selectionChanged(evt.target.value);
	}

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	getSelectedColumns() {
		// logger.info("getSelectedColumns");
		// logger.info(this.state.selectedValues);
		return this.state.selectedValues;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		// logger.info("getAllocatedColumns");
		return this.getControlValue();
	}

	addColumns(columnNames, callback) {
		// logger.info("addColumns");
		var currentColumns = this.state.controlValue;
		// logger.info(currentColumns);
		if (this.props.multiColumn) {
			currentColumns = _.union(currentColumns, columnNames);
		} else if (columnNames.length === 1) {
			currentColumns = columnNames;
		}
		// logger.info(currentColumns);

		this._update_callback = callback;

		var that = this;
		this.setState({
			controlValue: currentColumns,
			selectedValues: []
		}, function() {
			that.validateInput();
		});
	}

	removeColumns(columnNames, callback) {
		// logger.info("removeColumns");
		var currentColumns = this.state.controlValue;
		// logger.info(currentColumns);
		if (this.props.multiColumn) {
			currentColumns = _.difference(currentColumns, columnNames);
		} else {
			// Always remove the current value
			currentColumns = [""];
		}
		// logger.info(currentColumns);

		this._update_callback = callback;

		var that = this;
		this.setState({
			controlValue: currentColumns,
			selectedValues: []
		}, function() {
			that.validateInput();
		});
	}

	getControlValue() {
		// logger.info("getControlValue");
		// logger.info(this.state.controlValue);
		return this.state.controlValue;
	}

	removeSelected() {
		const rows = this.getControlValue();
		const newRows = [];
		const selected = this.state.selectedValues;
		for (var i = 0; i < rows.length; i++) {
			if (selected.indexOf(rows[i]) < 0) {
				newRows.push(rows[i]);
			}
		}
		const newState = {};
		newState.controlValue = newRows;
		newState.selectedValues = [];
		this.setState(newState);
		this.props.updateControlValue(this.props.control.name, newRows);
		this.selectionChanged([]);
	}

	selectionChanged(selection) {
		const opacity = "opacity:" + (selection.length > 0 ? 1.0 : 0.4);
		const id = this.removeButtonId();
		document.getElementById(id).style.cssText = opacity;
		document.getElementById(id).setAttribute("disabled", selection.length === 0);
	}

	removeButtonId() {
		return "remove-fields-button_" + this.props.control.name;
	}

	render() {
		logger.info("AllocationControl.render");
		// logger.info(this.state);
		var options = EditorControl.genStringSelectOptions(this.state.controlValue, this.state.selectedValues);
		// logger.info(options);

		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		var errorMessage = <div className="validation-error-message"></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			errorMessage = (
				<div className="validation-error-message">
					<p className="form__validation" style={{ "display": "block", "margin": "0px" }} >
						<span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
					</p>
				</div>
			);
		}

		var controlName = this.getControlID().split(".")[1];
		var stateDisabled = {};
		var stateStyle = {};
		if (typeof this.props.controlStates[controlName] !== "undefined") {
			if (this.props.controlStates[controlName] === "disabled") {
				stateDisabled.disabled = true;
				stateStyle = {
					color: "#D8D8D8",
					borderColor: "#D8D8D8"
				};
			} else if (this.props.controlStates[controlName] === "hidden") {
				stateStyle.visibility = "hidden";
			}
		}

		const addTooltip = <Tooltip id="addFieldTip">Select columns to add</Tooltip>;
		const removeTooltip = <Tooltip id="removeFieldTip">Remove selected columns</Tooltip>;
		if (this.props.multiColumn) {
			return (
				<div>
					<OverlayTrigger placement="top" overlay={addTooltip}>
						<Button
							id="add-fields-button"
							icon="plus"
							onClick={this.props.openFieldPicker}
							data-control={JSON.stringify(this.props.control)}
						>
							Add Columns
						</Button>
					</OverlayTrigger>
					<OverlayTrigger placement="top" overlay={removeTooltip}>
						<div id={this.removeButtonId()} className="button" onClick={this.removeSelected}>
							<Isvg id="remove-fields-button-upper-image" src={remove32} />
						</div>
					</OverlayTrigger>
					<div className="editor_control_area" style={stateStyle}>
						<FormControl {...stateDisabled}
							id={this.getControlID()}
							className="column-allocator"
							componentClass="select"
							multiple
							rows={6}
							name={this.props.control.name}
							style={stateStyle}
							onChange={this.handleChangeMultiColumn}
							value={this.state.selectedValues}
							ref="input"
						>
							{options}
						</FormControl>
						{errorMessage}
					</div>
				</div>
			);
		}
		return (
			<div>
				<OverlayTrigger placement="top" overlay={addTooltip}>
					<Button
						id="add-fields-button"
						secondary icon="plus"
						onClick={this.props.openFieldPicker}
						data-control={JSON.stringify(this.props.control)}
					>
						Add Columns
					</Button>
				</OverlayTrigger>
				<OverlayTrigger placement="top" overlay={removeTooltip}>
					<div id={this.removeButtonId()} className="button" onClick={this.removeSelected}>
						<Isvg id="remove-fields-button-upper-image" src={remove32} />
					</div>
				</OverlayTrigger>
				<div className="editor_control_area" style={stateStyle}>
					<FormControl {...stateDisabled}
						id={this.getControlID()}
						className="column-allocator"
						componentClass="select"
						rows={1}
						name={this.props.control.name}
						style={stateStyle}
						onChange={this.handleChange}
						value={this.state.selectedValues}
						ref="input"
					>
						{options}
					</FormControl>
					{errorMessage}
				</div>
			</div>
		);
	}
}

ColumnSelectControl.propTypes = {
	multiColumn: React.PropTypes.bool.isRequired,
	dataModel: React.PropTypes.object.isRequired,
	control: React.PropTypes.object.isRequired,
	controlStates: React.PropTypes.object
};
