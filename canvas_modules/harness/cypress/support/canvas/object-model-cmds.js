/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
