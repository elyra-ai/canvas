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

import React from "react";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { mount, render } from "./mount-utils.js";
import sinon from "sinon";


import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import CommonCanvasToolbar from "../../src/common-canvas/cc-toolbar.jsx";
import CommonCanvasTextToolbar from "../../src/common-canvas/cc-text-toolbar.jsx";

const locale = "en";
const messages = {
	"canvas.undo": "Undo",
	"canvas.redo": "Redo",
	"edit.cutSelection": "Cut",
	"edit.copySelection": "Copy",
	"edit.pasteSelection": "Paste",
	"canvas.addComment": "Add Comment",
	"canvas.deleteObject": "Delete",
	"toolbar.zoomIn": "Zoom In",
	"toolbar.zoomOut": "Zoom Out",
	"toolbar.zoomToFit": "Zoom To Fit"
};

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

// export function createIntlCommonCanvas(
// 	config,
// 	contextMenuHandler,
// 	beforeEditActionHandler,
// 	editActionHandler,
// 	clickActionHandler,
// 	decorationActionHandler,
// 	selectionChangeHandler,
// 	tipHandler,
// 	showBottomPanel,
// 	showRightFlyout,
// 	toolbarConfig,
// 	notificationConfig,
// 	contextMenuConfig,
// 	canvasController) {


// 	const wrapper = mount(
// 		<IntlProvider key="IntlProvider1" locale={ locale } messages={messages}>
// 			<CommonCanvas
// 				config={config}
// 				contextMenuHandler={contextMenuHandler}
// 				beforeEditActionHandler={beforeEditActionHandler}
// 				editActionHandler={editActionHandler}
// 				clickActionHandler={clickActionHandler}
// 				decorationActionHandler={decorationActionHandler}
// 				selectionChangeHandler={selectionChangeHandler}
// 				tipHandler={tipHandler}
// 				toolbarConfig={toolbarConfig}
// 				notificationConfig={notificationConfig}
// 				contextMenuConfig={contextMenuConfig}
// 				showRightFlyout={showRightFlyout}
// 				showBottomPanel={showBottomPanel}
// 				canvasController={canvasController}
// 			/>
// 		</IntlProvider>
// 	);
// 	return wrapper;
// }

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


	const wrapper = render(
		<IntlProvider key="IntlProvider1" locale={ locale } messages={messages}>
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
		</IntlProvider>
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

	const wrapper = mount(
		<Provider store={canvasController.getStore()}>
			<IntlProvider key="IntlProvider1" locale={ locale } messages={messages}>
				<CommonCanvasToolbar canvasController={canvasController} />
			</IntlProvider>
		</Provider>
	);

	return wrapper;
}

export function createIntlCommonCanvasTextToolbar(data, canvasController) {
	const wrapper = render(
		<Provider store={canvasController.getStore()}>
			<IntlProvider key="IntlProvider1" locale={ locale } messages={messages}>
				<CommonCanvasTextToolbar canvasController={canvasController} />
			</IntlProvider>
		</Provider>
	);

	return wrapper;
}
