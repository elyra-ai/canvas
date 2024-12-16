/*
 * Copyright 2017-2025 Elyra Authors
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

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import * as ControlUtils from "./../../util/control-utils";
import { STATES, CARBON_ICONS } from "./../../constants/constants";
import { evaluateText } from "./../../util/property-utils.js";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import Icon from "./../../../icons/icon.jsx";
import { isEmpty } from "lodash";

class ActionPanel extends Component {
	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		const hidden = this.props.panelState === STATES.HIDDEN;
		const disabled = this.props.panelState === STATES.DISABLED;
		let label;
		if (this.props.panel.label) {
			let tooltip;
			if (this.props.panel.description && !isEmpty(this.props.panel.description.text)) {
				const dynamicDescriptionText = evaluateText(this.props.panel.description.text, this.props.controller);
				// If tooltip has a link, add propertyId in the link object
				if (this.props.panel.description.link) {
					this.props.panel.description.link.propertyId = { name: this.props.panel.id };
				}
				tooltip = (<Tooltip
					id={`tooltip-label-${this.props.panel.id}`}
					tip={dynamicDescriptionText}
					link={this.props.panel.description.link ? this.props.panel.description.link : null}
					tooltipLinkHandler={this.props.controller.getHandlers().tooltipLinkHandler}
					direction="bottom"
					disable={hidden || disabled}
					showToolTipOnClick
				>
					<Icon type={CARBON_ICONS.INFORMATION} className="properties-control-description-icon-info" />
				</Tooltip>);
			}
			label = (
				<div className={classNames("properties-label-container")}>
					<label className="properties-control-label">{this.props.panel.label}</label>
					{tooltip}
				</div>
			);
		}
		return (
			<div
				className={classNames(
					"properties-action-panel",
					{ "hide": hidden },
					{ "properties-control-nested-panel": this.props.panel.nestedPanel },
					className
				)}
				data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
				disabled={disabled}
			>
				{label}
				{this.props.children}
			</div>);
	}
}

ActionPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.array
	]),
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(ActionPanel);
