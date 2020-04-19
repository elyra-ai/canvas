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

Cypress.Commands.add("verifyNodeTransform", (nodeLabel, transformValue) => {
	cy.getNodeForLabel(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, transformValue) => {
	cy.getNodeForLabelInSubFlow(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNumberOfNodes", (noOfNodes) => {
	cy.get("#canvas-div-0").find(".node-image")
		.should("have.length", noOfNodes);

	// verify the number of nodes in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountNodes(pipeline).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfPortDataLinks", (noOfLinks) => {
	cy.get(".d3-data-link")
		.should("have.length", noOfLinks);

	// verify the number of port-links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountDataLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfComments", (noOfComments) => {
	cy.get(".d3-comment-group").should("have.length", noOfComments);

	// verify the number of comments in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountComments(pipeline).should("eq", noOfComments);
	});
});

Cypress.Commands.add("verifyNumberOfLinks", (noOfLinks) => {
	// Sum of different types of links on canvas
	cy.get(".d3-data-link").its("length")
		.then((dataLinks) => {
			cy.get(".d3-comment-link").its("length")
				.then((commentLinks) => {
					expect(dataLinks + commentLinks).equal(noOfLinks);
				});
		});

	// verify the number of links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfNodesInSupernode", (supernodeName, noOfNodes) => {
	cy.getSupernodePipeline(supernodeName).then((supernodePipeline) => {
		cy.getCountNodes(supernodePipeline).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfLinksInSupernode", (supernodeName, noOfLinks) => {
	cy.getSupernodePipeline(supernodeName).then((supernodePipeline) => {
		cy.getCountLinks(supernodePipeline).should("eq", noOfLinks);
	});
});
