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
import SubPanelButton from "../editor-panels/sub-panel-button.jsx";

var _ = require("underscore");

export default class StructureeditorControl extends EditorControl {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: JSON.parse(props.valueAccessor(props.control.name)[0]),
			subControlId: "___" + props.control.name + "_"
		};

		this.getControlValue = this.getControlValue.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getEditingValue = this.getEditingValue.bind(this);
		this.stopEditing = this.stopEditing.bind(this);
	}

	handleChange(evt) {
		this.setState({ controlValue: evt.target.value });
		this.notifyValueChanged(this.props.control.name, evt.target.value);
		this.props.updateControlValue(this.props.control.name, JSON.stringify(evt.target.value));
	}

	getControlValue() {
		return [JSON.stringify(this.state.controlValue)];
	}

	indexOfColumn(controlId) {
		return _.findIndex(this.props.control.subControls, function(columnControl) {
			return columnControl.name === controlId;
		});
	}

	getEditingValue(controlId) {
		const col = this.indexOfColumn(controlId);
		const columnControl = this.props.control.subControls[col];
		// List are represented as JSON format strings so need to convert those
		// to an array of strings
		const value = this.state.controlValue[col];
		if (columnControl.valueDef.isList === true) {
			return JSON.parse(value);
		}
		return [value];
	}

	stopEditing(applyChanges) {
		if (applyChanges) {
			const allValues = this.state.controlValue;

			for (var i = 0; i < this.props.control.subControls.length; i++) {
				if (i !== this.props.control.keyIndex) {
					const columnControl = this.props.control.subControls[i];
					const lookupKey = this.state.subControlId + columnControl.name;
					// console.log("Accessing sub-control " + lookupKey);
					const control = this.refs[lookupKey];
					// console.log(control);
					if (typeof control !== "undefined") {
						// Assume the control is
						const controlValue = columnControl.valueDef.isList
							? JSON.stringify(control.getControlValue())
							: control.getControlValue()[0];
						allValues[i] = controlValue;
					}
				}
			}

			this.setState({ controlValue: allValues });
		}
	}

	render() {
		const subItemButton = this.props.buildUIItem(this.state.subControlId, this.props.control.childItem, this.state.subControlId, this.getEditingValue, this.props.dataModel);

		// Hack to attach our own editing notifiers which involves decomposing
		// the original button into our own button.
		const newButton = (<SubPanelButton label={subItemButton.props.label}
			title={subItemButton.props.title}
			panel={subItemButton.props.panel}
			notifyFinishedEditing={this.stopEditing}
		/>);

		return (
			<span>
				<TextField readOnly
					type="text"
					id={this.getControlID()}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange}
					value={this.state.controlValue}
				/>
				{newButton}
			</span>
		);
	}
}

StructureeditorControl.propTypes = {
	control: React.PropTypes.object,
	updateControlValue: React.PropTypes.func
};
