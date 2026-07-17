/*
 * Copyright 2026 Elyra Authors
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
import { adjustSubAreaPosition, applySubAreaInitialStyle } from "../../src/toolbar/toolbar-sub-utils.js";

const CONTAINING_DIV_ID = "canvas-div";

// Builds a fake sub-area ref that models an absolutely positioned element.
// Its viewport top is originTop + whatever "top" is currently set in its style,
// which is exactly how a real absolutely positioned element behaves. scrollHeight
// always reports the natural content height (unaffected by any maxHeight clamp),
// just like a real element. Every style write is recorded in `writes` so tests
// can assert which properties actually changed.
function makeSubAreaRef({ originTop, height, width = 100, left = 100 }) {
	const rawStyle = {};
	const writes = [];
	const style = new Proxy(rawStyle, {
		set(target, prop, value) {
			writes.push([prop, value]);
			target[prop] = value;
			return true;
		}
	});
	return {
		style,
		writes,
		scrollHeight: height,
		closest: () => null,
		getBoundingClientRect: () => {
			const top = originTop + (parseFloat(rawStyle.top) || 0);
			return { top, bottom: top + height, left, right: left + width, height, width };
		}
	};
}

// Returns the final menu rect (as it would be painted) plus the height that is
// actually visible after any maxHeight clamp is applied.
function resolveRect(subAreaRef, originTop) {
	const top = originTop + (parseFloat(subAreaRef.style.top) || 0);
	const maxHeight = parseFloat(subAreaRef.style.maxHeight);
	const naturalHeight = subAreaRef.scrollHeight;
	const usedHeight = isNaN(maxHeight) ? naturalHeight : Math.min(naturalHeight, maxHeight);
	return { top, usedHeight, bottom: top + usedHeight };
}

describe("adjustSubAreaPosition keeps a vertical sub-menu inside the containing div", () => {
	let getElementByIdStub;

	function stubContainingDiv(rect) {
		getElementByIdStub = sinon.stub(document, "getElementById");
		getElementByIdStub.withArgs(CONTAINING_DIV_ID)
			.returns({ getBoundingClientRect: () => rect });
	}

	afterEach(() => {
		getElementByIdStub.restore();
	});

	it("keeps a too-tall menu below a top-pinned toolbar item (Image 1 & 2 scenario)", () => {
		// Short (zoomed-in) canvas with the toolbar pinned to the top.
		const containingDivRect = { top: 0, bottom: 300, left: 0, right: 1000 };
		stubContainingDiv(containingDivRect);

		const actionItemRect = { top: 0, bottom: 40, left: 100, right: 140 };
		const originTop = actionItemRect.top;
		const subAreaRef = makeSubAreaRef({ originTop, height: 500, width: 200 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "vertical", actionItemRect);

		const rect = resolveRect(subAreaRef, originTop);

		// Must stay fully within the containing div (no top or bottom clipping).
		expect(rect.top).to.be.at.least(containingDivRect.top);
		expect(rect.bottom).to.be.at.most(containingDivRect.bottom);
		// Must drop BELOW the toolbar item (as in Image 1), not overlap it (Image 2).
		expect(rect.top).to.equal(actionItemRect.bottom);
		// Must be scrollable since it is taller than the available space.
		expect(subAreaRef.style.overflowY).to.equal("auto");
	});

	it("flips a menu above the item when it fits there (floating toolbar)", () => {
		const containingDivRect = { top: 0, bottom: 1000, left: 0, right: 1000 };
		stubContainingDiv(containingDivRect);

		// Item near the bottom: no room below, plenty above.
		const actionItemRect = { top: 900, bottom: 940, left: 100, right: 140 };
		const originTop = actionItemRect.top;
		const subAreaRef = makeSubAreaRef({ originTop, height: 500 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "vertical", actionItemRect);

		const rect = resolveRect(subAreaRef, originTop);

		expect(rect.top).to.be.at.least(containingDivRect.top);
		expect(rect.bottom).to.be.at.most(containingDivRect.bottom);
		// Sits directly above the item.
		expect(rect.bottom).to.equal(actionItemRect.top);
	});

	it("does not re-clear maxHeight on repeated adjustments (preserves scroll)", () => {
		// Re-rendering (e.g. the cursor moving over the toolbar) re-runs this
		// function. If it cleared and re-applied maxHeight each time, the browser
		// would reset a scrolled menu back to the top. Re-running with unchanged
		// inputs must therefore not touch maxHeight/overflowY at all.
		const containingDivRect = { top: 0, bottom: 300, left: 0, right: 1000 };
		stubContainingDiv(containingDivRect);

		const actionItemRect = { top: 0, bottom: 40, left: 100, right: 140 };
		const originTop = actionItemRect.top;
		const subAreaRef = makeSubAreaRef({ originTop, height: 500, width: 200 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "vertical", actionItemRect);
		expect(subAreaRef.style.maxHeight).to.equal("260px");
		expect(subAreaRef.style.overflowY).to.equal("auto");

		// Second identical adjustment: nothing about the clamp should be re-written.
		subAreaRef.writes.length = 0;
		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "vertical", actionItemRect);

		const clampWrites = subAreaRef.writes.filter(([prop]) => prop === "maxHeight" || prop === "overflowY");
		expect(clampWrites).to.have.length(0);
		expect(subAreaRef.style.maxHeight).to.equal("260px");
	});

	it("leaves a menu that fits below the item unclamped", () => {
		const containingDivRect = { top: 0, bottom: 1000, left: 0, right: 1000 };
		stubContainingDiv(containingDivRect);

		const actionItemRect = { top: 0, bottom: 40, left: 100, right: 140 };
		const originTop = actionItemRect.top;
		const subAreaRef = makeSubAreaRef({ originTop, height: 200 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "vertical", actionItemRect);

		const rect = resolveRect(subAreaRef, originTop);

		expect(rect.top).to.equal(actionItemRect.bottom);
		expect(rect.bottom).to.be.at.most(containingDivRect.bottom);
		expect(subAreaRef.style.overflowY).to.not.equal("auto");
	});
});

describe("adjustSubAreaPosition positions a cascade fly-out (horizontal) in viewport space", () => {
	let getElementByIdStub;

	function stubContainingDiv(rect) {
		getElementByIdStub = sinon.stub(document, "getElementById");
		getElementByIdStub.withArgs(CONTAINING_DIV_ID)
			.returns({ getBoundingClientRect: () => rect });
	}

	afterEach(() => {
		getElementByIdStub.restore();
	});

	it("opens to the right of the item, top-aligned, when there is room", () => {
		stubContainingDiv({ top: 0, bottom: 1000, left: 0, right: 1000 });
		const actionItemRect = { top: 100, bottom: 140, left: 200, right: 240 };
		const subAreaRef = makeSubAreaRef({ originTop: 0, height: 80, width: 150 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "horizontal", actionItemRect);

		expect(subAreaRef.style.left).to.equal("240px"); // actionItemRect.right
		expect(subAreaRef.style.top).to.equal("99px"); // actionItemRect.top - 1
		expect(subAreaRef.style.overflowY).to.not.equal("auto");
	});

	it("flips to the left of the item when there is no room on the right", () => {
		stubContainingDiv({ top: 0, bottom: 1000, left: 0, right: 1000 });
		const actionItemRect = { top: 100, bottom: 140, left: 900, right: 960 };
		const subAreaRef = makeSubAreaRef({ originTop: 0, height: 80, width: 150 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "horizontal", actionItemRect);

		expect(subAreaRef.style.left).to.equal("750px"); // actionItemRect.left - width
	});

	it("shifts up so the fly-out bottom stays within the containing div", () => {
		stubContainingDiv({ top: 0, bottom: 1000, left: 0, right: 1000 });
		const actionItemRect = { top: 950, bottom: 990, left: 200, right: 240 };
		const subAreaRef = makeSubAreaRef({ originTop: 0, height: 200, width: 150 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "horizontal", actionItemRect);

		// top-aligned would be 949; bottom (1149) overflows by 149, so shift up to 800.
		expect(subAreaRef.style.top).to.equal("800px");
	});

	it("clamps and scrolls a fly-out taller than the containing div", () => {
		stubContainingDiv({ top: 0, bottom: 300, left: 0, right: 1000 });
		const actionItemRect = { top: 100, bottom: 140, left: 200, right: 240 };
		const subAreaRef = makeSubAreaRef({ originTop: 0, height: 500, width: 150 });

		adjustSubAreaPosition(subAreaRef, CONTAINING_DIV_ID, "horizontal", actionItemRect);

		// Pinned to the containing div top and clamped to its full height.
		expect(subAreaRef.style.top).to.equal("0px");
		expect(subAreaRef.style.maxHeight).to.equal("300px");
		expect(subAreaRef.style.overflowY).to.equal("auto");
	});

	it("applySubAreaInitialStyle sets initial top and left on the sub-area ref", () => {
		const actionItemRect = { top: 100, bottom: 140, left: 200, right: 240, height: 40, width: 40 };

		const hRef = makeSubAreaRef({ originTop: 0, height: 50 });
		applySubAreaInitialStyle(hRef, "horizontal", actionItemRect);
		expect(hRef.style.top).to.equal((actionItemRect.top - 1) + "px");
		expect(hRef.style.left).to.equal(actionItemRect.right + "px");

		const vRef = makeSubAreaRef({ originTop: 0, height: 50 });
		applySubAreaInitialStyle(vRef, "vertical", actionItemRect);
		expect(vRef.style.top).to.equal((actionItemRect.bottom + 1) + "px");
		expect(vRef.style.left).to.equal(actionItemRect.left + "px");
	});
});
