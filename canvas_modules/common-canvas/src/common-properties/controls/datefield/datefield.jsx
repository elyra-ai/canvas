/*
 * Copyright 2017-2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { DatePicker, DatePickerInput } from "carbon-components-react";
import classNames from "classnames";
import { parse, format } from "date-fns";

import * as ControlUtils from "./../../util/control-utils";
import { DEFAULT_DATE_FORMAT, STATES } from "./../../constants/constants";

class DatefieldControl extends React.Component {
	constructor(props) {
		super(props);
		this.id = ControlUtils.getControlId(this.props.propertyId);
		this.getDateFormat = this.getDateFormat.bind(this);
		this.getDateFormat = this.getDateFormat.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	/*
	* flatpickr (used by carbon) date formats
	*/
	getCarbonDateFormat() {
		let dateFormat = this.props.control.dateFormat || DEFAULT_DATE_FORMAT;
		while ((dateFormat.match(/y/g) || []).length > 1) {
			dateFormat = dateFormat.replace("y", "");
		}
		while ((dateFormat.match(/Y/g) || []).length > 1) {
			dateFormat = dateFormat.replace("Y", "");
		}
		while ((dateFormat.match(/m/g) || []).length > 1) {
			dateFormat = dateFormat.replace("m", "");
		}
		while ((dateFormat.match(/M/g) || []).length > 1) {
			dateFormat = dateFormat.replace("M", "");
		}
		dateFormat = dateFormat.replaceAll("D", "d"); // never format to day of the week
		while ((dateFormat.match(/d/g) || []).length > 1) {
			dateFormat = dateFormat.replace("d", "");
		}
		return dateFormat;
	}

	/*
	* date-fns date format
	*/
	getDateFormat() {
		let dateFormat = this.props.control.dateFormat || DEFAULT_DATE_FORMAT;
		dateFormat = dateFormat.replaceAll("Y", "y").replaceAll("D", "d");
		return dateFormat;
	}

	handleChange(dateArray) {
		let stringValue = null;
		const date = dateArray[0];
		if (date) {
			stringValue = format(date, this.getDateFormat());
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, stringValue);
	}

	render() {
		let date = this.props.value;
		if (date) {
			date = parse(this.props.value, this.getDateFormat(), new Date());
		}
		const className = classNames("properties-datefield", { "hide": this.props.state === STATES.HIDDEN });
		return (
			<div className={className} data-id={ControlUtils.getDataId(this.props.propertyId)}>
				<DatePicker
					datePickerType="single"
					dateFormat={this.getCarbonDateFormat()}
					light={this.props.controller.getLight()}
					disabled={this.props.state === STATES.DISABLED}
					locale={this.props.controller.getReactIntl().locale}
					value={date}
					onChange={this.handleChange.bind(this)}
				>
					<DatePickerInput
						id={this.id}
						labelText={this.props.controlItem}
						hideLabel={this.props.tableControl}
						disabled={this.props.state === STATES.DISABLED}
						placeholder={this.props.control.additionalText}
					/>
				</DatePicker>
			</div>
		);
	}
}

DatefieldControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.string // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(DatefieldControl);
