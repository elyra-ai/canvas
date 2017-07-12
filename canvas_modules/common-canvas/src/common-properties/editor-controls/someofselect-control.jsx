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
import ReactDOM from "react-dom";

export default class SomeofselectControl extends EditorControl {
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
		this.props.updateControlValue(this.props.control.name, values);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		var options = EditorControl.genSelectOptions(this.props.control, this.state.controlValue);

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

SomeofselectControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
