/*
 * Copyright 2017-2020 IBM Corporation
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

Cypress.Commands.add("getCanvasData", () => {
	cy.document().then((doc) => {
		const canvasData = doc.canvasController.getCanvasInfo();
		return canvasData;
	});
});

Cypress.Commands.add("getPipeline", () => {
	cy.getCanvasData().then((canvasData) => {
		const pipeline = canvasData.pipelines[0];
		return pipeline;
	});
});

Cypress.Commands.add("getSupernodePipeline", (supernodeName) => {
	cy.getSupernodePipelineId(supernodeName).then((supernodePipelineId) => {
		cy.getCanvasData().then((canvasData) =>
			canvasData.pipelines.find((pipeline) => pipeline.id === supernodePipelineId));
	});
});

Cypress.Commands.add("getCountNodes", (pipeline) => pipeline.nodes.length);

Cypress.Commands.add("getCountComments", (pipeline) => pipeline.comments.length);

Cypress.Commands.add("getCountLinks", (pipeline) => pipeline.links.length);

Cypress.Commands.add("getCountDataLinks", (pipeline) => {
	let count = 0;
	const datalinks = pipeline.links;
	datalinks.forEach(function(datalink) {
		if (datalink.type === "nodeLink") {
			count++;
		}
	});
	return count;
});

Cypress.Commands.add("getCountCommentLinks", (pipeline) => {
	let count = 0;
	const commentlinks = pipeline.links;
	commentlinks.forEach(function(commentlink) {
		if (commentlink.type === "commentLink") {
			count++;
		}
	});
	return count;
});
