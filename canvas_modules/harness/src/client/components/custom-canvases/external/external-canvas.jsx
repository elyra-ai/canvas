/*
 * Copyright 2026 Elyra Authors
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

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import { createExternalFlow, loadExternalPipelineFlow, saveExternalPipelineFlow } from "./external-canvas-api";

import ExternalMainCanvas from "./extMainCanvas.json";

/**
 * Sample application demonstrating management of external pipeline flows.
 * Loads extMainCanvas.json as the primary flow and handles supernode
 * operations that create, expand, display, and convert external sub-flows.
 */
export default class ExternalCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();

		this.canvasConfig = Object.assign({}, props.config, {
			enableParentClass: "external",
			enableMarkdownInComments: true,
			enableMarkdownHTML: false,
			enableContextToolbar: true,
			enableInternalObjectModel: true
		});

		this.beforeEditActionHandler = this.beforeEditActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
	}

	componentDidMount() {
		this.canvasController.setPipelineFlow(ExternalMainCanvas);
	}

	/**
	 * Handles edit actions before they are committed to the canvas model.
	 * For external supernode operations, asynchronously populates the required
	 * external URL and pipeline flow ID, or loads the external pipeline flow
	 * from the local store, then calls editAction to complete the operation.
	 * Returns null to defer processing during the asynchronous operation.
	 *
	 * @param {object} cmndData - The command data object for the pending edit action.
	 * @returns {object|null} The original command data object, or null to defer.
	 */
	beforeEditActionHandler(cmndData) {
		const data = { ...cmndData };

		switch (data.editType) {
		case "createSuperNodeExternal":
		case "convertSuperNodeLocalToExternal": {
			createExternalFlow().then(({ extUrl, extPipelineFlowId }) => {
				data.externalUrl = extUrl;
				data.externalPipelineFlowId = extPipelineFlowId;
				this.canvasController.editAction(data);
			});
			return null;
		}
		case "loadPipelineFlow":
		case "expandSuperNodeInPlace":
		case "displaySubPipeline":
		case "deconstructSuperNode":
		case "convertSuperNodeExternalToLocal": {
			if (data.externalPipelineFlowLoad) {
				loadExternalPipelineFlow(data.externalUrl).then((extPipelineFlow) => {
					data.externalPipelineFlow = extPipelineFlow;
					this.canvasController.editAction(data);
				});
				return null;
			}
			break;
		}
		default:
		}

		return data;
	}

	/**
	 * Handles edit actions after they have been applied to the canvas model.
	 * Saves newly created external pipeline flows into the local store so they
	 * can be reloaded on subsequent expand/display operations.
	 *
	 * @param {object} data - The command data object for the completed edit action.
	 */
	editActionHandler(data) {
		switch (data.editType) {
		case "createSuperNodeExternal":
		case "convertSuperNodeLocalToExternal": {
			saveExternalPipelineFlow(data.externalUrl,
				this.canvasController.getExternalPipelineFlow(data.externalUrl));
			break;
		}
		default: {
		}
		}
	}

	render() {
		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={this.canvasConfig}
				beforeEditActionHandler={this.beforeEditActionHandler}
				editActionHandler={this.editActionHandler}
			/>
		);
	}
}

ExternalCanvas.propTypes = {
	config: PropTypes.object,
};
