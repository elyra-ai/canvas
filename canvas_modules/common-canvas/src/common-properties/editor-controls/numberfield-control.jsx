/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { TextField } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

export default class NumberfieldControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)[0]
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		this.props.updateControlValue(this.props.control.name, evt.target.value);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	clearValue() {
		const that = this;
		this.setState({ controlValue: "" },
		function() {
			that.validateInput();
		});
	}

	render() {
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
			<div className={className} style={stateStyle}>
				<TextField {...stateDisabled}
					style={stateStyle}
					type="number"
					id={this.getControlID()}
					onBlur={this.validateInput}
					onFocus={this.clearValidateMsg}
					placeholder={this.props.control.additionalText}
					disabledPlaceholderAnimation
					onChange={this.handleChange}
					value={this.state.controlValue}
					numberInput="close"
					onChange={(e) => this.setState({ controlValue: e.target.value })}
					onReset={() => this.clearValue()}
				/>
				{errorMessage}
			</div>
		);
	}
}

NumberfieldControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
