/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
import { TOOL_TIP_DELAY } from "../constants/constants.js";

export default class ColumnSelectControl extends EditorControl {
	constructor(props) {
		super(props);
		const selections = [];
		const controlValue = props.controller.getPropertyValue(props.propertyId);
		for (let i = 0; i < props.selectedRows.length; i++) {
			selections.push(controlValue[props.selectedRows[i]]);
		}
		this.state = {
			hoverRemoveIcon: false,
			selectedValues: selections
		};

		this.handleChange = this.handleChange.bind(this);
		this.getSelectedColumns = this.getSelectedColumns.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
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
		const controlValue = nextProps.controller.getPropertyValue(nextProps.propertyId);
		for (let i = 0; i < nextProps.selectedRows.length; i++) {
			selections.push(controlValue[nextProps.selectedRows[i]]);
		}
		this.setState({
			enableRemoveIcon: (selections.length !== 0),
			selectedValues: selections
		});
	}


	handleChange(evt) {
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

	// Selected columns are those that are referenced by values in the control that have
	// been selected by the user.
	// TODO not sure if this is needed
	getSelectedColumns() {
		return this.state.selectedValues;
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		return this.props.controller.getPropertyValue(this.props.propertyId);
	}

	removeSelected() {
		const rows = this.props.controller.getPropertyValue(this.props.propertyId);
		const newRows = [];
		const selected = this.state.selectedValues;
		for (var i = 0; i < rows.length; i++) {
			if (selected.indexOf(rows[i]) < 0) {
				newRows.push(rows[i]);
			}
		}
		this.setState({
			selectedValues: []
		});
		this.props.controller.updatePropertyValue(this.props.propertyId, newRows);
		this.selectionChanged([]);
	}

	selectionChanged(selection) {
		const indices = [];
		for (const seln of selection) {
			const valIdx = this.props.controller.getPropertyValue(this.props.propertyId).indexOf(seln);
			if (valIdx > -1) {
				indices.push(valIdx);
			}

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

	genSelectOptions(values) {
		var options = [];
		if (values && Array.isArray(values)) {
			for (var i = 0; i < values.length; i++) {
				options.push(
					<option key={i} value={values[i]}>{values[i]}</option>
				);
			}
		}
		return options;
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		var options = this.genSelectOptions(controlValue);

		const conditionProps = {
			propertyId: this.props.propertyId,
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
							className={"column-allocator multi " + disabledClassName}
							componentClass="select"
							multiple
							rows={6}
							name={this.props.control.name}
							style={stateStyle}
							onChange={this.handleChange}
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
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	selectedRows: PropTypes.array.isRequired
};
