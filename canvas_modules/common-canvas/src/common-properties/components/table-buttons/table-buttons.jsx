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
import Toolbar from "../../../toolbar/toolbar.jsx";

class TableButtons extends React.Component {
	constructor(props) {
		super(props);

		this.customButtonIconCallback = this.customButtonIconCallback.bind(this);
		this.customButtonOnClick = this.customButtonOnClick.bind(this);
		this.convertToolbarConfig = this.convertToolbarConfig.bind(this);
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
		// TODO if table disabled, all buttons disabled. Otherwise read from redux to see which button is disabled
		const toolbarConfig = [];
		customButtons.forEach((buttonConfig) => {
			const buttonDef = {
				action: buttonConfig.id,
				enable: true
			};

			if (buttonConfig.icon) {
				buttonDef.iconEnabled = buttonConfig.icon;
			} else if (buttonConfig.carbonIcon) {
				buttonDef.iconEnabled = this.customButtonIconCallback(buttonConfig.id, buttonConfig.carbonIcon);
			}

			if (buttonConfig.label) {
				buttonDef.label = buttonConfig.label.text;
				buttonDef.incLabelWithIcon = "before";
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
		return (<Toolbar
			config={toolbarConfig}
			instanceId={0}
			toolbarActionHandler={this.customButtonOnClick}
		/>);
	}
}

TableButtons.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	customButtons: PropTypes.array.isRequired,
	tableState: PropTypes.string
};

export default TableButtons;
