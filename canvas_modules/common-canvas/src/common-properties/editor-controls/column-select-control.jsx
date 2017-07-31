/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// import logger from "../../../utils/logger";
import React from "react";
import { FormControl, OverlayTrigger, Tooltip } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import ReactDOM from "react-dom";
import { Button } from "ap-components-react/dist/ap-components-react";
import remove32 from "../../../assets/images/remove_32.svg";
import remove32hover from "../../../assets/images/remove_32_hover.svg";
import remove32disabled from "../../../assets/images/remove_32_disabled.svg";

var _ = require("underscore");

export default class ColumnSelectControl extends EditorControl {
	constructor(props) {
		super(props);
		const ctrlValue = props.valueAccessor(props.control.name);
		const selections = [];
		for (let i = 0; i < this.props.selectedRows.length; i++) {
			selections.push(ctrlValue[this.props.selectedRows[i]]);
		}
		this.state = {
			hoverRemoveIcon: false,
			controlValue: ctrlValue,
			selectedValues: selections
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
		this.mouseEnterRemoveButton = this.mouseEnterRemoveButton.bind(this);
		this.mouseLeaveRemoveButton = this.mouseLeaveRemoveButton.bind(this);
	}

	componentDidMount() {
		this.selectionChanged(this.state.selectedValues);
		ReactDOM.findDOMNode(this.refs.input).focus();
	}

	handleChangeMultiColumn(evt) {
		let values = [];
		if (typeof evt.target.options !== "undefined") {
			values = [].filter.call(evt.target.options, function(o) {
				return o.selected;
			}).map(function(o) {
				return o.value;
			});
		}

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
		const indices = [];
		for (const seln of selection) {
			indices.push(this.state.controlValue.indexOf(seln));
		}
		this.props.updateSelectedRows(this.props.control.name, indices);
		this.setState({ enableRemoveIcon: (selection.length !== 0) });
	}

	mouseEnterRemoveButton() {
		if (this.state.enableRemoveIcon) {
			this.setState({ hoverRemoveIcon: true });
		}
	}

	mouseLeaveRemoveButton() {
		this.setState({ hoverRemoveIcon: false });
	}

	render() {
		// logger.info("AllocationControl.render");
		// logger.info(this.state);
		var options = EditorControl.genStringSelectOptions(this.state.controlValue, this.state.selectedValues);
		// logger.info(options);

		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		const controlName = this.getControlID().split("-")[2];
		const conditionProps = {
			controlName: controlName,
			controlType: "selection"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "column-select-control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "column-select-control-icon-container-enabled";
		}

		let removeFieldsButtonId = "remove-fields-button-enabled";
		let removeIconImage = (<img src={remove32} />);
		if (!this.state.enableRemoveIcon) {
			removeIconImage = (<img src={remove32disabled} />);
			removeFieldsButtonId = "remove-fields-button-disabled";
		} else if (this.state.hoverRemoveIcon) {
			removeIconImage = (<img src={remove32hover} />);
		}
		let removeIcon = (<div id={removeFieldsButtonId}
			className="button"
			onClick={this.removeSelected}
			onMouseEnter={this.mouseEnterRemoveButton}
			onMouseLeave={this.mouseLeaveRemoveButton}
			disabled
		>
			{removeIconImage}
		</div>);
		if (this.state.enableRemoveIcon) {
			removeIcon = (<div id={removeFieldsButtonId}
				className="button"
				onClick={this.removeSelected}
				onMouseEnter={this.mouseEnterRemoveButton}
				onMouseLeave={this.mouseLeaveRemoveButton}
				disabled={false}
			>
				{removeIconImage}
			</div>);
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
						{removeIcon}
					</OverlayTrigger>
					<div className="editor_control_area" style={stateStyle}>
						<div id={controlIconContainerClass}>
							<FormControl {...stateDisabled}
								id={this.getControlID()}
								className="column-allocator"
								componentClass="select"
								multiple
								rows={6}
								name={this.props.control.name}
								style={stateStyle}
								onChange={this.handleChangeMultiColumn}
								onBlur={this.validateInput}
								value={this.state.selectedValues}
								ref="input"
							>
								{options}
							</FormControl>
							{icon}
						</div>
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
					{removeIcon}
				</OverlayTrigger>
				<div className="editor_control_area" style={stateStyle}>
					<div id={controlIconContainerClass}>
						<FormControl {...stateDisabled}
							id={this.getControlID()}
							className="column-allocator"
							componentClass="select"
							rows={1}
							name={this.props.control.name}
							style={stateStyle}
							onChange={this.handleChange}
							onBlur={this.validateInput}
							value={this.state.selectedValues}
							ref="input"
						>
							{options}
						</FormControl>
						{icon}
					</div>
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
	controlStates: React.PropTypes.object,
	validationDefinitions: React.PropTypes.array,
	updateValidationErrorMessage: React.PropTypes.func,
	retrieveValidationErrorMessage: React.PropTypes.func,
	updateControlValue: React.PropTypes.func
};
