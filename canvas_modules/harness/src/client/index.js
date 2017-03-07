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
import "../styles/index.css";
import "@wdp/common-canvas/assets/styles/common-canvas.css";
import "ap-components-react/dist/ap-components-react.min.css";

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
