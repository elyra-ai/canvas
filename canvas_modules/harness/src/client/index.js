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
import App from "./App";
import CommonPropertiesComponents from "./components/common-properties-components.jsx";
import CommonPropertiesConditions from "./components/common-properties-conditions.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "ap-components-react/dist/ap-components-react.min.css";
import "common-canvas-styles";
import "../styles/properties.css";
import "../styles/App.css";
import "../styles/index.css";
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
