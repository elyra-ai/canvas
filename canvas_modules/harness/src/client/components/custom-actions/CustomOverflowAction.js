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
import { MenuItem, OverflowMenu, OverflowMenuItem, useFeatureFlag } from "@carbon/react";

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
		const isRight = this.data?.parameter_ref === "oneofselect-custom-action-right";
		const changeText = (val) => this.changeReadonlyText(val);

		// A small functional component so we can call useFeatureFlag (a hook).
		// It switches between v11 and v12 props/children based on which
		// OverflowMenu implementation is active.
		function OverflowMenuAdapter() {
			const v12 = useFeatureFlag("enable-v12-overflowmenu");
			if (v12) {
				// v12: use menuAlignment and MenuItem children
				return (
					<OverflowMenu
						aria-label="Overflow menu"
						size="sm"
						className="harness-custom-action"
						menuAlignment={isRight ? "bottom-end" : "bottom-start"}
					>
						<MenuItem className="overflow-menu-item" label="Menu item 1" onClick={() => changeText("Menu item 1")} />
						<MenuItem className="overflow-menu-item" label="Menu item 2" onClick={() => changeText("Menu item 2")} />
					</OverflowMenu>
				);
			}
			// v11: use flipped and OverflowMenuItem children
			return (
				<OverflowMenu
					aria-label="Overflow menu"
					size="sm"
					className="harness-custom-action"
					flipped={isRight}
				>
					<OverflowMenuItem className="overflow-menu-item" itemText="Menu item 1" onClick={() => changeText("Menu item 1")} />
					<OverflowMenuItem className="overflow-menu-item" itemText="Menu item 2" onClick={() => changeText("Menu item 2")} />
				</OverflowMenu>
			);
		}

		return (
			<div data-floating-menu-container style={{ position: "relative" }}>
				<OverflowMenuAdapter />
			</div>
		);
	}
}

export default CustomOverflowAction;
