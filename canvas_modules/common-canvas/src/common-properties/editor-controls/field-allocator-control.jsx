/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// selectcolumn control
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";

export default class FieldAllocatorControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			clippedClassName: ""
		};
		this.emptyLabel = "...";
		if (props.control.additionalText) {
			this.emptyLabel = this.props.control.additionalText;
		}
		this.handleChange = this.handleChange.bind(this);
		this.getAllocatedColumns = this.getAllocatedColumns.bind(this);
		this.addColumns = this.addColumns.bind(this);
		this.removeColumns = this.removeColumns.bind(this);
	}

	handleChange(evt) {
		let value = evt.value;
		// shouldn't have to do this but when "" the label is returned instead of value
		if (value === this.emptyLabel) {
			value = "";
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	onClick(evt) {
		const me = ReactDOM.findDOMNode(this.refs.input);
		const myRect = me.getBoundingClientRect();
		const parentRect = me.getRootNode().getElementsByClassName("panel-container-open-right-flyout-panel")[0].getBoundingClientRect();

		let clippedClassName = "";
		// 200 is the height of .Dropdown-menu in common-properties.css
		if (Math.abs((parentRect.top + parentRect.height) - (myRect.top + myRect.height)) < 200) {
			clippedClassName = "Dropdown-menu-clipped";
		}
		this.setState({ clippedClassName: clippedClassName });
		this.props.controller.validateInput(this.props.propertyId);
	}

	// Allocated columns are columns that are referenced by the current control value.
	getAllocatedColumns() {
		return this.props.controller.getPropertyValue(this.props.propertyId);
	}

	addColumns(columnNames, callback) {
		let currentColumns = this.props.controller.getPropertyValue(this.props.propertyId);
		if (columnNames.length === 1) {
			currentColumns = columnNames;
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, currentColumns);
	}

	removeColumns(columnNames, callback) {
		this.props.controller.updatePropertyValue(this.props.propertyId, []);
	}

	genDropdownOptions(fields) {
		const options = [];
		// allow for user to not select a field
		options.push({
			value: "",
			label: this.emptyLabel
		});
		if (fields) {
			for (let j = 0; j < fields.length; j++) {
				options.push({
					value: fields[j].name,
					label: fields[j].name
				});
			}
		}
		return options;
	}

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		let controlLabel = controlValue;
		if (typeof controlValue === "undefined" || controlValue === null || controlValue === "") {
			controlValue = "";
			controlLabel = this.emptyLabel;
		}
		const options = this.genDropdownOptions(this.props.dataModel.fields);
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

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}
		return (
			<div onClick={this.onClick.bind(this)} className={"editor_control_area " + this.state.clippedClassName} style={stateStyle}>
				<div id={controlIconContainerClass}>
					<Dropdown {...stateDisabled}
						id={this.getControlID()}
						name={this.props.control.name}
						options={options}
						onChange={this.handleChange}
						value={{
							value: controlValue,
							label: controlLabel
						}}
						ref="input"
					/>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

FieldAllocatorControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	dataModel: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired
};
