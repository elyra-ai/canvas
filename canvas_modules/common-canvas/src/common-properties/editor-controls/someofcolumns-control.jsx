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
import ReactDOM from "react-dom";

export default class SomeofcolumnsControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		const select = ReactDOM.findDOMNode(this.refs.input);
		const values = [].filter.call(select.options, function(o) {
			return o.selected;
		}).map(function(o) {
			return o.value;
		});
		this.setState({ controlValue: values });
		this.notifyValueChanged(this.props.control.name, values);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		var options = EditorControl.genColumnSelectOptions(this.props.dataModel.fields, this.state.controlValue, false);
		return (
			<FormControl id={this.getControlID()}
				componentClass="select"
				multiple name={this.props.control.name}
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

SomeofcolumnsControl.propTypes = {
	dataModel: React.PropTypes.object,
	control: React.PropTypes.object
};
