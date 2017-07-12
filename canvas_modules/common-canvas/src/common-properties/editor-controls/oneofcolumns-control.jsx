/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { FormControl } from "react-bootstrap";
import EditorControl from "./editor-control.jsx";

export default class OneofcolumnsControl extends EditorControl {
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
		this.notifyValueChanged(this.props.control.name, evt.target.value);
		this.props.updateControlValue(this.props.control.name, evt.target.value);
	}

	getControlValue() {
		return [this.state.controlValue];
	}

	render() {
		var options = EditorControl.genColumnSelectOptions(this.props.dataModel.fields, [this.state.controlValue], true);

		return (
			<FormControl id={this.getControlID()}
				componentClass="select"
				name={this.props.control.name}
				help={this.props.control.additionalText}
				onChange={this.handleChange}
				value={this.state.controlValue}
				ref="input"
			>
				{options}
			</FormControl>
		);
	}
}

OneofcolumnsControl.propTypes = {
	dataModel: React.PropTypes.object,
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
