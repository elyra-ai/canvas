/*
 * Copyright 2017-2020 IBM Corporation
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
import { Icon, Toggle, ToggleSmall } from "carbon-components-react";
import { connect } from "react-redux";

class CustomToggleCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(checked) {
		this.props.controller.updatePropertyValue(this.props.propertyId, checked);
		if (checked) {
			this.props.controller.updateControlEnumValues({ name: "colors" },
				[{ value: "green", label: "Green" }, { value: "yellow", label: "Yellow" }]);
		} else {
			this.props.controller.updateControlEnumValues({ name: "colors" },
				[{ value: "blue", label: "Blue" }, { value: "red", label: "Red" }, { value: "black", label: "Black" }]);
		}
	}
	render() {
		let messageText;
		let icon;
		if (this.props.messageInfo && this.props.messageInfo.text && !this.props.table) {
			messageText = this.props.messageInfo.text;
			if (this.props.messageInfo.type === "warning") {
				icon = (<Icon className="warning" name="warning--glyph" />);
			} else if (this.props.messageInfo.type === "error") {
				icon = (<Icon className="error" name="error--glyph" />);
			}
		}
		let visibility;
		let disabled = false;
		if (this.props.state === "hidden") {
			visibility = { visibility: "hidden" };
		} else if (this.props.state === "disabled") {
			disabled = true;
		}
		let id = this.props.propertyId.name;
		if (typeof this.props.propertyId.row !== "undefined") {
			id += "_" + this.props.propertyId.row;
			if (typeof this.props.propertyId.col !== "undefined") {
				id += "_" + this.props.propertyId.col;
			}
		}
		let toggle = (
			<Toggle
				disabled={disabled}
				id={id}
				toggled={this.props.controlValue}
				onToggle={this.handleChange}
			/>
		);
		if (this.props.table) {
			toggle = (<ToggleSmall
				disabled={disabled}
				id={id}
				toggled={this.props.controlValue}
				onToggle={this.handleChange}
				aria-label={"toggle"}
			/>);
		}
		return (
			<div style={visibility}>
				<div className="custom-toggle" >
					{toggle}
				</div>
				<div className="condition">
					<div className="icon">{icon}</div>
					<div>{messageText}</div>
				</div>
			</div>
		);
	}
}

CustomToggleCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	table: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	controlValue: PropTypes.bool, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomToggleCtrl);
