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

describe("Test of action image tooltip direction", function() {
	before(() => {
		cy.visit("/");
		cy.openPropertyDefinition("action_paramDef.json");
	});

	it("action image tooltip directions", function() {

		// Test: action image tooltip direction left
		// ------------------------------------------

		// For "fall" image, tooltip_direction is set to "left" in paramDef
		cy.hoverOverActionImage("fall");
		cy.verifyTip(null, "visible",
			"This is a long tooltip for action image. Adding this line makes it a multi-line tooltip.", "left");
		cy.hoverOverControl("weather-action-panel");
		cy.closeActionImageTooltip("fall");

		// Test: action image tooltip direction right
		// ------------------------------------------

		// For "spring" image, tooltip_direction is set to "right" in paramDef
		cy.hoverOverActionImage("spring");
		cy.verifyTip(null, "visible", "Spring", "right");
		cy.hoverOverControl("weather-action-panel");
		cy.closeActionImageTooltip("spring");


		// Test: action image tooltip direction top
		// ----------------------------------------

		// For "summer" image, tooltip_direction is set to "top" in paramDef
		cy.hoverOverActionImage("summer");
		cy.verifyTip(null, "visible", "Summer", "top");
		cy.hoverOverControl("weather-action-panel");
		cy.closeActionImageTooltip("summer");

		// Test: action image tooltip direction bottom
		// -------------------------------------------

		// For "winter" image, tooltip_direction is set to "bottom" in paramDef
		cy.hoverOverActionImage("winter");
		cy.verifyTip(null, "visible", "Winter", "bottom");
		cy.hoverOverControl("weather-action-panel");
		cy.closeActionImageTooltip("winter");

		// Test: "When tooltip_direction is not specified, default direction is bottom
		// ---------------------------------------------------------------------------

		// Click "Conditions" catgeory
		cy.get(".right-flyout-panel .cds--accordion__heading").eq(2)
			.click();
		// For "image_cond_hide" image, tooltip_direction is not specified
		cy.hoverOverActionImage("image_cond_hide");
		cy.verifyTip(null, "visible", "Test visible image conditions.", "bottom");
		cy.closeActionImageTooltip("image_cond_hide");

		// For "image_cond_disable" image, tooltip_direction is not specified
		cy.hoverOverActionImage("image_cond_disable");
		cy.verifyTip(null, "visible", "Test enable image conditions.", "bottom");
		cy.closeActionImageTooltip("image_cond_disable");
	});
});
