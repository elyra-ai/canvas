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
import { TextField } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

export default class PasswordControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)[0]
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		this.props.updateControlValue(this.props.control.name, evt.target.value);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		let className = "editor_control_area";
		var errorMessage = <div className="validation-error-message" style={{ "marginTop": "0px" }}></div>;
		if (this.state.validateErrorMessage && this.state.validateErrorMessage.text !== "") {
			className += " error-border";
			errorMessage = (
				<div className="validation-error-message" style={{ "marginTop": "20px" }}>
					<p className="form__validation" style={{ "display": "block" }}>
						<span className="form__validation--invalid">{this.state.validateErrorMessage.text}</span>
					</p>
				</div>
			);
		}

		return (
		<div className={className}>
			<TextField type="password"
				id={this.getControlID()}
				placeholder={this.props.control.additionalText}
				onChange={this.handleChange}
				onBlur={this.validateInput}
				value={this.state.controlValue}
			/>
			{errorMessage}
		</div>);
	}
}

PasswordControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
