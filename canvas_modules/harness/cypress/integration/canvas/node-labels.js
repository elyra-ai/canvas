/*
 * Copyright 2021 Elyra Authors
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
// import * as testUtils from "../../utils/eventlog-utils";

describe("Test editing node labels - Vertical node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Vertical node - Test editing a single line centered node label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true, labelWidth: 200 } });
		cy.hoverOverNodeLabel("Binding (entry) node");
		cy.clickNodeLabelEditIcon("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "New Label Text");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New Label Text");
		cy.verifyNodeExists("New Label Text");
	});

	it("Vertical node - Test editing a single line centered node label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true, labelWidth: 200 } });
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "New Label Text");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New Label Text");
		cy.verifyNodeExists("New Label Text");
	});

	it("Vertical node - Test editing multiple line centered node label with a newline in the text", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			labelEditable: true, labelWidth: 200, labelHeight: 30, labelSingleLine: false } });
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "Binding\n(entry) node");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "Binding\n(entry) node");
		cy.verifyNodeExists("Binding\n(entry) node");
	});

	it("Vertical node - Test editing multiple line centered node label with a long node label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			labelEditable: true, labelWidth: 200, labelHeight: 30, labelSingleLine: false } });
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node",
			"This is a long label for the binding entry node");
		cy.verifyEditActionInConsole("setNodeLabel", "label",
			"This is a long label for the binding entry node");
		cy.verifyNodeExists(
			"This is a long label for the binding entry node");
	});

	it("Vertical node - Test editing the supernode label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true } });

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");

		cy.hoverOverNodeLabel("Super node");
		cy.clickNodeLabelEditIcon("Super node");

		cy.enterLabelForNode("Super node", "New supernode label");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New supernode label");
		cy.verifyNodeExists("New supernode label");
	});

});

describe("Test editing node labels - Horizontal node", function() {
	beforeEach(() => {
		cy.visit("/");
		cy.setCanvasConfig({ "selectedNodeFormatType": "Horizontal", "selectedNodeLayout": { labelEditable: true } });
		cy.openCanvasDefinition("allTypesCanvas.json");
	});

	it("Horizontal node - Test editing a single line centered node label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true, labelWidth: 200 } });
		cy.hoverOverNodeLabel("Binding (entry) node");
		cy.clickNodeLabelEditIcon("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "New Label Text");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New Label Text");
		cy.verifyNodeExists("New Label Text");
	});


	it("Horizontal node - Test editing multiple line centered node label with a long node label", function() {
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "New Label Text");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New Label Text");
		cy.verifyNodeExists("New Label Text");
	});

	it("Horizontal node - Test editing multiple line centered node label with a newline in the text", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			labelEditable: true, labelWidth: 200, labelHeight: 30, labelSingleLine: false } });
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node", "Binding\n(entry) node");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "Binding\n(entry) node");
		cy.verifyNodeExists("Binding\n(entry) node");
	});

	it("Horizontal node - Test editing multiple line centered node label with a long node label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": {
			labelEditable: true, labelWidth: 200, labelHeight: 30, labelSingleLine: false } });
		cy.doubleClickLabelOnNode("Binding (entry) node");
		cy.enterLabelForNode("Binding (entry) node",
			"This is a long label for the binding entry node");
		cy.verifyEditActionInConsole("setNodeLabel", "label",
			"This is a long label for the binding entry node");
		cy.verifyNodeExists(
			"This is a long label for the binding entry node");
	});

	it("Horizontal node - Test editing the supernode label", function() {
		cy.setCanvasConfig({ "selectedNodeLayout": { labelEditable: true } });

		cy.rightClickNode("Super node");
		cy.clickOptionFromContextMenu("Expand supernode");

		cy.hoverOverNodeLabel("Super node");
		cy.clickNodeLabelEditIcon("Super node");

		cy.enterLabelForNode("Super node", "New supernode label");
		cy.verifyEditActionInConsole("setNodeLabel", "label", "New supernode label");
		cy.verifyNodeExists("New supernode label");
	});

});
