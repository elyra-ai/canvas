/*
 * Copyright 2024 Elyra Authors
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
import PromptPalette from "./prompt-palette.json";

export default class PromptReactNode extends React.Component {
	constructor(props) {
		super(props);

		this.onScroll = this.onScroll.bind(this);
	}

	onClick(nodeTemplate, evt) {
		this.props.nodeData.app_data.prompt_data.addNodeCallback(nodeTemplate);
	}

	onScroll(evt) {
		evt.stopPropagation();

	}

	render() {
		const nodeDivs = [];
		for (let i = 0; i < PromptPalette.categories[1].node_types.length; i++) {
			const nodeTemplate = PromptPalette.categories[1].node_types[i];
			nodeDivs.push(
				<div key={i} style={{ height: "30px" }} onClick={this.onClick.bind(this, nodeTemplate)}>
					{ nodeTemplate.app_data.ui_data.label }
				</div>
			);
		}

		return (
			<div style={{ height: "100%", width: "100%", overflowY: "scroll", backgroundColor: "white" }}
				onScroll={this.onScroll} onWheel={this.onScroll}
			>
				{ nodeDivs }
			</div>
		);
	}
}

PromptReactNode.propTypes = {
	canvasController: PropTypes.object.isRequired,
	nodeData: PropTypes.object,
	externalUtils: PropTypes.object
};
