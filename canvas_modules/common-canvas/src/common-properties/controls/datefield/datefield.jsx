/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import TextInput from "carbon-components-react/lib/components/TextInput";
import ValidationMessage from "./../../components/validation-message";
import ControlUtils from "./../../util/control-utils";
import moment from "moment";
import { DEFAULT_DATE_FORMAT, STATES } from "./../../constants/constants.js";
import classNames from "classnames";
import PropertyUtils from "./../../util/property-utils.js";


class DatefieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
	}

	handleChange(evt) {
		let stringValue = null;

		if (evt.target.value) {
			const format = this.props.control.dateFormat || DEFAULT_DATE_FORMAT;
			const mom = moment.utc(evt.target.value, format, true);
			// Catch large year numbers which are parsed OK in the specified format
			// but cannot be parsed as the ISO format when being rendered.
			if (mom.isValid() && mom.year() < 10000) {
				stringValue = mom.format("YYYY-MM-DD"); // If moment is valid save as ISO format
			} else {
				stringValue = evt.target.value; // Otherwise just save as invalid entered string
			}
		} else {
			stringValue = null;
		}

		this.props.controller.updatePropertyValue(this.props.propertyId, stringValue);
	}

	render() {
		let displayValue = "";
		if (this.props.value) {
			const format = this.props.control.dateFormat || DEFAULT_DATE_FORMAT;
			const mom = moment.utc(this.props.value, moment.ISO_8601, true);

			if (mom.isValid()) {
				try {
					displayValue = mom.format(format);
				} catch (err) { // This will only happen if the caller provides something other than a string as the format.
					displayValue = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), "datetimefield.format.error.message");
				}
			} else {
				displayValue = this.props.value;
			}
		}
		const className = classNames("properties-datefield", "properties-input-control", { "hide": this.props.state === STATES.HIDDEN },
			this.props.messageInfo ? this.props.messageInfo.type : null);
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<TextInput
					autoComplete="off"
					id={this.id}
					disabled={this.props.state === STATES.DISABLED}
					placeholder={this.props.control.additionalText}
					onChange={this.handleChange.bind(this)}
					value={displayValue}
					labelText={this.props.control.label ? this.props.control.label.text : ""}
					hideLabel
				/>
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

DatefieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.string, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(DatefieldControl);
