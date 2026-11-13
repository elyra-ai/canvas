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

import React from "react";
import { act, fireEvent } from "@testing-library/react";
import { expect } from "@jest/globals";
import sinon from "sinon";

import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import CanvasController from "../../src/common-canvas/canvas-controller";
import { renderWithIntl } from "../_utils_/intl-utils";

const ARIA_LIVE_DELAY = 200;

function renderCanvas(notificationBarConfig, canvasController = new CanvasController()) {
	const createElement = (nbConfig) => (
		<CommonCanvas
			canvasController={canvasController}
			config={{ enableInternalObjectModel: true }}
			notificationBarConfig={nbConfig}
		/>
	);
	const result = renderWithIntl(createElement(notificationBarConfig));
	return {
		...result,
		rerenderBar: (nbConfig) => result.rerender(createElement(nbConfig))
	};
}

function getBar(container) {
	return container.querySelector(".common-canvas-notification-bar");
}

function advanceAriaLiveDelay() {
	act(() => {
		jest.advanceTimersByTime(ARIA_LIVE_DELAY);
	});
}

describe("Notification bar", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("does not display a bar when there is no notificationBarConfig", () => {
		const { container } = renderCanvas(null);
		expect(getBar(container)).toBeNull();
	});

	it("displays an inline notification with the default kind of info", () => {
		const { container } = renderCanvas({ title: "Title 1", subtitle: "Subtitle 1" });
		advanceAriaLiveDelay();

		const bar = getBar(container);
		expect(bar).not.toBeNull();
		expect(bar.querySelector(".cds--inline-notification--info")).not.toBeNull();
		expect(bar.querySelector(".cds--actionable-notification")).toBeNull();
		expect(bar.textContent).toContain("Title 1");
		expect(bar.textContent).toContain("Subtitle 1");
	});

	it("displays an actionable notification when there is an action button and calls the callback", () => {
		const onActionButtonClick = sinon.spy();
		const { container } = renderCanvas({
			title: "Title 1",
			kind: "warning",
			actionButtonLabel: "Do it",
			onActionButtonClick
		});
		advanceAriaLiveDelay();

		const bar = getBar(container);
		expect(bar.querySelector(".cds--actionable-notification--warning")).not.toBeNull();
		const actionButton = Array.from(bar.querySelectorAll("button"))
			.find((b) => b.textContent === "Do it");
		expect(actionButton).toBeDefined();
		fireEvent.click(actionButton);
		expect(onActionButtonClick.calledOnce).toBe(true);
	});

	it("displays content in an actionable notification", () => {
		const { container } = renderCanvas({
			title: "Title 1",
			content: <span data-testid="bar-content">Extra content</span>
		});
		advanceAriaLiveDelay();

		const bar = getBar(container);
		expect(bar.querySelector(".cds--actionable-notification")).not.toBeNull();
		expect(bar.querySelector("[data-testid='bar-content']")).not.toBeNull();
	});

	it("only displays the close button when onCloseButtonClick is provided", () => {
		const onCloseButtonClick = sinon.spy();
		const { container, rerenderBar } = renderCanvas({ title: "Title 1" });
		advanceAriaLiveDelay();
		expect(getBar(container).querySelector("button.cds--actionable-notification__close-button, button.cds--inline-notification__close-button")).toBeNull();

		rerenderBar({ title: "Title 1", onCloseButtonClick });
		const closeButton = getBar(container).querySelector("button.cds--inline-notification__close-button");
		expect(closeButton).not.toBeNull();
		fireEvent.click(closeButton);
		expect(onCloseButtonClick.calledOnce).toBe(true);
	});

	it("hides the close button of an actionable notification without onCloseButtonClick", () => {
		const { container } = renderCanvas({ title: "Title 1", actionButtonLabel: "Do it" });
		advanceAriaLiveDelay();
		expect(getBar(container).querySelector("button.cds--actionable-notification__close-button")).toBeNull();
	});

	it("uses role alert for errors and shows content immediately", () => {
		const { container } = renderCanvas({ title: "Error title", kind: "error" });

		// No timer advance: errors are not delayed.
		const bar = getBar(container);
		expect(bar.querySelector("[role='alert']")).not.toBeNull();
		expect(bar.textContent).toContain("Error title");
	});

	it("uses role status and delays content for non-error kinds", () => {
		const { container } = renderCanvas({ title: "Info title", kind: "info" });

		const bar = getBar(container);
		expect(bar.querySelector("[role='status']")).not.toBeNull();
		expect(bar.textContent).not.toContain("Info title");

		advanceAriaLiveDelay();
		expect(bar.textContent).toContain("Info title");
	});

	it("re-runs the two-phase announcement when the title changes", () => {
		const { container, rerenderBar } = renderCanvas({ title: "First title" });
		advanceAriaLiveDelay();
		expect(getBar(container).textContent).toContain("First title");

		rerenderBar({ title: "Second title" });
		expect(getBar(container).textContent).not.toContain("Second title");

		advanceAriaLiveDelay();
		expect(getBar(container).textContent).toContain("Second title");
	});

	it("does not re-announce when an equivalent config is passed", () => {
		const { container, rerenderBar } = renderCanvas({ title: "First title" });
		advanceAriaLiveDelay();

		rerenderBar({ title: "First title" });
		expect(getBar(container).textContent).toContain("First title");
	});

	it("displays screenReaderText as visually hidden text", () => {
		const { container } = renderCanvas({ title: "Title 1", screenReaderText: "Hidden details" });
		advanceAriaLiveDelay();

		const hidden = getBar(container).querySelector(".cds--visually-hidden");
		expect(hidden).not.toBeNull();
		expect(hidden.textContent).toBe("Hidden details");
	});

	it("removes the bar when the config is cleared", () => {
		const { container, rerenderBar } = renderCanvas({ title: "Title 1" });
		expect(getBar(container)).not.toBeNull();

		rerenderBar(null);
		expect(getBar(container)).toBeNull();
	});
});
