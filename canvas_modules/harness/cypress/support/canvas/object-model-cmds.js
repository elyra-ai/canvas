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

Cypress.Commands.add("getExternalPipelineFlows", () => {
	cy.document().then((doc) => {
		const extPFlows = doc.canvasController.getObjectModel().getExternalPipelineFlows();
		return extPFlows;
	});
});

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
	cy.get(".svg-area").then((svgArea) => {
		const pipelineId = svgArea[0].getAttribute("data-pipeline-id");
		cy.getPipelineById(pipelineId).then((pipeline) => pipeline);
	});
});

Cypress.Commands.add("getPipelineById", (id) => {
	cy.getCanvasData().then((canvasData) => {
		const pipeline = canvasData.pipelines.find((p) => p.id === id);
		return pipeline;
	});
});

Cypress.Commands.add("getPipelineForExtraCanvas", () => {
	cy.getCanvasDataForExtraCanvas().then((extraCanvasData) => {
		const extraCanvasPipeline = extraCanvasData.pipelines[0];
		return extraCanvasPipeline;
	});
});

Cypress.Commands.add("getPipelineAtIndex", (pipelineIndex) => {
	cy.getCanvasData().then((canvasData) => {
		const pipelineAtIndex = canvasData.pipelines[pipelineIndex];
		return pipelineAtIndex;
	});
});

Cypress.Commands.add("getSupernodePipeline", (supernodeName) => {
	cy.getSupernodePipelineId(supernodeName).then((supernodePipelineId) => {
		cy.getCanvasData().then((canvasData) =>
			canvasData.pipelines.find((pipeline) => pipeline.id === supernodePipelineId));
	});
});

Cypress.Commands.add("getSupernodePipelineNested", (nodeName, supernodeName) => {
	// Get pipeline id of node within supernode
	cy.getSupernodePipelineIdNested(nodeName, supernodeName).then((nestedSupernodePipelineId) => {
		cy.getCanvasData().then((canvasData) =>
			canvasData.pipelines.find((pipeline) => pipeline.id === nestedSupernodePipelineId));
	});
});

Cypress.Commands.add("getNodeFromObjectModel", (nodeId) => {
	cy.getPipeline().then((pipeline) =>
		pipeline.nodes.find((node) => node.id === nodeId));
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

Cypress.Commands.add("getLinkCountFromObjectModel", (linkId) => {
	let count = 0;
	cy.getPipeline()
		.then((pipeline) => {
			const links = pipeline.links;
			links.forEach(function(link) {
				if (link.id === linkId) {
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

Cypress.Commands.add("getCountAssociationLinks", (pipeline) => {
	let count = 0;
	const assoclinks = pipeline.links;
	assoclinks.forEach(function(assoclink) {
		if (assoclink.type === "associationLink") {
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

Cypress.Commands.add("setNodeDecorations", (nodeName, decorations) => {
	cy.document().then((doc) => {
		cy.getNodeIdForLabel(nodeName)
			.then((nodeId) => {
				doc.canvasController.setNodeDecorations(nodeId, decorations);
			});
	});
});

Cypress.Commands.add("setLinkDecorations", (linkName, decorations) => {
	cy.document().then((doc) => {
		cy.getLinkIdForLabel(linkName)
			.then((linkId) => {
				doc.canvasController.setLinkDecorations(linkId, decorations);
			});
	});
});

Cypress.Commands.add("getCategory", (categoryLabel) => {
	cy.document().then((doc) => {
		const palData = doc.canvasController.getPaletteData();
		return palData.categories.find((cat) => cat.label === categoryLabel);
	});
});

Cypress.Commands.add("getNodeTemplate", (nodeLabel, categoryLabel) => {
	cy.getCategory(categoryLabel).then((cat) => {
		const nodeTypes = cat.node_types;
		return nodeTypes.find((nt) => nt.app_data.ui_data.label === nodeLabel);
	});
});
