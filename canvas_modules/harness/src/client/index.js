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
import { createRoot } from "react-dom/client.js";

import CommonPropertiesComponents from "./components/common-properties-components.jsx";
import CommonPropertiesConditions from "./components/common-properties-conditions.jsx";
import App from "./App";
import AppSmall from "./app-small.js";
import AppTiny from "./app-tiny.js";
import { HashRouter, Route } from "react-router-dom";
import { IntlProvider } from "react-intl";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	<HashRouter>
		<IntlProvider locale="en">
			<div>
				<Route exact path="/" component={ App } />
				<Route exact path="/app-small" component={ AppSmall } />
				<Route exact path="/app-tiny" component={ AppTiny } />
				<Route path="/properties" component={ CommonPropertiesComponents } />
				<Route path="/conditions" component={ CommonPropertiesConditions } />
			</div>
		</IntlProvider>
	</HashRouter>
);
