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
import TextArea from "carbon-components-react/lib/components/TextArea";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import { CHARACTER_LIMITS } from "./../../constants/constants.js";
import classNames from "classnames";

class TextareaControl extends React.Component {
	constructor(props) {
		super(props);
		this.charLimit = ControlUtils.getCharLimit(props.control, CHARACTER_LIMITS.TEXT_AREA);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(evt) {
		let value = evt.target.value;
		if (this.charLimit !== -1 && value) {
			value = value.substring(0, this.charLimit);
		}
		if (this.props.control.valueDef && this.props.control.valueDef.isList) { // array
			value = this.splitNewlines(value);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
	}

	splitNewlines(text) {
		if (text.length > 0) {
			const split = text.split("\n");
			if (Array.isArray(split)) {
				return split;
			}
			return [split];
		}
		return [];
	}

	joinNewlines(list) {
		if (Array.isArray(list)) {
			return list.length === 0 ? "" : list.join("\n");
		}
		return list;
	}

	render() {
		let value = this.props.value ? this.props.value : "";
		value = this.joinNewlines(value);

		const className = classNames("properties-textarea", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<TextArea
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={value}
					labelText={this.props.control.label ? this.props.control.label.text : ""}
					hideLabel
				/>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>

		);
	}
}

TextareaControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.array
	]), // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(TextareaControl);
