/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlUtils from "./../../util/control-utils";
import ReactDOM from "react-dom";

export default class SomeofselectControl extends React.Component {
	constructor(props) {
		super(props);
		this.newSelection = null;
		this.handleChange = this.handleChange.bind(this);
		this.genSelectOptions = this.genSelectOptions.bind(this);
	}

	componentDidMount() {
		if (this.newSelection) {
			this.props.controller.updatePropertyValue(this.props.propertyId, this.newSelection);
			this.newSelection = null;
		}
	}

	handleChange(evt) {
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		this.props.controller.updatePropertyValue(this.props.propertyId, values);
	}

	genSelectOptions(selectedValues, style) {
		const options = [];
		// Allow for enumeration replacement
		const controlOpts = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (let i = 0; i < controlOpts.values.length; i++) {
			options.push(
				<option key={i} value={controlOpts.values[i]} style={style}>{controlOpts.valueLabels[i]}</option>
			);
		}
		// Check for filtered selections
		if (Array.isArray(selectedValues)) {
			const newSelns = selectedValues.slice(0);
			for (let i = 0; i < selectedValues.length; i++) {
				if ((controlOpts.values.indexOf(selectedValues[i])) === -1) {
					newSelns.splice(newSelns.indexOf(selectedValues[i]), 1);
				}
			}
			if (selectedValues.length !== newSelns.length) {
				this.newSelection = newSelns;
			}
		}
		return options;
	}

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "selection"
		};
		const conditionState = ControlUtils.getConditionMsgState(this.props.controller, conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		const options = this.genSelectOptions(controlValue, stateStyle);

		return (
			<div style={stateStyle}>
				<div id={controlIconContainerClass}>
					<FormControl id={ControlUtils.getControlID(this.props.control, this.props.propertyId)}
						{...stateDisabled}
						style={stateStyle}
						componentClass="select"
						multiple
						name={this.props.control.name}
						onChange={this.handleChange}
						value={controlValue}
						ref="input"
					>
						{options}
					</FormControl>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

SomeofselectControl.propTypes = {
	control: PropTypes.object,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	updateValidationErrorMessage: PropTypes.func,
	retrieveValidationErrorMessage: PropTypes.func,
	validationDefinitions: PropTypes.object,
	requiredParameters: PropTypes.array
};
