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
import PropTypes from "prop-types";

export default class Console extends React.Component {
	showDetails(event) {
		if (event.target.children.harness_console_pretty_json_container) {
			if (event.target.children.harness_console_pretty_json_container.style.display === "none") {
				event.target.children.harness_console_pretty_json_container.style.display = "initial";
			} else {
				event.target.children.harness_console_pretty_json_container.style.display = "none";
			}
		}
	}

	render() {
		const that = this;
		const logs = this.props.logs.map(function(log, ind) {
			const formatted = JSON.stringify(log, null, 2);
			const entry = log.timestamp + ": " + log.event;

			return (
				<li className="harness-console-entry" key={ind} onClick={that.showDetails.bind(that) }>
					{entry}
					<div id="harness_console_pretty_json_container" style={ { display: "none" } }>
						<pre className="harness-console-pretty-json">{formatted}</pre>
					</div>
				</li>
			);
		});

		return (<div className={"harness-app-console " + this.props.classname}>
			<ul>{logs}</ul>
		</div>);
	}
}

Console.propTypes = {
	classname: PropTypes.string,
	consoleOpened: PropTypes.bool,
	logs: PropTypes.array
};
