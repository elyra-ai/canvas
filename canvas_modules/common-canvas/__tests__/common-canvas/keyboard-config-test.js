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

import { expect } from "chai";
import sinon from "sinon";
import { fireEvent, cleanup } from "@testing-library/react";
import CanvasController from "../../src/common-canvas/canvas-controller";
import { createCommonCanvas } from "../_utils_/cc-utils.js";

// Action name constants mirrored from canvas-constants to avoid a direct import
const ACTION_DELETE_SELECTED_OBJECTS = "deleteSelectedObjects";
const ACTION_UNDO = "undo";
const ACTION_REDO = "redo";
const ACTION_COPY = "copy";
const ACTION_CUT = "cut";
const ACTION_PASTE = "paste";
const ACTION_SELECT_ALL = "selectAll";
const ACTION_DESELECT_ALL = "deselectAll";

/**
 * Returns the d3-svg-canvas-div element from the rendered container.
 * This is the element that onKeyDown is attached to.
 */
function getSVGCanvasDiv(container) {
	return container.querySelector(".d3-svg-canvas-div");
}

/**
 * Fires a keyDown event on the svg canvas div simulating the Delete key.
 */
function pressDelete(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "Delete" });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+Z (undo).
 */
function pressUndo(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "z", metaKey: true, shiftKey: false });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+Shift+Z (redo).
 */
function pressRedo(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "z", metaKey: true, shiftKey: true });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+C (copy).
 */
function pressCopy(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "c", metaKey: true });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+X (cut).
 */
function pressCut(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "x", metaKey: true });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+V (paste).
 */
function pressPaste(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "v", metaKey: true });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+A (select all).
 */
function pressSelectAll(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "a", metaKey: true, shiftKey: false });
}

/**
 * Fires a keyDown event simulating Cmd/Ctrl+Shift+A (deselect all).
 */
function pressDeselectAll(canvasDiv) {
	fireEvent.keyDown(canvasDiv, { key: "a", metaKey: true, shiftKey: true });
}

describe("keyboardConfig action gating", () => {
	let canvasController;
	let keyboardActionHandlerSpy;

	beforeEach(() => {
		canvasController = new CanvasController();
		// enableEditingActions must be true for the editing-action guards to execute
		createCommonCanvas({ enableEditingActions: true }, canvasController);
		keyboardActionHandlerSpy = sinon.spy(canvasController, "keyboardActionHandler");
	});

	afterEach(() => {
		keyboardActionHandlerSpy.restore();
		cleanup();
	});

	// ─── delete ──────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for deleteSelectedObjects when delete action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressDelete(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_DELETE_SELECTED_OBJECTS)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for deleteSelectedObjects when delete action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { delete: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressDelete(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_DELETE_SELECTED_OBJECTS)).to.be.false;
	});

	// ─── undo ─────────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for undo when undo action is enabled and canUndo is true", () => {
		// Stub canUndo so the inner guard passes and keyboardActionHandler is called
		const canUndoStub = sinon.stub(canvasController, "canUndo").returns(true);
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressUndo(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_UNDO)).to.be.true;
		canUndoStub.restore();
	});

	it("should NOT call keyboardActionHandler for undo when undo action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { undo: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressUndo(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_UNDO)).to.be.false;
	});

	// ─── redo ─────────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for redo when redo action is enabled and canRedo is true", () => {
		// Stub canRedo so the inner guard passes and keyboardActionHandler is called
		const canRedoStub = sinon.stub(canvasController, "canRedo").returns(true);
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressRedo(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_REDO)).to.be.true;
		canRedoStub.restore();
	});

	it("should NOT call keyboardActionHandler for redo when redo action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { redo: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressRedo(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_REDO)).to.be.false;
	});

	// ─── copy ─────────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for copy when copyToClipboard action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressCopy(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_COPY)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for copy when copyToClipboard action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { copyToClipboard: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressCopy(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_COPY)).to.be.false;
	});

	// ─── cut ──────────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for cut when cutToClipboard action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressCut(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_CUT)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for cut when cutToClipboard action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { cutToClipboard: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressCut(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_CUT)).to.be.false;
	});

	// ─── paste ────────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for paste when pasteFromClipboard action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressPaste(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_PASTE)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for paste when pasteFromClipboard action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { pasteFromClipboard: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressPaste(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_PASTE)).to.be.false;
	});

	// ─── selectAll ────────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for selectAll when selectAll action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressSelectAll(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_SELECT_ALL)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for selectAll when selectAll action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { selectAll: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressSelectAll(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_SELECT_ALL)).to.be.false;
	});

	// ─── deselectAll ──────────────────────────────────────────────────────────

	it("should call keyboardActionHandler for deselectAll when deselectAll action is enabled", () => {
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressDeselectAll(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_DESELECT_ALL)).to.be.true;
	});

	it("should NOT call keyboardActionHandler for deselectAll when deselectAll action is disabled", () => {
		canvasController.setKeyboardConfig({ actions: { deselectAll: false } });
		const { container } = createCommonCanvas({ enableEditingActions: true }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressDeselectAll(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_DESELECT_ALL)).to.be.false;
	});

	// ─── editing actions guard ────────────────────────────────────────────────

	it("should NOT call keyboardActionHandler for delete when enableEditingActions is false", () => {
		const { container } = createCommonCanvas({ enableEditingActions: false }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressDelete(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_DELETE_SELECTED_OBJECTS)).to.be.false;
	});

	it("should NOT call keyboardActionHandler for copy when enableEditingActions is false", () => {
		const { container } = createCommonCanvas({ enableEditingActions: false }, canvasController);
		const canvasDiv = getSVGCanvasDiv(container);

		pressCopy(canvasDiv);

		expect(keyboardActionHandlerSpy.calledWith(ACTION_COPY)).to.be.false;
	});
});

describe("keyboardConfig action gating — onCut, onCopy, onPaste (browser edit menu)", () => {
	let canvasController;
	let cutSpy;
	let copySpy;
	let pasteSpy;

	/**
	 * Creates the canvas with enableBrowserEditMenu so addEventListeners() fires,
	 * focuses the svg canvas div so isFocusOnCanvasOrContents() passes, and
	 * returns the focused canvas div.
	 */
	function setupWithBrowserEditMenu(keyboardConfigOverrides) {
		if (keyboardConfigOverrides) {
			canvasController.setKeyboardConfig({ actions: keyboardConfigOverrides });
		}
		const { container } = createCommonCanvas(
			{ enableEditingActions: true, enableBrowserEditMenu: true },
			canvasController
		);
		const canvasDiv = getSVGCanvasDiv(container);
		// Focus the canvas div so document.activeElement satisfies isFocusOnCanvasOrContents
		canvasDiv.focus();
		return canvasDiv;
	}

	beforeEach(() => {
		// Reset focus to body before each test so document.activeElement is clean
		document.body.focus();
		canvasController = new CanvasController();
		cutSpy = sinon.spy(canvasController, "cutToClipboard");
		copySpy = sinon.spy(canvasController, "copyToClipboard");
		pasteSpy = sinon.spy(canvasController, "pasteFromClipboard");
	});

	afterEach(() => {
		cutSpy.restore();
		copySpy.restore();
		pasteSpy.restore();
		cleanup();
	});

	// ─── onCopy ───────────────────────────────────────────────────────────────

	it("should call copyToClipboard when copyToClipboard action is enabled and browser copy event fires", () => {
		setupWithBrowserEditMenu();
		fireEvent.copy(document);
		expect(copySpy.calledOnce).to.be.true;
	});

	it("should NOT call copyToClipboard when copyToClipboard action is disabled and browser copy event fires", () => {
		setupWithBrowserEditMenu({ copyToClipboard: false });
		fireEvent.copy(document);
		expect(copySpy.called).to.be.false;
	});

	// ─── onCut ────────────────────────────────────────────────────────────────

	it("should call cutToClipboard when cutToClipboard action is enabled and browser cut event fires", () => {
		setupWithBrowserEditMenu();
		fireEvent.cut(document);
		expect(cutSpy.calledOnce).to.be.true;
	});

	it("should NOT call cutToClipboard when cutToClipboard action is disabled and browser cut event fires", () => {
		setupWithBrowserEditMenu({ cutToClipboard: false });
		fireEvent.cut(document);
		expect(cutSpy.called).to.be.false;
	});

	// ─── onPaste ──────────────────────────────────────────────────────────────

	it("should call pasteFromClipboard when pasteFromClipboard action is enabled and browser paste event fires", () => {
		setupWithBrowserEditMenu();
		fireEvent.paste(document);
		expect(pasteSpy.calledOnce).to.be.true;
	});

	it("should NOT call pasteFromClipboard when pasteFromClipboard action is disabled and browser paste event fires", () => {
		setupWithBrowserEditMenu({ pasteFromClipboard: false });
		fireEvent.paste(document);
		expect(pasteSpy.called).to.be.false;
	});

	// ─── enableEditingActions guard ───────────────────────────────────────────

	it("should NOT call cutToClipboard when enableEditingActions is false and browser cut event fires", () => {
		canvasController.setKeyboardConfig({ actions: { cutToClipboard: true } });
		const { container } = createCommonCanvas(
			{ enableEditingActions: false, enableBrowserEditMenu: true },
			canvasController
		);
		getSVGCanvasDiv(container).focus();
		fireEvent.cut(document);
		expect(cutSpy.called).to.be.false;
	});
});
