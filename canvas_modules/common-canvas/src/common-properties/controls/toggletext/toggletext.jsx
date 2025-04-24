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
import { connect } from "react-redux";
import { Button } from "@carbon/react";
import ValidationMessage from "./../../components/validation-message";
import * as ControlUtils from "./../../util/control-utils";
import { formatMessage } from "./../../util/property-utils";
import { STATES, MESSAGE_KEYS } from "./../../constants/constants.js";
import classNames from "classnames";
import Isvg from "react-inlinesvg";

class ToggletextControl extends React.Component {
	constructor(props) {
		super(props);
		this.reactIntl = props.controller.getReactIntl();
		this.valuesMap = {};
		this.iconsMap = {};
		for (let i = 0; i < props.control.values.length; ++i) {
			this.valuesMap[props.control.values[i]] = props.control.valueLabels[i];
			if (typeof props.control.valueIcons !== "undefined") {
				this.iconsMap[props.control.values[i]] = props.control.valueIcons[i];
			}
		}
	}

	onClick(evt) {
		const renderValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const newValue = (renderValue === this.props.control.values[0]) ? this.props.control.values[1] : this.props.control.values[0];
		this.props.controller.updatePropertyValue(this.props.propertyId, newValue);

	}

	renderIcon() {
		let icon = null;
		if (typeof this.iconsMap[this.props.value] !== "undefined") {
			const imgSource = this.iconsMap[this.props.value];
			if (typeof imgSource === "string" && imgSource.slice(imgSource.length - 4) === ".svg") {
				// svg image
				icon = <Isvg className="cds--btn__icon" src={imgSource} />;
			} else {
				icon = (<img
					className="cds--btn__icon"
					src={imgSource}
					alt=""
				/>);
			}
		}
		return icon;
	}

	render() {
		let rendered = this.valuesMap[this.props.value];
		if (typeof rendered === "undefined") {
			rendered = this.props.value;
		}
		let button = null;
		const buttonType = this.props.tableControl ? "ghost" : "tertiary";
		if (typeof rendered !== "undefined") {
			button = (
				<Button
					kind={buttonType}
					size="sm"
					onClick={this.onClick.bind(this)}
					renderIcon={this.renderIcon.bind(this)}
					iconDescription={formatMessage(this.reactIntl, MESSAGE_KEYS.TOGGLETEXT_ICON_DESCRIPTION, { toggletext_label: this.props.value })}
					disabled={this.props.state === STATES.DISABLED}
				>
					{rendered}
				</Button>
			);
		}

		const className = classNames("properties-toggletext", { "hide": this.props.state === STATES.HIDDEN }, this.props.messageInfo ? this.props.messageInfo.type : null);

		return (
			<div
				className={className}
				disabled={this.props.state === STATES.DISABLED}
				data-id={ControlUtils.getDataId(this.props.propertyId)}
			>
				{this.props.tableControl ? null : this.props.controlItem}
				{button}
				<ValidationMessage inTable={this.props.tableControl} state={this.props.state} messageInfo={this.props.messageInfo} />
			</div>
		);
	}
}

ToggletextControl.propTypes = {
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	controlItem: PropTypes.element,
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

export default connect(mapStateToProps, null)(ToggletextControl);
