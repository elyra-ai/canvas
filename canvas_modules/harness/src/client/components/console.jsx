/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import {
	CONSOLE
} from "../constants/constants.js";

export default class Console extends React.Component {
	render() {
		var consoleHeight = CONSOLE.MINIMIZED;
		if (this.props.consoleOpened) {
			consoleHeight = CONSOLE.MAXIMIXED;
		}

		const logs = this.props.logs.map(function(log, ind) {
			var line = JSON.stringify(log);
			return (
				<li key={ind}>{line}</li>
			);
		});

		var consoleWindow = (
			<div id="app-console"
				style={{ height: consoleHeight }}
			>
				<ul>{logs}</ul>
			</div>);

		return (
			<div>{consoleWindow}</div>
		);
	}
}

Console.propTypes = {
	consoleOpened: React.PropTypes.bool,
	logs: React.PropTypes.array
};
