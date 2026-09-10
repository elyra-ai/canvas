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

import ExternalSubFlow1 from "./extSubFlow1.json";
import ExternalSubFlow2 from "./extSubFlow2.json";

// Keyed by external URL, holds the pipeline flows for external sub-flows.
const externalPipelineFlows = {
	"external-sub-flow-url-1": ExternalSubFlow1,
	"external-sub-flow-url-2": ExternalSubFlow2
};

/**
 * Simulates a back-end call to create a new external pipeline flow.
 * In a real application this would call a server to generate and persist
 * the external URL and pipeline flow ID.
 *
 * @returns {Promise<{extUrl: string, extPipelineFlowId: string}>} The generated URL and flow ID.
 */
export const createExternalFlow = async() => ({
	extUrl: "external-flow-url-" + Date.now(),
	extPipelineFlowId: "external-pipeline-flow-id-" + Date.now()
});

/**
 * Simulates a back-end call to load an external pipeline flow by URL.
 * In a real application this would fetch the pipeline flow from a server
 * using the provided URL.
 *
 * @param {string} externalUrl - The URL key to look up in the external pipeline flows store.
 * @returns {Promise<object>} The pipeline flow object for the given URL.
 */
export const loadExternalPipelineFlow = async(externalUrl) =>
	externalPipelineFlows[externalUrl];

/**
 * Simulates a back-end call to save a newly created external pipeline flow.
 * In a real application this would persist the pipeline flow to a server
 * using the provided URL.
 *
 * @param {string} externalUrl - The URL key under which to save the pipeline flow.
 * @param {object} pipelineFlow - The pipeline flow object to save.
 * @returns {Promise<void>}
 */
export const saveExternalPipelineFlow = async(externalUrl, pipelineFlow) => {
	externalPipelineFlows[externalUrl] = pipelineFlow;
};
