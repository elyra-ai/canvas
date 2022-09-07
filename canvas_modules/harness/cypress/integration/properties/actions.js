/*
 * Copyright 2017-2022 Elyra Authors
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

	it("action image tooltip direction left", function() {
		// For "fall" image, tooltip_direction is set to "left" in paramDef
		cy.hoverOverActionImage("fall");
		cy.verifyTipDirectionForAction(
			"fall",
			"This is a long tooltip for action image. Adding this line makes it a multi-line tooltip.",
			"left"
		);
	});

	it("action image tooltip direction right", function() {
		// For "spring" image, tooltip_direction is set to "right" in paramDef
		cy.hoverOverActionImage("spring");
		cy.verifyTipDirectionForAction("spring", "Spring", "right");
	});

	it("action image tooltip direction top", function() {
		// For "summer" image, tooltip_direction is set to "top" in paramDef
		cy.hoverOverActionImage("summer");
		cy.verifyTipDirectionForAction("summer", "Summer", "top");
	});

	it("action image tooltip direction bottom", function() {
		// For "winter" image, tooltip_direction is set to "bottom" in paramDef
		cy.hoverOverActionImage("winter");
		cy.verifyTipDirectionForAction("winter", "Winter", "bottom");
	});

	it("When tooltip_direction is not specified, default direction is bottom", function() {
		// Click "Conditions" catgeory
		cy.get(".properties-category-title").eq(2)
			.click();
		// For "image_cond_hide" image, tooltip_direction is not specified
		cy.hoverOverActionImage("image_cond_hide");
		cy.verifyTipDirectionForAction("image_cond_hide", "Test visible image conditions.", "bottom");

		// For "image_cond_disable" image, tooltip_direction is not specified
		cy.hoverOverActionImage("image_cond_disable");
		cy.verifyTipDirectionForAction("image_cond_disable", "Test enable image conditions.", "bottom");
	});
});
