/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ReactDOM from "react-dom";

import CommonPropertiesComponents from "./components/common-properties-components.jsx";
import CommonPropertiesConditions from "./components/common-properties-conditions.jsx";
import "../styles/properties.scss";
import "../styles/App.scss";
import "../styles/index.scss";
import "../styles/custom-datasets-table.scss";
import App from "./App";
import { IntlProvider } from "react-intl";
import { HashRouter, Route } from "react-router-dom";

ReactDOM.render(
	<IntlProvider locale="en">
		<HashRouter>
			<div>
				<Route exact path="/" component={ App } />
				<Route path="/properties" component={ CommonPropertiesComponents } />
				<Route path="/conditions" component={ CommonPropertiesConditions } />
			</div>
		</HashRouter>
	</IntlProvider>,
	document.getElementById("root")
);
