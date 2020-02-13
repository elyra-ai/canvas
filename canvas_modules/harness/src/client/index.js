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
import { HashRouter, Route } from "react-router-dom";
import { IntlProvider } from "react-intl";


ReactDOM.render(
	<HashRouter>
		<IntlProvider>
			<div>
				<Route exact path="/" component={ App } />
				<Route path="/properties" component={ CommonPropertiesComponents } />
				<Route path="/conditions" component={ CommonPropertiesConditions } />
			</div>
		</IntlProvider>
	</HashRouter>,
	document.getElementById("root")
);
