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

// import logger from "../../../utils/logger";
import React from "react";
import { Checkbox } from "ap-components-react/dist/ap-components-react";
import EditorControl from "./editor-control.jsx";

export default class CheckboxsetControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: props.valueAccessor(props.control.name)
		};
		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(evt) {
		// logger.info("CheckboxsetControl.handleChange()");
		// logger.info(evt.target);
		// logger.info(evt.target.id);
		// logger.info(evt.target.checked);

		var values = this.state.controlValue;
		var index = values.indexOf(evt.target.id);

		// logger.info("Checkboxset: orig values");
		// logger.info(values);
		// logger.info(index);

		if (evt.target.checked && index < 0) {
			// Add to values
			values = values.concat(evt.target.id);
		}
		if (!(evt.target.checked) && index >= 0) {
			// Remove from values
			values.splice(index, 1);
		}
		// logger.info("Checkboxset: new values");
		// logger.info(values);

		this.setState({ controlValue: values });
		this.notifyValueChanged(this.props.control.name, values);
		this.props.updateControlValue(this.props.control.name, values);
	}

	getControlValue() {
		return this.state.controlValue;
	}

	render() {
		var buttons = [];

		for (var i = 0; i < this.props.control.values.length; i++) {
			var val = this.props.control.values[i];
			var checked = (this.state.controlValue.indexOf(val) >= 0);
			buttons.push(<Checkbox ref={val}
				id={val}
				name={this.props.control.valueLabels[i]}
				onChange={this.handleChange}
				checked={checked}
			/>);
		}

		return (
			<div id={this.getControlID()} className="checkbox">{buttons}</div>
		);
	}
}

CheckboxsetControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
