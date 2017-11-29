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
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { FormControl } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";
import ReactDOM from "react-dom";
import { Button } from "ap-components-react/dist/ap-components-react";
import remove32 from "../../../assets/images/remove_32.svg";
import remove32hover from "../../../assets/images/remove_32_hover.svg";
import remove32disabled from "../../../assets/images/remove_32_disabled.svg";
import { EDITOR_CONTROL, TOOL_TIP_DELAY } from "../constants/constants.js";

export default class ColumnSelectControl extends EditorControl {
	constructor(props) {
		super(props);
		const selections = [];
		for (let i = 0; i < this.props.selectedRows.length; i++) {
			selections.push(props.valueAccessor(props.control.name)[this.props.selectedRows[i]]);
		}
		this.state = {
			hoverRemoveIcon: false,
			selectedValues: selections
		};

		this._update_callback = null;

		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
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


	componentWillReceiveProps(nextProps) {
		const selections = [];
		for (let i = 0; i < nextProps.selectedRows.length; i++) {
			selections.push(nextProps.valueAccessor(nextProps.control.name)[nextProps.selectedRows[i]]);
		}

		this.setState({
			enableRemoveIcon: (selections.length !== 0),
			selectedValues: selections
		});
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

	getControlValue() {
		// logger.info("getControlValue");
		// logger.info(this.state.controlValue);
		return this.props.valueAccessor(this.props.control.name);
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
		newState.selectedValues = [];
		this.setState(newState);
		this.props.updateControlValue(this.props.control.name, newRows);
		this.selectionChanged([]);
	}

	selectionChanged(selection) {
		const indices = [];
		for (const seln of selection) {
			indices.push(this.getControlValue().indexOf(seln));
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
		var options = EditorControl.genStringSelectOptions(this.getControlValue(), this.state.selectedValues);
		// logger.info(options);
		if (this._update_callback !== null) {
			this._update_callback();
			this._update_callback = null;
		}

		const controlName = this.getControlID().replace(EDITOR_CONTROL, "");
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

		if (messageType === "error" || messageType === "warning") {
			stateStyle.borderWidth = "2px";
		}

		let removeFieldsButtonId = "remove-fields-button-enabled";
		let removeIconImage = (<img src={remove32} />);
		let removeOnClick = this.removeSelected;
		let removeButtonDisabled = false;
		if (!this.state.enableRemoveIcon || stateDisabled.disabled) {
			removeIconImage = (<img src={remove32disabled} />);
			removeFieldsButtonId = "remove-fields-button-disabled";
			removeOnClick = null;
			removeButtonDisabled = true;
		} else if (this.state.hoverRemoveIcon) {
			removeIconImage = (<img src={remove32hover} />);
		}
		const removeIcon = (<div id={removeFieldsButtonId}
			className="button"
			onClick={removeOnClick}
			onMouseEnter={this.mouseEnterRemoveButton}
			onMouseLeave={this.mouseLeaveRemoveButton}
			disabled={removeButtonDisabled}
		>
			{removeIconImage}
		</div>);

		let disabledClassName = "";
		let addButtonDisabled = false;
		let addOnClick = this.props.openFieldPicker;
		if (stateDisabled.disabled) {
			disabledClassName = " disabled";
			addButtonDisabled = true;
			addOnClick = null;
		}
		const addButton = (<Button
			id="add-fields-button"
			icon="plus"
			onClick={addOnClick}
			disabled={addButtonDisabled}
			data-control={JSON.stringify(this.props.control)}
		>
			Add Columns
		</Button>);

		const tooltipId = "tooltip-add-remove-columns-" + this.props.control.name;
		if (this.props.multiColumn) {
			return (
				<div>
					<div id="field-picker-buttons-container">
						<div className="properties-tooltips-container add-remove-columns" data-tip="Remove selected columns" data-for={tooltipId}>
							{removeIcon}
						</div>
						<div className="properties-tooltips-container add-remove-columns" data-tip="Select columns to add" data-for={tooltipId}>
							{addButton}
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
					<div className="editor_control_area">
						<div id={controlIconContainerClass}>
							<FormControl {...stateDisabled}
								id={this.getControlID()}
								className={"column-allocator multi " + this.props.propertiesClassname + disabledClassName}
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
				<div id="field-picker-buttons-container">
					<div className="properties-tooltips-container add-remove-columns" data-tip="Remove selected columns" data-for={tooltipId}>
						{removeIcon}
					</div>
					<div className="properties-tooltips-container add-remove-columns" data-tip="Select columns to add" data-for={tooltipId}>
						{addButton}
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
				<div className="editor_control_area">
					<div id={controlIconContainerClass}>
						<FormControl {...stateDisabled}
							id={this.getControlID()}
							className={"column-allocator single " + this.props.propertiesClassname + disabledClassName}
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
	multiColumn: PropTypes.bool.isRequired,
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlStates: PropTypes.object,
	validationDefinitions: PropTypes.object,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	updateControlValue: PropTypes.func,
	propertiesClassname: PropTypes.string
};
