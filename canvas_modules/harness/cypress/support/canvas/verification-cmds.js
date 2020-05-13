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
	cy.getNodeWithLabel(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyCommentTransform", (commentText, transformValue) => {
	cy.getCommentWithText(commentText)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, transformValue) => {
	cy.getNodeWithLabelInSubFlow(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeIsDeleted", (nodeName, deleteUsingContextMenu) => {
	// verify node is not the canvas DOM
	cy.getNodeWithLabel(nodeName)
		.should("not.exist");

	// verify that the node is not in the internal object model
	cy.getNodeFromObjectModel(nodeName)
		.should("eq", 0);

	// Verify delete selected objects entry in console
	cy.verifyEditActionHandlerDeleteSelectedObjectsEntryInConsole(nodeName, deleteUsingContextMenu);
});

Cypress.Commands.add("verifyCommentIsDeleted", (commentText) => {
	// verify comment is not the canvas DOM
	cy.getCommentWithText(commentText)
		.should("not.exist");

	// verify that the comment is not in the internal object model
	cy.getCommentFromObjectModel(commentText)
		.should("eq", 0);
});

Cypress.Commands.add("verifyNodeIsSelected", (nodeName) => {
	// Verify node is selected on document
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeOutlineSelector =
			"[data-id='" + node[0].getAttribute("data-id").replace("grp", "sel_outline") + "']";
			cy.get(nodeOutlineSelector)
				.should("have.attr", "data-selected", "yes");
		});

	// Verify node is selected in object model
	cy.isNodeSelected(nodeName).should("eq", true);
});

Cypress.Commands.add("verifyCommentIsSelected", (commentText) => {
	// Verify comment is selected on document
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const commentOutlineSelector =
			"[data-id='" + comment[0].getAttribute("data-id").replace("grp", "sel_outline") + "']";
			cy.get(commentOutlineSelector)
				.should("have.attr", "data-selected", "yes");
		});

	// Verify comment is selected in object model
	cy.isCommentSelected(commentText).should("eq", true);
});

Cypress.Commands.add("verifyNodeIsNotSelected", (nodeName) => {
	// Verify node is not selected on document
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeOutlineSelector =
			"[data-id='" + node[0].getAttribute("data-id").replace("grp", "sel_outline") + "']";
			cy.get(nodeOutlineSelector)
				.should("have.attr", "data-selected", "no");
		});

	// Verify node is not selected in object model
	cy.isNodeSelected(nodeName).should("eq", false);
});

Cypress.Commands.add("verifyCommentIsNotSelected", (commentText) => {
	// Verify comment is not selected on document
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const commentOutlineSelector =
			"[data-id='" + comment[0].getAttribute("data-id").replace("grp", "sel_outline") + "']";
			cy.get(commentOutlineSelector)
				.should("have.attr", "data-selected", "no");
		});

	// Verify comment is not selected in object model
	cy.isCommentSelected(commentText).should("eq", false);
});

Cypress.Commands.add("verifyCommentIsAdded", (commentText) => {
	// verify comment is in the DOM
	cy.getCommentWithText(commentText)
		.should("have.length", 1);

	// verify that the comment is in the internal object model
	cy.getCommentFromObjectModel(commentText)
		.then((count) => expect(count).to.equal(1));

	// verify that an event for a new comment is in the external object model event log
	cy.verifyEditActionHandlerEditCommentEntryInConsole(commentText);
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

Cypress.Commands.add("verifyNumberOfNodesInExtraCanvas", (noOfNodes) => {
	cy.get("#canvas-div-1").find(".node-image")
		.should("have.length", noOfNodes);

	// verify the number of nodes in the internal object model
	cy.getPipelineForExtraCanvas().then((extraCanvasPipeline) => {
		cy.getCountNodes(extraCanvasPipeline).should("eq", noOfNodes);
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
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-dec-outline")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-outline")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfLabelDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeWithLabel(nodeName)
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
	cy.getNodeWithLabel(nodeName)
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
	cy.getNodeWithLabel(nodeName)
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

Cypress.Commands.add("verifyApplyPropertyChangesEntryInConsole", (propertyValue) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "applyPropertyChanges()");
		expect("applyPropertyChanges()").to.equal(lastEventLog.event);
		expect(propertyValue).to.equal(lastEventLog.data.form.samplingRatio);
	});
});

Cypress.Commands.add("verifyEditActionHandlerLinkNodesEntryInConsole", (srcNodeId, trgNodeId) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): linkNodes");
		expect(lastEventLog.data.nodes[0].id).to.equal(srcNodeId);
		expect(lastEventLog.data.targetNodes[0].id).to.equal(trgNodeId);
	});
});

Cypress.Commands.add("verifyEditActionHandlerDeleteSelectedObjectsEntryInConsole", (nodeName, deleteUsingContextMenu) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): deleteSelectedObjects");
		if (deleteUsingContextMenu) {
			// node is deleted using context menu
			expect(lastEventLog.data.targetObject.label).to.equal(nodeName);
		} else {
			// node is deleted using keyboard delete key or using toolbar delete option
			expect(lastEventLog.data.selectedObjects[0].label).to.equal(nodeName);
		}
	});
});

Cypress.Commands.add("verifyEditActionHandlerEditCommentEntryInConsole", (commentText) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc, 3);
		expect(lastEventLog.event).to.equal("editActionHandler(): editComment");
		expect(lastEventLog.data.content).to.equal(commentText);
	});
});

Cypress.Commands.add("verifyErrorMarkerOnNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-error-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyWarningMarkerOnNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-warning-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyNoErrorOrWarningMarkerOnNode", (nodeName) => {
	cy.getNodeWithLabel(nodeName)
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
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
		.find(".d3-error-circle")
		.should("have.length", 1);
});

Cypress.Commands.add("verifyNoErrorOrWarningMarkerOnNodeInSupernode", (nodeName, supernodeName) => {
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
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

Cypress.Commands.add("verifyCommentDimensions", (commentText, width, height) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const commentSelector = "[data-id='" + comment[0].getAttribute("data-id").replace("grp", "body") + "']";
			cy.getCommentDimensions(commentSelector)
				.then((commentDimensions) => {
					expect(commentDimensions.width).to.equal(width);
					expect(commentDimensions.height).to.equal(height);
				});
		});
});

Cypress.Commands.add("verifyObjectModelIsEmpty", () => {
	cy.isObjectModelEmpty()
		.then((count) => expect(count).to.equal(0));
});

Cypress.Commands.add("verifyLinkBetweenNodes", (srcNodeName, trgNodeName, linkCount) => {
	// verify that the link is on DOM
	cy.get(".d3-selectable-link")
		.then((canvasLinks) => {
			const noOfCanvasLinks = canvasLinks.length / 2; // Divide by 2 because line and arrow head use same class
			expect(noOfCanvasLinks).to.equal(linkCount);
		});

	// verify that the link is in the internal object model
	cy.getCountLinksBetweenNodes(srcNodeName, trgNodeName)
		.then((noOfLinks) => expect(noOfLinks).to.equal(1));

	// verify that an event for a new link is in the external object model event log
	cy.getNodeIdForLabel(srcNodeName)
		.then((srcNodeId) => {
			cy.getNodeIdForLabel(trgNodeName)
				.then((trgNodeId) => {
					cy.verifyEditActionHandlerLinkNodesEntryInConsole(srcNodeId, trgNodeId);
				});
		});
});
