/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import {
	CONSOLE
} from "../constants/constants.js";

export default class Console extends React.Component {
	showDetails(event) {
		if (event.target.children.console_pretty_json_container) {
			if (event.target.children.console_pretty_json_container.style.display === "none") {
				event.target.children.console_pretty_json_container.style.display = "initial";
			} else {
				event.target.children.console_pretty_json_container.style.display = "none";
			}
		}
	}

	render() {
		var consoleHeight = CONSOLE.MINIMIZED;
		if (this.props.consoleOpened) {
			consoleHeight = CONSOLE.MAXIMIXED;
		}

		var that = this;
		const logs = this.props.logs.map(function(log, ind) {
			var formatted = JSON.stringify(log, null, 2);
			var entry = log.timestamp + ": " + log.event;

			return (
				<li className="console-entry" key={ind} onClick={that.showDetails.bind(that) }>
					{entry}
					<div id="console_pretty_json_container" style={ { display: "none" } }>
						<pre className="console-pretty-json">{formatted}</pre>
					</div>
				</li>
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
	consoleOpened: PropTypes.bool,
	logs: PropTypes.array
};
