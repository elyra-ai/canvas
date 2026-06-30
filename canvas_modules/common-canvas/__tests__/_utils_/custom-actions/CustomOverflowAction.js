/*
 * Copyright 2025 Elyra Authors
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
import { MenuButton, MenuItem } from "@carbon/react";

class CustomOverflowAction {
	static id() {
		return "harness-custom-overflow-action";
	}
	constructor(propertyId, controller, data) {
		this.propertyId = propertyId;
		this.controller = controller;
		this.data = data;
	}

	changeReadonlyText(val) {
		const propertyId = { name: "readonly_text" };
		this.controller.updatePropertyValue(propertyId, val);
	}

	renderAction() {
		const menuAlignment = this.data?.parameter_ref === "oneofselect-custom-action-right"
			? "bottom-end" : "bottom-start";
		return (
			<MenuButton
				label="Actions"
				size="sm"
				menuAlignment={menuAlignment}
				className="harness-custom-action"
			>
				<MenuItem label="Menu item 1" onClick={() => this.changeReadonlyText("Menu item 1")} />
				<MenuItem label="Menu item 2" onClick={() => this.changeReadonlyText("Menu item 2")} />
			</MenuButton>
		);
	}
}

export default CustomOverflowAction;
