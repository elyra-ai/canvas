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
import { Button } from "carbon-components-react";
import Tooltip from "../../../tooltip/tooltip.jsx";
import ISVG from "react-inlinesvg";

// TODO: remove comments
// toolbar buttons are ghost or icon buttons only

class TableButtons extends React.Component {
	constructor(props) {
		super(props);

		this.makeCustomButtonsPanel = this.makeCustomButtonsPanel.bind(this);
		this.customButtonIconCallback = this.customButtonIconCallback.bind(this);
	}

	makeCustomButtonsPanel(tableState, customButtons = []) {
		console.log("!!! tableState " + tableState);
		// TODO: disable buttons if table is disabled or if button is disabled
		const buttons = [];
		customButtons.forEach((buttonConfig) => {
			let customButton;
			if (buttonConfig.icon) {
				customButton = this.createCustomIconButton(buttonConfig);
			} else if (buttonConfig.carbonIcon) {
				customButton = this.createCarbonIconButton(buttonConfig);
			} else if (buttonConfig.label) {
				customButton = this.createLabelOnlyButton(buttonConfig);
			} else {
				// Invalid button
			}

			if (customButton) {
				if (buttonConfig.description) {
					customButton = this.createTooltipForButton(buttonConfig, customButton);
				}
				if (buttonConfig.divider && buttonConfig.divider === "before") {
					buttons.push(<div className="properties-custom-table-button-divider" key={`${buttonConfig.id}-divider`} />);
				}
				buttons.push(customButton);
				if (buttonConfig.divider && buttonConfig.divider === "after") {
					buttons.push(<div className="properties-custom-table-button-divider" key={`${buttonConfig.id}-divider`} />);
				}
			}
		});
		return buttons;
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

	customButtonOnClick(propertyId, buttonId) {
		const buttonHandler = this.props.controller.getHandlers().buttonHandler;
		if (buttonHandler) {
			buttonHandler({
				type: "custom_button",
				propertyId: propertyId,
				buttonId: buttonId
			});
		}
	}

	createLabelOnlyButton(buttonConfig) {
		return (<Button
			key={`properties-custom-table-button-${buttonConfig.id}`}
			className="properties-custom-table-button"
			onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
			size="small"
			kind="ghost"
		>
			{buttonConfig.label.text}
		</Button>);
	}

	createCustomIconButton(buttonConfig) {
		let icon;
		if (buttonConfig.icon.slice(buttonConfig.icon.length - 4) === ".svg") { // svg image
			icon = <ISVG className="properties-custom-table-button-icon bx--btn__icon" src={buttonConfig.icon} />;
		} else {
			icon = <img src={buttonConfig.icon} className="properties-custom-table-button-icon" />;
		}

		const label = buttonConfig.label ? buttonConfig.label.text : "";
		const buttonDescription = buttonConfig.description ? buttonConfig.description.text : "";
		return (<Button
			key={`properties-custom-table-button-${buttonConfig.id}`}
			className="properties-custom-table-button custom-icon"
			onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
			size="small"
			kind="ghost"
			hasIconOnly={label.length === 0}
			iconDescription={buttonDescription}
		>
			{label}
			{icon}
		</Button>);
	}

	createCarbonIconButton(buttonConfig) {
		const carbonIcon = this.customButtonIconCallback(buttonConfig.id, buttonConfig.carbonIcon);
		const buttonDescription = buttonConfig.description ? buttonConfig.description.text : "";
		if (buttonConfig.label) {
			return (<Button
				key={`properties-custom-table-button-${buttonConfig.id}`}
				className="properties-custom-table-button"
				onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
				size="small"
				kind="ghost"
				renderIcon={carbonIcon}
				iconDescription={buttonDescription}
			>
				{buttonConfig.label.text}
			</Button>);
		}
		return (<Button
			key={`properties-custom-table-button-${buttonConfig.id}`}
			className="properties-custom-table-button"
			onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
			size="small"
			kind="ghost"
			hasIconOnly
			renderIcon={carbonIcon}
			iconDescription={buttonDescription}
		/>);
	}

	createTooltipForButton(buttonConfig, button) {
		return (<Tooltip
			id={`${buttonConfig.id}-tooltip`}
			key={`properties-custom-table-button-${buttonConfig.id}-tooltip`}
			tip={buttonConfig.description.text}
			disable={false}
			className="properties-custom-table-button-tooltip icon-tooltip"
		>
			{button}
		</Tooltip>);
	}

	render() {
		return this.makeCustomButtonsPanel(this.props.tableState, this.props.customButtons);
	}
}

TableButtons.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	customButtons: PropTypes.array.isRequired,
	tableState: PropTypes.string
};

export default TableButtons;
