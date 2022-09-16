/*
 * Copyright 2022 Elyra Authors
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
// Base class for table controls

import React from "react";
import PropTypes from "prop-types";

import Toolbar from "../../../toolbar/toolbar";

import { STATES } from "./../../constants/constants";

class TableButtons extends React.Component {
	constructor(props) {
		super(props);

		this.getCustomButtonEnabled = this.getCustomButtonEnabled.bind(this);
		this.customButtonIconCallback = this.customButtonIconCallback.bind(this);
		this.customButtonOnClick = this.customButtonOnClick.bind(this);
		this.convertToolbarConfig = this.convertToolbarConfig.bind(this);
	}

	getCustomButtonEnabled(tableState, buttonConfig) {
		const tableDisabled = typeof tableState !== "undefined" && tableState === STATES.DISABLED;
		const buttonEnabled = this.props.customButtonsState && typeof this.props.customButtonsState[buttonConfig.id] !== "undefined"
			? this.props.customButtonsState[buttonConfig.id] // set to true in redux if enabled, override the default from uihints
			: buttonConfig.enabled || false; // fallback to default value
		return !tableDisabled && buttonEnabled;
	}

	customButtonIconCallback(buttonId, carbonIcon) {
		const buttonIconHandler = this.props.controller.getHandlers().buttonIconHandler;
		let icon;
		if (buttonIconHandler) {
			buttonIconHandler({
				type: "customButtonIcon",
				propertyId: this.props.propertyId,
				buttonId: buttonId,
				carbonIcon: carbonIcon
			}, (appIcon) => {
				icon = appIcon;
			});
		}
		return icon;
	}

	customButtonOnClick(buttonId) {
		const buttonHandler = this.props.controller.getHandlers().buttonHandler;
		if (buttonHandler) {
			buttonHandler({
				type: "custom_button",
				propertyId: this.props.propertyId,
				buttonId: buttonId
			});
		}
	}

	convertToolbarConfig(tableState, customButtons = []) {
		const toolbarConfig = [];
		customButtons.forEach((buttonConfig) => {
			const buttonEnabled = this.getCustomButtonEnabled(tableState, buttonConfig);
			const buttonDef = {
				action: buttonConfig.id,
				enable: buttonEnabled
			};

			if (buttonConfig.icon) {
				buttonDef.iconEnabled = buttonConfig.icon;
			} else if (buttonConfig.carbonIcon) {
				buttonDef.iconEnabled = this.customButtonIconCallback(buttonConfig.id, buttonConfig.carbonIcon);
			}

			if (buttonConfig.label) {
				buttonDef.label = buttonConfig.label.text;
				buttonDef.incLabelWithIcon = "before";
				buttonDef.kind = "ghost";
			}

			if (buttonConfig.description) {
				buttonDef.tooltip = buttonConfig.description.text;
			}

			if (buttonConfig.divider && buttonConfig.divider === "before") {
				toolbarConfig.push({ divider: true });
			}
			toolbarConfig.push(buttonDef);
			if (buttonConfig.divider && buttonConfig.divider === "after") {
				toolbarConfig.push({ divider: true });
			}
		});
		return toolbarConfig;
	}

	render() {
		const toolbarConfig = {
			leftBar: this.convertToolbarConfig(this.props.tableState, this.props.customButtons)
		};
		return (<div className="properties-custom-table-buttons">
			<Toolbar
				config={toolbarConfig}
				instanceId={0}
				size="sm"
				toolbarActionHandler={this.customButtonOnClick}
			/>
		</div>);
	}
}

TableButtons.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	customButtons: PropTypes.array.isRequired,
	tableState: PropTypes.string,
	customButtonsState: PropTypes.object, // set in by redux
	size: PropTypes.oneOf(["md", "sm", "lg"])
};

export default TableButtons;
