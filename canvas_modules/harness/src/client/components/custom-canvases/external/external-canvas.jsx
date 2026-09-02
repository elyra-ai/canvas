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

import React, { useRef } from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import { createExternalFlow, loadExternalPipelineFlow, saveExternalPipelineFlow } from "./external-canvas-api";

import ExternalMainCanvas from "./externalMainCanvas.json";
import ExternalSubFlow1 from "./externalSubFlow1.json";
import ExternalSubFlow2 from "./externalSubFlow2.json";

/**
 * Sample application demonstrating management of external pipeline flows.
 * Loads externalMainCanvas.json as the primary flow and handles supernode
 * operations that create, expand, display, and convert external sub-flows.
 *
 * @param {object} props.config - Canvas configuration overrides.
 */
const ExternalCanvas = ({ config }) => {
	const canvasController = useRef(new CanvasController());
	canvasController.current.setPipelineFlow(ExternalMainCanvas);

	// Keyed by external URL, holds the pipeline flows for external sub-flows.
	const externalPipelineFlows = useRef({
		"external-sub-flow-url-1": ExternalSubFlow1,
		"external-sub-flow-url-2": ExternalSubFlow2
	});

	const canvasConfig = useRef(Object.assign({}, config, {
		enableParentClass: "external",
		enableInternalObjectModel: true
	}));

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
	const beforeEditActionHandler = (cmndData) => {
		const data = { ...cmndData };

		switch (data.editType) {
		case "createSuperNodeExternal":
		case "convertSuperNodeLocalToExternal": {
			createExternalFlow().then(({ extUrl, extPipelineFlowId }) => {
				data.externalUrl = extUrl;
				data.externalPipelineFlowId = extPipelineFlowId;
				canvasController.current.editAction(data);
			});
			return null;
		}
		case "loadPipelineFlow":
		case "expandSuperNodeInPlace":
		case "displaySubPipeline":
		case "deconstructSuperNode":
		case "convertSuperNodeExternalToLocal": {
			if (data.externalPipelineFlowLoad) {
				loadExternalPipelineFlow(externalPipelineFlows.current, data.externalUrl).then((extPipelineFlow) => {
					data.externalPipelineFlow = extPipelineFlow;
					canvasController.current.editAction(data);
				});
				return null;
			}
			break;
		}
		default:
		}

		return data;
	};

	/**
	 * Handles edit actions after they have been applied to the canvas model.
	 * Saves newly created external pipeline flows into the local store so they
	 * can be reloaded on subsequent expand/display operations.
	 *
	 * @param {object} data - The command data object for the completed edit action.
	 */
	const editActionHandler = (data) => {
		switch (data.editType) {
		case "createSuperNodeExternal":
		case "convertSuperNodeLocalToExternal": {
			saveExternalPipelineFlow(externalPipelineFlows.current, data.externalUrl,
				canvasController.current.getExternalPipelineFlow(data.externalUrl));
			break;
		}
		default: {
		}
		}
	};

	return (
		<CommonCanvas
			canvasController={canvasController.current}
			config={canvasConfig.current}
			beforeEditActionHandler={beforeEditActionHandler}
			editActionHandler={editActionHandler}
		/>
	);
};

ExternalCanvas.propTypes = {
	config: PropTypes.object,
};

export default ExternalCanvas;
