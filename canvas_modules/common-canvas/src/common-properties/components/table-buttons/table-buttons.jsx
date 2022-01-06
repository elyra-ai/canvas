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
			const buttonDescription = buttonConfig.description ? buttonConfig.description.text : "";
			if (buttonConfig.icon) {
				let icon;
				if (buttonConfig.icon.slice(buttonConfig.icon.length - 4) === ".svg") { // svg image
					icon = <ISVG className="properties-custom-table-button-icon bx--btn__icon" src={buttonConfig.icon} />;
				} else {
					icon = <img src={buttonConfig.icon} className="properties-custom-table-button-icon" />;
				}

				const label = buttonConfig.label ? buttonConfig.label.text : "";
				customButton = (<Button
					key={`properties-custom-table-button-${buttonConfig.id}`}
					className="properties-custom-table-button"
					onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
					size="small"
					kind="ghost"
					iconDescription={buttonDescription}
				>
					{icon}
					{label}
				</Button>);

				if (buttonConfig.description) {
					customButton = (<Tooltip
						id={`${buttonConfig.id}-tooltip`}
						key={`properties-custom-table-button-${buttonConfig.id}-tooltip`}
						tip={buttonConfig.description.text}
						disable={false}
						className="properties-custom-table-button-tooltip icon-tooltip"
					>
						{customButton}
					</Tooltip>);
				}
			} else if (buttonConfig.carbonIcon) {
				const carbonIcon = this.customButtonIconCallback(buttonConfig.id, buttonConfig.carbonIcon);
				if (buttonConfig.label) {
					customButton = (<Button
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
				} else {
					customButton = (<Button
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

				if (buttonConfig.description) {
					customButton = (<Tooltip
						id={`${buttonConfig.id}-tooltip`}
						key={`properties-custom-table-button-${buttonConfig.id}-tooltip`}
						tip={buttonConfig.description.text}
						disable={false}
						className="properties-custom-table-button-tooltip icon-tooltip"
					>
						{customButton}
					</Tooltip>);
				}
			} else if (buttonConfig.label) {
				customButton = (<Button
					key={`properties-custom-table-button-${buttonConfig.id}`}
					className="properties-custom-table-button"
					onClick={this.customButtonOnClick.bind(this, this.props.propertyId, buttonConfig.id)}
					size="small"
					kind="ghost"
					iconDescription={buttonDescription}
				>
					{buttonConfig.label.text}
				</Button>);

				if (buttonConfig.description) {
					customButton = (<Tooltip
						id={`${buttonConfig.id}-tooltip`}
						key={`properties-custom-table-button-${buttonConfig.id}-tooltip`}
						tip={buttonConfig.description.text}
						disable={false}
						className="properties-custom-table-button-tooltip icon-tooltip"
					>
						{customButton}
					</Tooltip>);
				}
			} else {
				// Invalid button
			}

			if (customButton) {
				buttons.push(customButton);
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
