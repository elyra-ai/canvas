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

describe("Test only single port is shown with enableSingleOutputPortDisplay set to true", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("multiPortsCanvas.json");
	});

	it("Test only one port is displayed", function() {
		// The node should initially have two ports.
		cy.verifyNumberOfPortsOnNode("Discard Fields", "output", 2);

		// After setting the config field, just one of the two ports
		// should be rendered.
		cy.setCanvasConfig({ "selectedSingleOutputPortDisplay": true });
		cy.wait(10);
		cy.verifyNumberOfPortsOnNode("Discard Fields", "output", 1);
	});
});
