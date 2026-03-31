/*
 * Copyright 2017-2025 Elyra Authors
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
import { Provider } from "react-redux";
import { renderWithIntl } from "./intl-utils.js";
import sinon from "sinon";


import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import CommonCanvasToolbar from "../../src/common-canvas/cc-toolbar.jsx";
import CommonCanvasTextToolbar from "../../src/common-canvas/cc-text-toolbar.jsx";

export function createCommonCanvas(config, canvasController, canvasParams, toolbarConfig, notificationConfig, handlers) {
	canvasController.getObjectModel().setPipelineFlowPalette({});
	const contextMenuHandler = sinon.spy();
	const beforeEditActionHandler = handlers && handlers.beforeEditActionHandler ? handlers.beforeEditActionHandler : null;
	const editActionHandler = handlers && handlers.editActionHandler ? handlers.editActionHandler : sinon.spy();
	const clickActionHandler = sinon.spy();
	const decorationActionHandler = sinon.spy();
	const selectionChangeHandler = sinon.spy();
	const tipHandler = sinon.spy();
	const contextMenuConfig = null;
	const canvasParameters = canvasParams || {};
	const wrapper = createIntlCommonCanvasRTL(
		config,
		contextMenuHandler,
		beforeEditActionHandler,
		editActionHandler,
		clickActionHandler,
		decorationActionHandler,
		selectionChangeHandler,
		tipHandler,
		canvasParameters.showBottomPanel,
		canvasParameters.showRightFlyout,
		canvasParameters.rightFlyoutContent,
		toolbarConfig,
		notificationConfig,
		contextMenuConfig,
		canvasController
	);

	return wrapper;
}

export function createIntlCommonCanvasRTL(
	config,
	contextMenuHandler,
	beforeEditActionHandler,
	editActionHandler,
	clickActionHandler,
	decorationActionHandler,
	selectionChangeHandler,
	tipHandler,
	showBottomPanel,
	showRightFlyout,
	rightFlyoutContent,
	toolbarConfig,
	notificationConfig,
	contextMenuConfig,
	canvasController) {


	const wrapper = renderWithIntl(
		<CommonCanvas
			config={config}
			contextMenuHandler={contextMenuHandler}
			beforeEditActionHandler={beforeEditActionHandler}
			editActionHandler={editActionHandler}
			clickActionHandler={clickActionHandler}
			decorationActionHandler={decorationActionHandler}
			selectionChangeHandler={selectionChangeHandler}
			tipHandler={tipHandler}
			toolbarConfig={toolbarConfig}
			notificationConfig={notificationConfig}
			contextMenuConfig={contextMenuConfig}
			showRightFlyout={showRightFlyout}
			rightFlyoutContent={rightFlyoutContent}
			showBottomPanel={showBottomPanel}
			canvasController={canvasController}
		/>
	);
	return wrapper;
}

export function createIntlCommonCanvasToolbar(data, canvasController) {
	canvasController.setToolbarConfig(data.toolbarConfig);
	canvasController.setNotificationPanelConfig(data.notificationConfig);

	if (data.isPaletteOpen) {
		canvasController.openPalette();
	} else {
		canvasController.closePalette();
	}
	if (data.isPaletteEnabled) {
		canvasController.setCanvasConfig({ enablePaletteLayout: "Flyout" });
	} else {
		canvasController.setCanvasConfig({ enablePaletteLayout: "None" });
	}
	if (data.isNotificationOpen) {
		canvasController.openNotificationPanel();
	} else {
		canvasController.closeNotificationPanel();
	}

	const wrapper = renderWithIntl(
		<Provider store={canvasController.getStore()}>
			<CommonCanvasToolbar canvasController={canvasController} containingDivId="test-div-id" />
		</Provider>
	);

	return wrapper;
}

export function createIntlCommonCanvasTextToolbar(data, canvasController) {
	const wrapper = renderWithIntl(
		<Provider store={canvasController.getStore()}>
			<CommonCanvasTextToolbar canvasController={canvasController} />
		</Provider>
	);

	return wrapper;
}
