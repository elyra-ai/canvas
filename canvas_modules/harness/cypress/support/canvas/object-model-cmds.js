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

Cypress.Commands.add("getCanvasDataForExtraCanvas", () => {
	cy.document().then((doc) => {
		const extraCanvasData = doc.canvasController2.getCanvasInfo();
		return extraCanvasData;
	});
});

Cypress.Commands.add("getPipeline", () => {
	cy.getCanvasData().then((canvasData) => {
		const pipeline = canvasData.pipelines[0];
		return pipeline;
	});
});

Cypress.Commands.add("getPipelineForExtraCanvas", () => {
	cy.getCanvasDataForExtraCanvas().then((extraCanvasData) => {
		const extraCanvasPipeline = extraCanvasData.pipelines[0];
		return extraCanvasPipeline;
	});
});

Cypress.Commands.add("getSupernodePipeline", (supernodeName) => {
	cy.getSupernodePipelineId(supernodeName).then((supernodePipelineId) => {
		cy.getCanvasData().then((canvasData) =>
			canvasData.pipelines.find((pipeline) => pipeline.id === supernodePipelineId));
	});
});

Cypress.Commands.add("getNodeLabelCountFromObjectModel", (nodeName) => {
	let count = 0;
	cy.getPipeline()
		.then((pipeline) => {
			const nodes = pipeline.nodes;
			nodes.forEach(function(node) {
				if (node.label === nodeName) {
					count++;
				}
			});
			return count;
		});
});

Cypress.Commands.add("getCommentContentCountFromObjectModel", (commentText) => {
	let count = 0;
	cy.getPipeline()
		.then((pipeline) => {
			const comments = pipeline.comments;
			comments.forEach(function(comment) {
				if (comment.content === commentText) {
					count++;
				}
			});
			return count;
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

Cypress.Commands.add("getCountLinksBetweenNodes", (srcNodeName, trgNodeName) => {
	// Find the number of links in object model that have source and target ids.
	cy.getPipeline()
		.then((pipeline) => {
			cy.getNodeIdForLabel(srcNodeName)
				.then((srcNodeId) => {
					cy.getNodeIdForLabel(trgNodeName)
						.then((trgNodeId) => {
							let count = 0;
							const links = pipeline.links;
							for (let lidx = 0; lidx < links.length; lidx++) {
								if (links[lidx].srcNodeId === srcNodeId &&
										links[lidx].trgNodeId === trgNodeId) {
									count++;
								}
							}
							return count;
						});
				});
		});
});

Cypress.Commands.add("clearMessagesFromAllNodes", () => {
	cy.document().then((doc) => {
		cy.getCanvasData()
			.then((canvasData) => {
				canvasData.pipelines.forEach((pipeline) => {
					pipeline.nodes.forEach((node) => {
						delete node.messages;
					});
				});
				doc.canvasController.getObjectModel().setCanvasInfo(canvasData);
			});
	});
});

Cypress.Commands.add("getObjectCountFromObjectModel", () => {
	cy.getPipeline()
		.then((pipeline) =>
			(pipeline.nodes.length + pipeline.comments.length + pipeline.links.length)
		);
});
