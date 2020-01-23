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
import "../styles/index.scss";
import App from "./App";
import { IntlProvider } from "react-intl";
import { HashRouter, Route } from "react-router-dom";
import i18nData from "../intl/en.json";


ReactDOM.render(
	<IntlProvider locale="en" messages={i18nData}>
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
