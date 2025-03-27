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
import classNames from "classnames";
import { STATES, CARBON_ICONS, MESSAGE_KEYS } from "./../../constants/constants.js";
import { ControlType } from "./../../constants/form-constants";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { isEmpty, get } from "lodash";
import Icon from "./../../../icons/icon.jsx";
import ActionFactory from "./../../actions/action-factory.js";
import { formatMessage } from "./../../util/property-utils";

class ControlItem extends React.Component {
	constructor(props) {
		super(props);
		this.actionFactory = new ActionFactory(this.props.controller);
		this.showRequiredIndicator = props.controller ? get(props.controller.getPropertiesConfig(), "showRequiredIndicator", true) : true;
	}

	render() {
		if (this.props.control.controlType === ControlType.HIDDEN) {
			return null;
		}
		const hidden = this.props.state === STATES.HIDDEN;
		const disabled = this.props.state === STATES.DISABLED;

		let label;
		let description;
		if (this.props.control.label && this.props.control.labelVisible !== false) {
			let tooltip;
			if (this.props.control.description && !isEmpty(this.props.control.description.text)) {
				if (this.props.control.description.placement === "on_panel") {
					description = <div className="properties-control-description">{this.props.control.description.text}</div>;
				// only show tooltip when control enabled and visible
				} else {
					// If tooltip has a link, add propertyId in the link object
					if (this.props.control.description.link) {
						this.props.control.description.link.propertyId = this.props.propertyId;
					}
					tooltip = (<Tooltip
						id={`tooltip-label-${this.props.control.name}`}
						tip={this.props.control.description.text}
						link={this.props.control.description.link ? this.props.control.description.link : null}
						tooltipLinkHandler={this.props.controller.getHandlers().tooltipLinkHandler}
						direction="bottom"
						disable={hidden || disabled}
						showToolTipOnClick
					>
						<Icon type={CARBON_ICONS.INFORMATION} className="properties-control-description-icon-info" />
					</Tooltip>);
				}
			}
			let indicator;
			if (this.showRequiredIndicator && this.props.control.required) {
				indicator = (
					<span className="properties-indicator" aria-disabled={disabled}>
						{formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.LABEL_INDICATOR_REQUIRED)}
					</span>
				);
			} else if (!this.showRequiredIndicator && !("required" in this.props.control)) {
				indicator = (
					<span className="properties-indicator" aria-disabled={disabled}>
						{formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.LABEL_INDICATOR_OPTIONAL)}
					</span>
				);
			}
			label = (
				<div className={classNames("properties-label-container", { "table-control": this.props.tableControl === true })}>
					<label className="properties-control-label" aria-disabled={disabled}>{this.props.control.label.text}</label>
					{indicator}
					{tooltip}
				</div>);
		} else {
			// Provide a label for controls with hidden labels to support accessibility
			label = (
				<div className={classNames("properties-label-container-hidden")}>
					<label className="properties-control-label-hidden">{this.props.control?.label?.text}</label>
				</div>);
		}

		const action = this.actionFactory.generateAction(0, this.props.control.action);

		const className = classNames("properties-control-item", { "hide": hidden }, { "properties-ci-action-item": action });

		/*
		* <ControlItem /> should be called from every control.
		* Adding this temporary condition so that we can change one control at a time.
		* After all controls are updated, remove if condition and delete return statement after if condition
		*/
		if (this.props.accessibleControls.includes(this.props.control.controlType)) {
			return (
				<div data-id={"properties-ci-" + this.props.control.name}
					className={className} disabled={disabled}
				>
					{label}
					{description}
				</div>
			);
		}
		return (
			<div data-id={"properties-ci-" + this.props.control.name}
				className={className} disabled={disabled}
			>
				<div className="properties-ci-content-container">
					{label}
					{description}
					{this.props.controlObj}
				</div>
				{action}
			</div>
		);
	}
}

ControlItem.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	controlObj: PropTypes.object,
	accessibleControls: PropTypes.array, // TODO: Remove this after all controls are accessible
	tableControl: PropTypes.bool,
	state: PropTypes.string // passed by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getControlState(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(ControlItem);
