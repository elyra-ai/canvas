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
import { Button } from "@carbon/react";
import { Settings16 } from "@carbon/icons-react";
import { formatMessage } from "./../../util/property-utils";
import Tooltip from "./../../../tooltip/tooltip.jsx";
import { cloneDeep } from "lodash";

import { MESSAGE_KEYS } from "./../../constants/constants";


import SubPanelInvoker from "./invoker.jsx";

export default class SubPanelCell extends React.Component {
	constructor(props) {
		super(props);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
	}

	onSubPanelHidden(applyChanges) {
		// on cancel reset back to original value
		if (!applyChanges) {
			this.props.controller.updatePropertyValue(this.props.propertyId, this.initialControlValue);
			this.props.controller.setErrorMessages(this.initialMessages);
			this.props.controller.setControlStates(this.initialStates);
		}
	}

	showSubPanel() {
		// sets the current value for parameter.  Used on cancel
		this.initialControlValue = cloneDeep(this.props.controller.getPropertyValue(this.props.propertyId));
		this.initialMessages = this.props.controller.getAllErrorMessages();
		this.initialStates = this.props.controller.getControlStates();
		this.subPanelInvoker.showSubDialog(this.props.title, this.props.panel, this.onSubPanelHidden);
	}

	render() {
		const tooltipId = "tooltip-subpanel-cell";
		const disabled = typeof this.props.disabled !== "undefined" ? this.props.disabled : false;
		const subPanelToolTip = formatMessage(this.props.controller.getReactIntl(),
			MESSAGE_KEYS.SUBPANEL_BUTTON_TOOLTIP);
		const applyLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL);
		return (

			<SubPanelInvoker ref={ (ref) => (this.subPanelInvoker = ref) }
				rightFlyout={this.props.rightFlyout}
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
				controller={this.props.controller}
			>
				<Tooltip
					id={tooltipId}
					tip={subPanelToolTip}
					direction="left"
					className="properties-tooltips icon-tooltip"
				>
					<Button
						className="properties-subpanel-button"
						kind="ghost"
						renderIcon={Settings16}
						onClick={this.showSubPanel}
						disabled={disabled}
						iconDescription={subPanelToolTip}
						hasIconOnly
					/>
				</Tooltip>
			</SubPanelInvoker>
		);
	}
}

SubPanelCell.propTypes = {
	label: PropTypes.string,
	title: PropTypes.string,
	panel: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object,
	rightFlyout: PropTypes.bool
};
