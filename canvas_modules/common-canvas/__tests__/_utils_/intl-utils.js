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
import { IntlProvider } from "react-intl";
import { shallow } from "enzyme";
import { mount } from "./mount-utils.js";

import { getMessages } from "../../../harness/src/intl/intl-utils";
import * as HarnessBundles from "../../../harness/src/intl/locales";

const defaultLocale = "en-US";
const locale = defaultLocale;

export function mountWithIntl(node, inOptions) {
	// eslint-disable-next-line react/prop-types
	function Wrapper({ children }) {
		return (<IntlProvider locale={locale} defaultLocale={defaultLocale}>{children}</IntlProvider>);
	}
	return mount(node, { wrapper: Wrapper, ...inOptions });
}

// Allow for custom resources to be applied from the test harness
export function mountWithIntlMessages(node, inOptions) {
	const messages = getMessages("en", [HarnessBundles]); // Allow test harness to override labels
	const options = Object.assign({
		wrappingComponent: IntlProvider,
		wrappingComponentProps: {
			locale,
			defaultLocale,
			messages
		}
	}, inOptions);
	return mount(node, options);
}

export function shallowWithIntl(node) {
	return shallow(node, {
		wrappingComponent: IntlProvider,
		wrappingComponentProps: {
			locale,
			defaultLocale
		},
	});
}
