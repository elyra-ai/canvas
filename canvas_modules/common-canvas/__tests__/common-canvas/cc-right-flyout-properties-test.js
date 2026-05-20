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

import React from "react";
import { expect } from "chai";
import { cleanup, waitFor } from "@testing-library/react";
import CanvasController from "../../src/common-canvas/canvas-controller";
import { createCommonCanvas } from "../_utils_/cc-utils.js";
import { CommonProperties } from "../../src/common-properties";
import { IntlProvider } from "react-intl";
import structureListEditorParamDef from "../test_resources/paramDefs/structurelisteditor_paramDef.json";
import panelParamDef from "../test_resources/paramDefs/panel_paramDef.json";
import panelParamDefWide from "../test_resources/paramDefs/widePanel_paramDef.json";

const propertiesInfo = {
	parameterDef: structureListEditorParamDef
};

const callbacks = {
	applyPropertyChanges: () => {
		// Callback for property changes
	},
	closePropertiesDialog: () => {
		// Callback for closing dialog
	}
};

describe("CommonCanvasRightFlyout integration with Common Properties", () => {
	let canvasController;

	beforeEach(() => {
		canvasController = new CanvasController();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render right flyout with Common Properties content", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const rightFlyout = container.querySelector(".right-flyout");
			expect(rightFlyout).to.not.be.null;
			// Common Properties should be rendered inside the flyout
			const propertiesElements = container.querySelectorAll("[class*='properties']");
			expect(propertiesElements.length).to.be.greaterThan(0);
		});
	});

	it("should render resize button in flyout when Common Properties has enableResize=true", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout-container");
			expect(flyout).to.not.be.null;
			const resizeBtn = flyout.querySelector("button.right-flyout-btn-resize");
			expect(resizeBtn).to.not.be.null;
		});
	});

	it("should not render resize button in flyout when Common Properties has enableResize=false", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: false }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout-container");
			expect(flyout).to.not.be.null;
			const resizeBtn = flyout.querySelector("button.right-flyout-btn-resize");
			expect(resizeBtn).to.be.null;
		});
	});

	it("should apply small width to flyout for small editor_size", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("320px");
		});
	});

	it("should apply medium width to flyout for medium editor_size", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "medium";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("480px");
		});
	});

	it("should apply large width to flyout for large editor_size", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "large";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("640px");
		});
	});

	it("should apply max width to flyout for max editor_size", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "max";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("900px");
		});
	});

	it("should apply custom width to flyout when pixel_width is specified", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("400px");
		});
	});

	it("should render resize button with custom pixel_width", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 400, max: 800 };

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const resizeBtn = container.querySelector("button.right-flyout-btn-resize");
			expect(resizeBtn).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("400px");
		});
	});

	it("should apply fixed width when pixel_width min equals max", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";
		newPropertiesInfo.parameterDef.uihints.pixel_width = { min: 600, max: 600 };

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("600px");
		});
	});

	it("should have aria-label on resize button", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const resizeBtn = container.querySelector("button.right-flyout-btn-resize");
			expect(resizeBtn).to.not.be.null;
			const ariaLabel = resizeBtn.getAttribute("aria-label");
			expect(ariaLabel).to.not.be.null;
			expect(ariaLabel.length).to.be.greaterThan(0);
		});
	});

	it("should render flyout with normal panel width", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={{ parameterDef: panelParamDef }}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("320px");
		});
	});

	it("should render flyout with wide panel width", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={{ parameterDef: panelParamDefWide }}
					propertiesConfig={{ rightFlyout: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("480px");
		});
	});

	it("should render resize button for editor_size widths", async() => {
		const newPropertiesInfo = JSON.parse(JSON.stringify(propertiesInfo));
		newPropertiesInfo.parameterDef.uihints.editor_size = "small";

		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={newPropertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			const flyout = container.querySelector(".right-flyout");
			expect(flyout).to.not.be.null;
			const resizeBtn = container.querySelector("button.right-flyout-btn-resize");
			expect(resizeBtn).to.not.be.null;
			const style = window.getComputedStyle(flyout);
			expect(style.width).to.equal("320px");
		});
	});

	it("should not render Common Properties resize button when in flyout context", async() => {
		const config = {};
		const rightFlyoutContent = (
			<IntlProvider locale="en">
				<CommonProperties
					propertiesInfo={propertiesInfo}
					propertiesConfig={{ rightFlyout: true, enableResize: true }}
					callbacks={callbacks}
				/>
			</IntlProvider>
		);
		const canvasParams = { showRightFlyout: true, rightFlyoutContent: rightFlyoutContent };
		const { container } = createCommonCanvas(config, canvasController, canvasParams);

		await waitFor(() => {
			// Verify resize button is in the flyout container, not in properties
			const flyoutResizeBtn = container.querySelector(".right-flyout-container button.right-flyout-btn-resize");
			expect(flyoutResizeBtn).to.not.be.null;
			// Verify no properties resize button exists
			const propertiesResizeBtn = container.querySelector("button.properties-btn-resize");
			expect(propertiesResizeBtn).to.be.null;
		});
	});
});

// Made with Bob
