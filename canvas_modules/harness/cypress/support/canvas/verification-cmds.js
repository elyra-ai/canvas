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
import * as testUtils from "../../utils/eventlog-utils";

Cypress.Commands.add("verifyNodeTransform", (nodeLabel, transformValue) => {
	cy.getNodeForLabel(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, transformValue) => {
	cy.getNodeForLabelInSubFlow(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNumberOfNodes", (noOfNodes) => {
	cy.get("body").then(($body) => {
		if ($body.find(".node-image").length) {
			cy.get("#canvas-div-0").find(".node-image")
				.should("have.length", noOfNodes);
		} else {
			// No nodes found on canvas
			expect(0).equal(noOfNodes);
		}
	});

	// verify the number of nodes in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountNodes(pipeline).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfPortDataLinks", (noOfLinks) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-data-link").length) {
			cy.get(".d3-data-link").should("have.length", noOfLinks);
		} else {
			// No Port Data Links found on canvas
			expect(0).equal(noOfLinks);
		}
	});

	// verify the number of port-links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountDataLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfComments", (noOfComments) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-comment-group").length) {
			cy.get(".d3-comment-group").should("have.length", noOfComments);
		} else {
			// No comments found on canvas
			expect(0).equal(noOfComments);
		}
	});

	// verify the number of comments in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountComments(pipeline).should("eq", noOfComments);
	});
});

Cypress.Commands.add("verifyNumberOfLinks", (noOfLinks) => {
	// Sum of different types of links on canvas
	cy.get("body").then(($body) => {
		let dataLinks = 0;
		let commentLinks = 0;
		let associationLinks = 0;
		if ($body.find(".d3-data-link").length) {
			dataLinks = $body.find(".d3-data-link").length;
		}
		if ($body.find(".d3-comment-link").length) {
			commentLinks = $body.find(".d3-comment-link").length;
		}
		if ($body.find(".d3-object-link").length) {
			associationLinks = $body.find(".d3-object-link").length;
		}
		expect(dataLinks + commentLinks + associationLinks).equal(noOfLinks);
	});

	// verify the number of links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfCommentLinks", (noOfCommentLinks) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-comment-link").length) {
			cy.get(".d3-comment-link").should("have.length", noOfCommentLinks);
		} else {
			// No comment links found on canvas
			expect(0).equal(noOfCommentLinks);
		}
	});

	// verify the number of comment-links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountCommentLinks(pipeline).should("eq", noOfCommentLinks);
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

Cypress.Commands.add("verifyNumberOfSelectedObjects", (noOfSelectedObjects) => {
	cy.getNumberOfSelectedComments()
		.then((selectedComments) => {
			cy.getNumberOfSelectedNodes()
				.then((selectedNodes) => {
					expect(noOfSelectedObjects).equal(selectedComments + selectedNodes);
				});
		});
});

Cypress.Commands.add("verifyOptionInContextMenu", (optionName) => {
	cy.getOptionFromContextMenu(optionName).should("have.length", 1);
});

Cypress.Commands.add("verifyContextMenuPosition", (distFromLeft, distFromTop) => {
	// first() returns context menu
	cy.get(".context-menu-popover").first()
		.invoke("css", "left")
		.then((leftDist) => {
			expect(Math.round(parseFloat(leftDist.split("px")[0]))).equal(distFromLeft);
		});
	cy.get(".context-menu-popover").first()
		.invoke("css", "top")
		.then((topDist) => {
			expect(Math.round(parseFloat(topDist.split("px")[0]))).equal(distFromTop);
		});
});

Cypress.Commands.add("verifySubmenuPushedUpBy", (distFromTop) => {
	// last() returns context submenu
	cy.get(".context-menu-popover").last()
		.invoke("css", "top")
		.then((topDist) => {
			expect(Math.abs(parseFloat(topDist.split("px")[0]))).equal(distFromTop);
		});
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-node-dec-outline")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-outline")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfLabelDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-node-dec-label")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfLabelDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-label")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyLabelDecoration", (nodeName, decoratorId, label, xPos, yPos) => {
	cy.verifyDecorationTransformOnNode(nodeName, decoratorId, xPos, yPos)
		.then((labelDecorator) => {
			cy.wrap(labelDecorator)
				.find(".d3-node-dec-label")
				.should("have.text", label);
		});
});

Cypress.Commands.add("verifyDecorationTransformOnNode", (nodeName, decoratorId, xPos, yPos) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-node-dec-group")
		.then((decorators) => {
			const decorator = decorators.filter((idx) =>
				decorators[idx].getAttribute("data-id") === ("node_dec_group_0_" + decoratorId));
			expect(decorator[0].getAttribute("data-id")).equal(`node_dec_group_0_${decoratorId}`);
			expect(decorator[0].getAttribute("transform")).equal(`translate(${xPos}, ${yPos})`);
			return decorator;
		});
});

Cypress.Commands.add("verifyDecorationTransformOnLink", (linkName, decoratorId, xPos, yPos) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-group")
		.then((decorators) => {
			const decorator = decorators.filter((idx) =>
				decorators[idx].getAttribute("data-id") === ("link_dec_group_0_" + decoratorId));
			expect(decorator[0].getAttribute("data-id")).equal(`link_dec_group_0_${decoratorId}`);
			expect(decorator[0].getAttribute("transform")).equal(`translate(${xPos}, ${yPos})`);
			return decorator;
		});
});

Cypress.Commands.add("verifyDecorationImage", (nodeName, decoratorId, decoratorImage) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-node-dec-image")
		.then((decoratorImages) => {
			const decorator = decoratorImages.filter((idx) =>
				decoratorImages[idx].getAttribute("data-id") === ("node_dec_image_0_" + decoratorId));
			expect(decorator[0].getAttribute("data-id")).equal(`node_dec_image_0_${decoratorId}`);
			expect(decorator[0].getAttribute("data-image")).equal(decoratorImage);
		});
});

Cypress.Commands.add("verifyDecorationHandlerEntryInConsole", (decoratorId) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal(`decorationHandler() Decoration ID = ${decoratorId}`);
		expect(lastEventLog.data).to.equal(decoratorId);
	});
});

Cypress.Commands.add("verifyErrorMarkerOnNode", (nodeName) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-error-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyWarningMarkerOnNode", (nodeName) => {
	cy.getNodeForLabel(nodeName)
		.find(".d3-warning-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyNoErrorOrWarningMarkerOnNode", (nodeName) => {
	cy.getNodeForLabel(nodeName)
		.then((node) => {
			// Verify error marker does not exist
			cy.wrap(node)
				.find(".d3-error-circle")
				.should("not.exist");

			// Verify warning marker does not exist
			cy.wrap(node)
				.find(".d3-error-warning")
				.should("not.exist");
		});
});

Cypress.Commands.add("verifyErrorMarkerOnNodeInSupernode", (nodeName, supernodeName) => {
	cy.getNodeForLabelInSupernode(nodeName, supernodeName)
		.find(".d3-error-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyNoErrorOrWarningMarkerOnNodeInSupernode", (nodeName, supernodeName) => {
	cy.getNodeForLabelInSupernode(nodeName, supernodeName)
		.then((node) => {
			// Verify error marker does not exist
			cy.wrap(node)
				.find(".d3-error-circle")
				.should("not.exist");

			// Verify warning marker does not exist
			cy.wrap(node)
				.find(".d3-error-warning")
				.should("not.exist");
		});
});
