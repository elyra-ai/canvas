/*
 * Copyright 2017-2026 Elyra Authors
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

import { expect } from "chai";
import { fireEvent, cleanup } from "@testing-library/react";
import sinon from "sinon";

import propertyUtilsRTL from "../../../_utils_/property-utilsRTL";
import structureListEditorParamDef from "test-resources/shared/param-defs/structureListEditor_paramDef.json";

const PROPERTY_ID = { name: "nestedStructurelisteditor" };

/**
 * Render CommonProperties with a structurelisteditor paramDef and an optional
 * editModalHandler spy, then open the summary panel that contains sub-panel
 * edit buttons. Returns the rendered wrapper, controller, and the opened
 * summary panel element.
 */
function renderWithHandler(editModalHandler) {
	const callbacks = editModalHandler ? { editModalHandler } : {};
	const renderedObject = propertyUtilsRTL.flyoutEditorForm(structureListEditorParamDef, null, callbacks);
	// nested-structurelisteditor-summary-panel has pre-populated rows with sub-panel edit buttons
	const summaryPanel = propertyUtilsRTL.openSummaryPanel(renderedObject.wrapper, "nested-structurelisteditor-summary-panel");
	return { wrapper: renderedObject.wrapper, controller: renderedObject.controller, summaryPanel };
}

/**
 * Find the first sub-panel edit button inside the given element.
 */
function getFirstEditButton(element) {
	return element.querySelector("button.properties-subpanel-button");
}

/**
 * Click the edit button to open the sub-panel flyout, then return the OK and
 * Cancel buttons rendered inside it. Opening the sub-panel from within an
 * already-open flyout means there are now two sets of Apply/Cancel buttons —
 * the outer flyout's and the sub-panel's. The sub-panel's are always last in
 * the DOM, so we take the last match.
 */
function openSubPanelAndGetButtons(summaryPanel) {
	const editButton = getFirstEditButton(summaryPanel);
	fireEvent.click(editButton);
	const applyButtons = document.querySelectorAll("button.properties-apply-button");
	const cancelButtons = document.querySelectorAll("button.properties-cancel-button");
	const applyButton = applyButtons[applyButtons.length - 1];
	const cancelButton = cancelButtons[cancelButtons.length - 1];
	return { applyButton, cancelButton };
}

describe("editModalHandler callback — SubPanelCell", () => {
	afterEach(() => {
		cleanup();
	});

	describe("when editModalHandler is provided", () => {
		let editModalHandler;
		let summaryPanel;

		beforeEach(() => {
			editModalHandler = sinon.spy();
			({ summaryPanel } = renderWithHandler(editModalHandler));
		});

		it("should call editModalHandler with type:'open' and the table propertyId when the edit icon is clicked", () => {
			const editButton = getFirstEditButton(summaryPanel);
			fireEvent.click(editButton);

			expect(editModalHandler.callCount).to.equal(1);
			expect(editModalHandler.calledWith({ type: "open", propertyId: PROPERTY_ID })).to.be.true;
		});

		it("should call editModalHandler with type:'close', applyChanges:true, and the table propertyId when OK is clicked", () => {
			const { applyButton } = openSubPanelAndGetButtons(summaryPanel);
			editModalHandler.resetHistory(); // ignore the 'open' call

			fireEvent.click(applyButton);

			expect(editModalHandler.callCount).to.equal(1);
			expect(editModalHandler.calledWith({ type: "close", propertyId: PROPERTY_ID, applyChanges: true })).to.be.true;
		});

		it("should call editModalHandler with type:'close', applyChanges:false, and the table propertyId when Cancel is clicked", () => {
			const { cancelButton } = openSubPanelAndGetButtons(summaryPanel);
			editModalHandler.resetHistory(); // ignore the 'open' call

			fireEvent.click(cancelButton);

			expect(editModalHandler.callCount).to.equal(1);
			expect(editModalHandler.calledWith({ type: "close", propertyId: PROPERTY_ID, applyChanges: false })).to.be.true;
		});

		it("should include the same propertyId in both the open and close calls", () => {
			const { applyButton } = openSubPanelAndGetButtons(summaryPanel);
			fireEvent.click(applyButton);

			expect(editModalHandler.callCount).to.equal(2);
			const openArg = editModalHandler.getCall(0).args[0];
			const closeArg = editModalHandler.getCall(1).args[0];
			expect(openArg.propertyId).to.deep.equal(closeArg.propertyId);
			expect(openArg.propertyId).to.deep.equal(PROPERTY_ID);
		});

		it("should fire the close handler after property values have already been reverted on Cancel", () => {
			const { summaryPanel: sp, controller } = renderWithHandler(null);

			// Capture the original value before opening the sub-panel
			const originalValue = JSON.stringify(controller.getPropertyValue(PROPERTY_ID));

			// Open the sub-panel
			const editButton = getFirstEditButton(sp);
			fireEvent.click(editButton);

			// Modify a field inside the sub-panel
			const nameInput = document.querySelector("div[data-id='properties-ctrl-name'] input");
			fireEvent.change(nameInput, { target: { value: "__modified__" } });

			// Register a handler that captures the controller value at call time
			let valueAtCallTime = null;
			controller.setHandlers({
				editModalHandler: () => {
					valueAtCallTime = JSON.stringify(controller.getPropertyValue(PROPERTY_ID));
				}
			});

			// Click Cancel — revert should run before the handler fires
			const cancelButtons = document.querySelectorAll("button.properties-cancel-button");
			fireEvent.click(cancelButtons[cancelButtons.length - 1]);

			expect(valueAtCallTime).to.equal(originalValue);
		});
	});

	describe("when editModalHandler is not provided", () => {
		it("should not throw when the edit icon is clicked", () => {
			const { summaryPanel: sp } = renderWithHandler(null);
			const editButton = getFirstEditButton(sp);
			expect(() => fireEvent.click(editButton)).to.not.throw();
		});

		it("should not throw when OK is clicked", () => {
			const { summaryPanel: sp } = renderWithHandler(null);
			const { applyButton } = openSubPanelAndGetButtons(sp);
			expect(() => fireEvent.click(applyButton)).to.not.throw();
		});

		it("should not throw when Cancel is clicked", () => {
			const { summaryPanel: sp } = renderWithHandler(null);
			const { cancelButton } = openSubPanelAndGetButtons(sp);
			expect(() => fireEvent.click(cancelButton)).to.not.throw();
		});
	});
});
