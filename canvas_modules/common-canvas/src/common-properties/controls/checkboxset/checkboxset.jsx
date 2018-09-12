/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import ControlUtils from "./../../util/control-utils";
import classNames from "classnames";
import ValidationMessage from "./../../components/validation-message";
import { STATES } from "./../../constants/constants.js";
import uuid4 from "uuid/v4";

class CheckboxsetControl extends React.Component {
	constructor(props) {
		super(props);
		this.uuid = uuid4();
	}

	handleChange(val, checked) {
		let values = this.props.controller.getPropertyValue(this.props.propertyId);
		if (typeof values === "undefined" || values === null) {
			values = [];
		}
		const index = values.indexOf(val);
		if (checked && index < 0) {
			// Add to values
			values = values.concat([val]);
		}
		if (!(checked) && index >= 0) {
			// Remove from values
			values.splice(index, 1);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, values);
	}

	render() {
		let controlValue = this.props.value;
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}
		const checkboxes = [];
		for (var i = 0; i < this.props.control.values.length; i++) {
			const id = {
				name: this.props.propertyId.name,
				row: i
			};
			const val = this.props.control.values[i];
			const checked = (controlValue.indexOf(val) >= 0);
			checkboxes.push(<Checkbox
				disabled={this.props.state === STATES.DISABLED}
				id={ControlUtils.getControlId(id, this.uuid)}
				key={val + i}
				labelText={this.props.control.valueLabels[i]}
				onChange={this.handleChange.bind(this, val)}
				checked={checked}
			/>);
		}
		return (
			<div className={classNames("properties-checkboxset", { "hide": this.props.state === STATES.HIDDEN })} data-id={ControlUtils.getDataId(this.props.propertyId)} >
				<div className="properties-checkboxset-container">
					{checkboxes}
				</div>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

CheckboxsetControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CheckboxsetControl);
