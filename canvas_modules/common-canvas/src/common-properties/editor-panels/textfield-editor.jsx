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

export default class TextfieldEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.initialValue
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
	}

	render() {
		return (<TextField
			type="text"
			id="textfield-editor"
			onChange={this.handleChange}
			value={this.state.controlValue}
		/>);
	}
}

TextfieldEditor.propTypes = {
	initialValue: React.PropTypes.string
};
