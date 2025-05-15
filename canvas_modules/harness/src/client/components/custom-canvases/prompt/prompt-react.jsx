/*
 * Copyright 2025 Elyra Authors
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
import { IntlProvider } from "react-intl";
import PromptSubPalette from "./prompt-sub-palette.jsx";

export default class PromptReactNode extends React.Component {
	constructor(props) {
		super(props);

		this.createAutoNode = this.createAutoNode.bind(this);
	}

	// Returns the palette object to be used. This is constructed from the
	// palette in the application's canvas controller with the first
	// category reoved since the first category has binding entry nodes.
	getPalette() {
		const palette = this.props.canvasController.getPaletteData();

		// Remove the inputs category from the palette data.
		palette.categories.shift();

		return palette;
	}

	createAutoNode(nodeTemplate) {
		this.props.nodeData.app_data.prompt_data
			.addNodeCallback(nodeTemplate, this.props.nodeData.id);
	}


	render() {
		const palette = this.getPalette();
		const intl = this.props.canvasController.getIntl();

		return (
			<div style={{ height: "100%", width: "100%", backgroundColor: "white" }}>
				<IntlProvider locale={intl.locale} defaultLocale="en" messages={intl.messages}>
					<PromptSubPalette palette={palette} createAutoNode={this.createAutoNode} />
				</IntlProvider>
			</div>
		);
	}
}

PromptReactNode.propTypes = {
	canvasController: PropTypes.object.isRequired,
	nodeData: PropTypes.object,
	externalUtils: PropTypes.object
};
