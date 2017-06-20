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
	control: React.PropTypes.object
};
