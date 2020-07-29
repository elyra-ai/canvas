/*
 * Copyright 2020 IBM Corporation
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
import { IntlProvider } from "react-intl";
import { mount } from "enzyme";

import CommonCanvas from "../../src/common-canvas/common-canvas.jsx";
import CommonCanvasToolbar from "../../src/common-canvas/common-canvas-toolbar.jsx";

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


export function createIntlCommonCanvas(
	config,
	contextMenuHandler,
	beforeEditActionHandler,
	editActionHandler,
	clickActionHandler,
	decorationActionHandler,
	selectionChangeHandler,
	tipHandler,

	toolbarConfig,
	notificationConfig,
	contextMenuConfig,
	showRightFlyout,
	canvasController) {


	const wrapper = mount(
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
				showRightFlyout={false}
				canvasController={canvasController}
			/>
		</IntlProvider>
	);
	return wrapper;
}

export function createIntlCommonCanvasToolbar(toolbarConfig,
	isPaletteEnabled, isPaletteOpen,
	notificationConfig, isNotificationOpen, canvasController) {

	const wrapper = mount(
		<IntlProvider key="IntlProvider1" locale={ locale } messages={messages}>
			<CommonCanvasToolbar
				config={toolbarConfig}
				isPaletteEnabled={isPaletteEnabled}
				isPaletteOpen={isPaletteOpen}
				notificationConfig={notificationConfig}
				isNotificationOpen={isNotificationOpen}
				canvasController={canvasController}
			/>
		</IntlProvider>
	);

	return wrapper;
}
