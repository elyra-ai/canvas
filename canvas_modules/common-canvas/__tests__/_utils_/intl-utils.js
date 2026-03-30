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
import { IntlProvider } from "react-intl";
import { render } from "./mount-utils.js";
import commandActionsMessages from "../../locales/command-actions/locales/en.json";
import commonCanvasMessages from "../../locales/common-canvas/locales/en.json";
import commonPropertiesMessages from "../../locales/common-properties/locales/en.json";
import notificationPanelMessages from "../../locales/notification-panel/locales/en.json";
import paletteMessages from "../../locales/palette/locales/en.json";
import toolbarMessages from "../../locales/toolbar/locales/en.json";
import harnessMessages from "../../../harness/src/intl/locales/en.json";

const defaultLocale = "en";
const locale = defaultLocale;

// Add mock custom field types for tests
const testMessages = {
	...commandActionsMessages,
	...commonCanvasMessages,
	...commonPropertiesMessages,
	...notificationPanelMessages,
	...paletteMessages,
	...toolbarMessages,
	...harnessMessages,
	"fieldPicker.unknown.label": "unknown",
	"fieldPicker.customType.label": "custom type",
	"fieldPicker.vectorType.label": "vector type"
};

export function renderWithIntl(node, inOptions) {
	// eslint-disable-next-line react/prop-types
	function Wrapper({ children }) {
		return (<IntlProvider locale={locale} defaultLocale={defaultLocale} messages={testMessages}>{children}</IntlProvider>);
	}
	return render(node, { wrapper: Wrapper, ...inOptions });
}
