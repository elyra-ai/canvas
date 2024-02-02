/*
 * Copyright 2017-2023 Elyra Authors
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
import { Slider } from "carbon-components-react";
import { connect } from "react-redux";
import classNames from "classnames";
import { v4 as uuid4 } from "uuid";

import * as ControlUtils from "../../util/control-utils";
import ValidationMessage from "../../components/validation-message";
import { STATES } from "../../constants/constants";


class SliderControl extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.uuid = uuid4();
	}

	handleChange(e) {
		this.props.controller.updatePropertyValue(this.props.propertyId, e.value);
	}

	render() {
		const minLabel = this.props.controller.getResource(`${this.props.control.name}.min.label`, null);
		const maxLabel = this.props.controller.getResource(`${this.props.control.name}.max.label`, null);
		const minValue = this.props.control.minValue ? this.props.control.minValue : 0;
		const maxValue = this.props.control.maxValue ? this.props.control.maxValue : 10;
		const step = this.props.control.increment ? this.props.control.increment : 1;
		const validationProps = ControlUtils.getValidationProps(this.props.messageInfo, this.props.tableControl);

		return (
			<div className={classNames("properties-slider ", { "hide": this.props.state === STATES.HIDDEN },
				this.props.messageInfo ? this.props.messageInfo.type : null)} data-id={ControlUtils.getDataId(this.props.propertyId)}
			>
				<Slider
					{...validationProps}
					value={this.props.value}
					min={minValue}
					max={maxValue}
					step={step}
					labelText={this.props.controlItem}
					onChange={this.handleChange}
					disabled={this.props.state === STATES.DISABLED}
					light={this.props.controller.getLight() && this.props.control.light}
					formatLabel={
						(val) => {
							let label = "";
							if (val === minValue && minLabel) {
								label = minLabel;
							} else if (val === minValue && !minLabel) {
								label = minValue;
							}
							if (val === maxValue && maxLabel) {
								label = maxLabel;
							} else if (val === maxValue && !maxLabel) {
								label = maxValue;
							}
							// Truncate Label if its too long to fit if the editor is small
							if (label.length > 8) {
								return label.slice(0, 5) + "...";
							}
							return label;
						}
					}
				/>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={this.props.tableControl} />
			</div>
		);
	}
}

SliderControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]), // list control passes string
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.number, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};


const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	valueStates: ownProps.controller.getControlValueStates(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	controlOpts: ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control)
});

export default connect(mapStateToProps, null)(SliderControl);

