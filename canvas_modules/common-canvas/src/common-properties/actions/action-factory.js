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

import ButtonAction from "./button";
import ImageAction from "./image";
import { ActionType } from "./../constants/form-constants";
import classNames from "classnames";
import { getDataId } from "./../util/control-utils";


export default class ActionFactory {

	constructor(controller) {
		this.controller = controller;
	}
	// Retrieve icon for action button, with a new type "actionButtonIcon"
	actionButtonIconCallback(buttonId, data) {
		const buttonIconHandler = this.controller.getHandlers().buttonIconHandler;
		const propertyId = { name: data.data.parameter_ref };
		let icon;
		if (buttonIconHandler) {
			buttonIconHandler({
				type: "actionButtonIcon",
				propertyId: propertyId,
				buttonId: buttonId,
				data: data
			}, (appIcon) => {
				icon = appIcon;
			}
			);
		}
		return icon;

	}
	generateAction(key, action) {
		if (action) {
			if (action.actionType === ActionType.BUTTON) {
				let actionButton;
				if (action.name === "iconButton") {
					actionButton = (
						<ButtonAction
							key={"action." + key}
							action={action}
							controller={this.controller}
							buttonIconHandler={this.actionButtonIconCallback.bind(this)}
							tooltipDirection={action.data.tooltipDirection}
						/>
					);
				} else {
					actionButton = (
						<ButtonAction
							key={"action." + key}
							action={action}
							controller={this.controller}
						/>
					);
				}
				return actionButton;
			} else if (action.actionType === ActionType.IMAGE) {
				return (
					<ImageAction
						key={"action." + key}
						action={action}
						controller={this.controller}
					/>
				);
			} else if (action.actionType === ActionType.CUSTOM) {
				const propertyId = this.controller.convertPropertyId(action.name);
				return (
					<div
						className={classNames("properties-custom-action", action.className)}
						data-id={getDataId(propertyId)}
					>
						{this.controller.getCustomAction(action)}
					</div>
				);
			}
		}
		return null;
	}
}
