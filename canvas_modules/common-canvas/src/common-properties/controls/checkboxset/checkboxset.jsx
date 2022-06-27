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
import { Checkbox } from "carbon-components-react";
import * as ControlUtils from "./../../util/control-utils";
import classNames from "classnames";
import ValidationMessage from "./../../components/validation-message";
import { v4 as uuid4 } from "uuid";
import { intersection, isEqual } from "lodash";
import { Information16 } from "@carbon/icons-react";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { STATES } from "./../../constants/constants.js";
import { isEmpty } from "lodash";


class CheckboxsetControl extends React.Component {
	constructor(props) {
		super(props);
		this.uuid = uuid4();
		this.handleChange = this.handleChange.bind(this);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
	}

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		// update property value if value isn't in current enum value.
		if (Array.isArray(this.props.value)) {
			const newValue = intersection(this.props.value, this.props.controlOpts.values);
			if (!isEqual(this.props.value, newValue)) {
				this.props.controller.updatePropertyValue(this.props.propertyId, newValue, skipValidateInput);
			}
		}
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
		const newValues = values.concat();
		this.props.controller.updatePropertyValue(this.props.propertyId, newValues);
	}

	render() {

		const hidden = this.props.state === STATES.HIDDEN;
		let controlValue = this.props.value;
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}
		const checkboxes = [];
		for (var i = 0; i < this.props.control.values.length; i++) {
			if (this.props.control.valueDescs && !this.props.tableControl) {
				tooltip = (
					<span >{this.props.control.valueDescs[i]}</span>
				);
			}
			const val = this.props.control.values[i];
			const disabled = this.props.state === STATES.DISABLED || !this.props.controlOpts.values.includes(val);
			let tooltipIcon = null;
			if (Array.isArray(this.props.control.valueDescs) && !isEmpty(this.props.control.valueDescs[i])) {
				tooltipIcon = (<Tooltip
					id={`tooltip-${this.uuid}-${i}`}
					tip={tooltip}
					direction="bottom"
					className="properties-tooltips"
					showToolTipOnClick
					disable={hidden || disabled}
				>
					<Information16 disabled={disabled} className="properties-control-description-icon-info" />
				</Tooltip>);
			}
			let tooltip = "";
			const id = {
				name: this.props.propertyId.name,
				row: i
			};
			const checked = (controlValue.indexOf(val) >= 0);
			checkboxes.push(<div className="checkbox-tooltip-container" key={ControlUtils.getControlId(id, this.uuid)}>
				<Checkbox
					disabled={disabled}
					id={ControlUtils.getControlId(id, this.uuid)}
					key={val + i}
					labelText={this.props.control.valueLabels[i]}
					onChange={this.handleChange.bind(this, val)}
					checked={checked}
				/>
				{tooltipIcon}
			</div>);
		}
		return (
			<fieldset>
				<legend>
					{this.props.controlItem}
				</legend>
				<div className={classNames("properties-checkboxset", { "hide": this.props.state === STATES.HIDDEN })} data-id={ControlUtils.getDataId(this.props.propertyId)} >
					<div className={classNames("properties-checkboxset-container", this.props.messageInfo ? this.props.messageInfo.type : null)}>
						{checkboxes}
					</div>
					<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
				</div>
			</fieldset>
		);
	}
}

CheckboxsetControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	controlOpts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array
	]), // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => {
	const props = {
		value: ownProps.controller.getPropertyValue(ownProps.propertyId),
		state: ownProps.controller.getControlState(ownProps.propertyId),
		messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
	};
	props.controlOpts = ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control);
	return props;
};

export default connect(mapStateToProps, null)(CheckboxsetControl);
