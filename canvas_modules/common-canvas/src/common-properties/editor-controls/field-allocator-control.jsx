/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
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
		const myParent = me.getRootNode().getElementsByClassName("panel-container-open-right-flyout-panel");

		let clippedClassName = "";
		if (myParent.length > 0) {
			const parentRect = myParent[0].getBoundingClientRect();
			// 200 is the height of .Dropdown-menu in common-properties.css
			if (Math.abs((parentRect.top + parentRect.height) - (myRect.top + myRect.height)) < 200) {
				clippedClassName = "Dropdown-menu-clipped";
			}
		}
		this.setState({ clippedClassName: clippedClassName });
	}

	genDropdownOptions() {
		const options = [];
		// allow for user to not select a field
		options.push({
			value: "",
			label: this.emptyLabel
		});
		for (const field of this.props.fields) {
			options.push({
				value: field.name,
				label: field.name
			});
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
		const options = this.genDropdownOptions();
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "dropdown"
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
	fields: PropTypes.array.isRequired,
	control: PropTypes.object.isRequired
};
