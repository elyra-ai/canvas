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

import React from "react";
import { Checkbox } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

export default class CheckboxControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)[0]
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		var newValue = evt.target.checked ? newValue = "true" : newValue = "false";
		var that = this;
		this.setState({
			controlValue: newValue
		}, function() {
			that.validateInput();
		});
		this.notifyValueChanged(this.props.control.name, newValue);
		this.props.updateControlValue(this.props.control.name, newValue);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		var checked = this.state.controlValue === "true";
		var errorMessage = <div className="validation-error-message"></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			errorMessage = (
				<div className="validation-error-message" style={{ "marginTop": "15px" }}>
					<p className="form__validation" style={{ "display": "block" }}>
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
			} else if (this.props.controlStates[controlName] === "hidden") {
				stateStyle.visibility = "hidden";
			}
		}

		var cb = (<Checkbox {...stateDisabled}
			style={stateStyle}
			id={this.getControlID()}
			name={this.props.control.label.text}
			onChange={this.handleChange}
			checked={checked}
		/>);

		return (
			<div className="checkbox editor_control_area" style={stateStyle}>
				{cb}
				{errorMessage}
			</div>
		);
	}
}

CheckboxControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
