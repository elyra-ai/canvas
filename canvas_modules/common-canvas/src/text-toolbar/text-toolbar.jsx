/*
 * Copyright 2022 Elyra Authors
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
import Toolbar from "../toolbar/toolbar.jsx";
import Logger from "../logging/canvas-logger.js";

class TextToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.getLabel = this.getLabel.bind(this);
		this.toolbarActionHandler = this.toolbarActionHandler.bind(this);
		this.logger = new Logger("Text-Toolbar");
	}

	render() {
		this.logger.log("render");

		const toolbarConfig = {
			leftBar: [
				{ action: "cut", label: "Cut", enable: true, tooltip: "Cut from clipboard" },
				{ action: "copy", label: "Copy", enable: true, tooltip: "Copy from clipboard" },
				{ action: "paste", label: "Paste", enable: true, tooltip: "Paste to canvas" }
			]
		};

		const textToolbar = (
			<Toolbar
				config={toolbarConfig}
				instanceId={this.props.instanceId}
				toolbarActionHandler={this.props.toolbarActionHandler}
				additionalText={this.props.additionalText}
			/>
		);

		return textToolbar;
	}
}

TextToolbar.propTypes = {
	instanceId: PropTypes.string.isRequired,
	toolbarActionHandler: PropTypes.func.isRequired,
	additionalText: PropTypes.object.isRequired
};

export default TextToolbar;
