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
import { evaluateText } from "./../../util/property-utils.js";
import classNames from "classnames";
import { STATES, CARBON_ICONS } from "./../../constants/constants";
import { isEmpty } from "lodash";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import Icon from "./../../../icons/icon.jsx";

class TextPanel extends Component {
	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		const hidden = this.props.panelState === STATES.HIDDEN;
		const disabled = this.props.panelState === STATES.DISABLED;
		let label = this.props.panel.label ? (<div className="panel-label">{this.props.panel.label}</div>) : null;
		let description;
		if (this.props.panel.description && !isEmpty(this.props.panel.description.text)) {
			const dynamicDescriptionText = evaluateText(this.props.panel.description.text, this.props.controller);
			if (this.props.panel.description.placement === "as_tooltip") {
				// If tooltip has a link, add propertyId in the link object
				if (this.props.panel.description.link) {
					this.props.panel.description.link.propertyId = { name: this.props.panel.id };
				}
				const tooltip = (<Tooltip
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
				label = (
					<div className={classNames("properties-label-container")}>
						{label}
						{tooltip}
					</div>
				);
			} else {
				description = <div className="panel-description">{dynamicDescriptionText}</div>;
			}
		}
		return (
			<div
				className={classNames(
					"properties-text-panel",
					{ "hide": hidden },
					{ "properties-control-nested-panel": this.props.panel.nestedPanel },
					className
				)}
				disabled={disabled}
			>
				{label}
				{description}
			</div>);
	}
}

TextPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id }),
	propertyValues: ownProps.controller.getPropertyValues() // not used locally but needed to cause a rerender to evaluate text with a property value
});

export default connect(mapStateToProps, null)(TextPanel);
