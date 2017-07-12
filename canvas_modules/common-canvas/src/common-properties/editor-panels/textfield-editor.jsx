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
