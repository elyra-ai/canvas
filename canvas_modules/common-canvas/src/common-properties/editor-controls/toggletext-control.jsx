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

export default class ToggletextControl extends React.Component {
	constructor(props) {
		super(props);
		this.valuesMap = {};
		this.iconsMap = {};
		for (let i = 0; i < this.props.columnDef.values.length; ++i) {
			this.valuesMap[this.props.columnDef.values[i]] = this.props.columnDef.valueLabels[i];
			if (typeof this.props.columnDef.valueIcons !== "undefined") {
				this.iconsMap[this.props.columnDef.values[i]] = this.props.columnDef.valueIcons[i];
			}
		}
	}

	onClick(evt) {
		evt.stopPropagation();
		const newValue = (this.props.value === this.props.columnDef.values[0]) ? this.props.columnDef.values[1] : this.props.columnDef.values[0];
		var newControlValue = this.props.controlValue;
		newControlValue[this.props.rowIndex][this.props.columnIndex] = newValue;
		this.props.setCurrentControlValue(this.props.control.name, newControlValue, this.props.updateControlValue);
	}

	render() {
		let rendered = this.valuesMap[this.props.value];
		if (typeof rendered === "undefined") {
			rendered = this.props.value;
		}

		let icon = "";
		if (typeof this.iconsMap[this.props.value] !== "undefined") {
			icon = <img src={this.iconsMap[this.props.value]} />;
		}

		return (
			<div className="toggletext_control"
				onClick={this.onClick.bind(this)}
			>
				{icon}
				{rendered}
			</div>
		);
	}
}

ToggletextControl.propTypes = {
	rowIndex: React.PropTypes.number,
	columnIndex: React.PropTypes.number,
	control: React.PropTypes.object,
	controlValue: React.PropTypes.array,
	columnDef: React.PropTypes.object,
	value: React.PropTypes.string,
	updateControlValue: React.PropTypes.func,
	setCurrentControlValue: React.PropTypes.func
};
