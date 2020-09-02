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
/* eslint max-len: "off" */

import * as testUtils from "../../utils/eventlog-utils";


Cypress.Commands.add("verifyNodeTransform", (nodeLabel, transformValue) => {
	cy.getNodeWithLabel(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyCommentTransform", (commentText, transformValue) => {
	cy.getCommentWithText(commentText)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyZoomTransform", (transformValue) => {
	cy.get(".svg-area > g")
		.eq(0)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyZoomTransformDoesNotExist", () => {
	cy.get(".svg-area > g")
		.eq(0)
		.its("transform")
		.should("not.exist");
});

Cypress.Commands.add("verifyZoomTransformInExtraCanvas", (transformValue) => {
	cy.get("div#canvas-div-1 > div > .svg-area > g")
		.eq(0)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, transformValue) => {
	cy.getNodeWithLabelInSubFlow(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSupernode", (nodeLabel, supernodeName, transformValue) => {
	cy.getNodeWithLabelInSupernode(nodeLabel, supernodeName)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeIsDeleted", (nodeName, deleteUsingContextMenu) => {
	// verify node is not the canvas DOM
	cy.getNodeWithLabel(nodeName)
		.should("not.exist");

	// verify that the node is not in the internal object model
	cy.getNodeLabelCountFromObjectModel(nodeName)
		.should("eq", 0);

	// Verify delete selected objects entry in console
	verifyEditActionHandlerDeleteSelectedObjectsEntryInConsole(nodeName, deleteUsingContextMenu);
});

function verifyEditActionHandlerDeleteSelectedObjectsEntryInConsole(nodeName, deleteUsingContextMenu) {
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
}

Cypress.Commands.add("verifyCommentIsDeleted", (commentText) => {
	// verify comment is not the canvas DOM
	cy.getCommentWithText(commentText)
		.should("not.exist");

	// verify that the comment is not in the internal object model
	cy.getCommentContentCountFromObjectModel(commentText)
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

Cypress.Commands.add("verifyNodeImage", (nodeLabel, value) => {
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			const nodeImageSelector =
				"[data-id='" + node[0].getAttribute("data-id").replace("grp", "image") + "']";
			cy.get(nodeImageSelector)
				.should("have.attr", "data-image", value);
			// An SVG image should only ever have a single <use> element
			const nodeUseSelector = nodeImageSelector + " use";
			cy.get(nodeUseSelector)
				.should("have.length", 1);

		});
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

Cypress.Commands.add("verifyNodeExistsInExtraCanvas", (nodeName) => {
	// Swtich to extra canvas
	cy.inExtraCanvas();

	// verify node is in the DOM
	cy.getNodeWithLabel(nodeName)
		.should("have.length", 1);

	// Swtich back to regular canvas
	cy.inRegularCanvas();
});

Cypress.Commands.add("verifyCommentExists", (commentText) => {
	// verify comment is in the DOM
	cy.getCommentWithText(commentText)
		.should("have.length", 1);

	// verify that the comment is in the internal object model
	cy.getCommentContentCountFromObjectModel(commentText)
		.then((count) => expect(count).to.equal(1));

	// verify that an event for a new comment is in the external object model event log
	verifyEditActionHandlerEditCommentEntryInConsole(commentText);
});

function verifyEditActionHandlerEditCommentEntryInConsole(commentText) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastLogOfType(doc, "editActionHandler(): editComment");
		expect(lastEventLog.event).to.equal("editActionHandler(): editComment");
		expect(lastEventLog.data.content).to.equal(commentText);
	});
}

Cypress.Commands.add("verifyEditedCommentExists", (commentText) => {
	// verify comment is in the DOM
	cy.getCommentWithText(commentText)
		.should("have.length", 1);

	// verify that the comment is in the internal object model
	cy.getCommentContentCountFromObjectModel(commentText)
		.then((count) => expect(count).to.equal(1));
});

Cypress.Commands.add("verifyNodeElementLocation", (nodeName, nodeElement, xPos, yPos) => {
	// nodeElement can be either "image" or "label"
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeElementSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", nodeElement) + "']";
			cy.get(nodeElementSelector)
				.should("have.attr", "x", String(xPos))
				.and("have.attr", "y", String(yPos));
		});
});

Cypress.Commands.add("verifyNodeElementWidth", (nodeName, nodeElement, width) => {
	// nodeElement can be either "image" or "label"
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeElementSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", nodeElement) + "']";
			cy.get(nodeElementSelector)
				.invoke("css", "width")
				.then((cssValue) => {
					cy.verifyValueInCompareRange(width, cssValue);
				});
		});
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
		if ($body.find(".d3-link-group.d3-data-link").length) {
			cy.document().then((doc) => {
				if (doc.canvasController.getCanvasConfig().enableConnectionType === "Halo") {
					// Connection Type - Halo
					cy.get(".d3-link-group.d3-data-link")
						.its("length")
						.then((canvasLinks) => {
							expect(canvasLinks).to.equal(noOfLinks);
						});
				} else {
					// Connection Type - Ports
					cy.get(".d3-link-group.d3-data-link").should("have.length", noOfLinks);
				}
			});
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
		if ($body.find(".d3-link-group.d3-data-link").length) {
			dataLinks = $body.find(".d3-link-group.d3-data-link").length;
		}
		if ($body.find(".d3-link-group.d3-comment-link").length) {
			commentLinks = $body.find(".d3-link-group.d3-comment-link").length;
		}
		if ($body.find(".d3-link-group.d3-object-link").length) {
			associationLinks = $body.find(".d3-link-group.d3-object-link").length;
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
		if ($body.find(".d3-link-group.d3-comment-link").length) {
			cy.document().then((doc) => {
				if (doc.canvasController.getCanvasConfig().enableConnectionType === "Halo") {
					// Connection Type - Halo
					cy.get(".d3-link-group.d3-comment-link")
						.its("length")
						.then((canvasLinks) => {
							expect(canvasLinks).to.equal(noOfCommentLinks);
						});
				} else {
					// Connection Type - Ports
					cy.get(".d3-link-group.d3-comment-link").should("have.length", noOfCommentLinks);
				}
			});
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

Cypress.Commands.add("verifyNumberOfAssociationLinks", (noOfAssociationLinks) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-link-group.d3-object-link").length) {
			cy.document().then((doc) => {
				if (doc.canvasController.getCanvasConfig().enableConnectionType === "Halo") {
					// Connection Type - Halo
					cy.get(".d3-link-group.d3-object-link")
						.its("length")
						.then((canvasLinks) => {
							expect(canvasLinks).to.equal(noOfAssociationLinks);
						});
				} else {
					// Connection Type - Ports
					cy.get(".d3-link-group.d3-object-link").should("have.length", noOfAssociationLinks);
				}
			});
		} else {
			// No comment links found on canvas
			expect(0).equal(noOfAssociationLinks);
		}
	});

	// verify the number of comment-links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountAssociationLinks(pipeline).should("eq", noOfAssociationLinks);
	});
});

Cypress.Commands.add("verifyLinkPath", (srcNodeName, srcPortId, trgNodeName, trgPortId, path) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", 1);

					cy.getLinkLineUsingLinkId(links[0].id, "line")
						.then((link) => expect(link[0].getAttribute("d")).to.equal(path));
				});
		});
});

Cypress.Commands.add("verifyLinkIsSelected", (linkId) => {
	cy.getLinkUsingLinkId(linkId)
		.then((linkGrp) => expect(linkGrp[0].getAttribute("data-selected")).to.equal("true"));
});

Cypress.Commands.add("verifyLinkIsNotSelected", (linkId) => {
	cy.getLinkUsingLinkId(linkId)
		.then((linkGrp) => expect(linkGrp[0].getAttribute("data-selected")).to.equal(null)); // data-selected will be missing when link is not selected
});

Cypress.Commands.add("verifyLinkIsDeleted", (linkId, deleteUsingContextMenu) => {
	// verify link is not the canvas DOM
	cy.getLinkUsingLinkId(linkId)
		.should("not.exist");

	// verify that the link is not in the internal object model
	cy.getLinkCountFromObjectModel(linkId)
		.should("eq", 0);
});


Cypress.Commands.add("verifyNumberOfPipelines", (noOfPipelines) => {
	cy.getCanvasData().then((canvasData) => {
		expect(canvasData.pipelines.length).to.equal(noOfPipelines);
	});
});

Cypress.Commands.add("verifyNumberOfPipelinesInExtraCanvas", (noOfPipelines) => {
	cy.getCanvasDataForExtraCanvas().then((extraCanvasData) => {
		expect(extraCanvasData.pipelines.length).to.equal(noOfPipelines);
	});
});

Cypress.Commands.add("verifyNumberOfNodesInPipeline", (noOfNodes) => {
	// verify the number of nodes in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountNodes(pipeline).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfLinksInPipeline", (noOfLinks) => {
	// verify the number of links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfNodesInPipelineInExtraCanvas", (noOfNodes) => {
	// verify the number of nodes in the internal object model
	cy.getPipelineForExtraCanvas().then((extraCanvasPipeline) => {
		cy.getCountNodes(extraCanvasPipeline).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfNodesInPipelineAtIndex", (pipelineIndex, noOfNodes) => {
	// verify pipeline 1 have 0 nodes
	cy.getPipelineAtIndex(pipelineIndex).then((pipeline) => {
		cy.getCountNodes(pipeline).should("eq", noOfNodes);
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

Cypress.Commands.add("verifyNumberOfNodesInSupernodeNested", (nodeName, supernodeName, noOfNodes) => {
	cy.getSupernodePipelineNested(nodeName, supernodeName).then((supernodePipelineNested) => {
		cy.getCountNodes(supernodePipelineNested).should("eq", noOfNodes);
	});
});

Cypress.Commands.add("verifyNumberOfLinksInSupernodeNested", (nodeName, supernodeName, noOfLinks) => {
	cy.getSupernodePipelineNested(nodeName, supernodeName).then((supernodePipelineNested) => {
		cy.getCountLinks(supernodePipelineNested).should("eq", noOfLinks);
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
		.then((cssValue) => {
			cy.verifyValueInCompareRange(distFromLeft, cssValue);
		});
	cy.get(".context-menu-popover").first()
		.invoke("css", "top")
		.then((cssValue) => {
			cy.verifyValueInCompareRange(distFromTop, cssValue);
		});
});

Cypress.Commands.add("verifySubmenuPushedUpBy", (distFromTop) => {
	// last() returns context submenu
	cy.get(".context-menu-popover").last()
		.invoke("css", "top")
		.then((cssValue) => {
			// cssValue is a negative number Eg. -91px
			// Sending 91px to verifyValueInCompareRange
			cy.verifyValueInCompareRange(distFromTop, Math.abs(Number(cssValue.split("px")[0])) + "px");
		});
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-dec-group")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-group")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfLabelDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-dec-label")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfPathDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-dec-path")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfLabelDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-label")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfPathDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkFromName(linkName)
		.find(".d3-link-dec-path")
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

Cypress.Commands.add("verifyDecorationImageOnNode", (nodeName, decoratorId, decoratorImage) => {
	cy.getNodeWithLabel(nodeName)
		.find(`.d3-node-dec-group[data-id=node_dec_group_0_${decoratorId}] g .d3-node-dec-image`)
		.then((decImages) => {
			expect(decImages[0].getAttribute("data-image")).equal(decoratorImage);
		});
});

Cypress.Commands.add("verifyDecorationPathOnNode", (nodeName, decoratorId, path) => {
	cy.getNodeWithLabel(nodeName)
		.find(`.d3-node-dec-group[data-id=node_dec_group_0_${decoratorId}] .d3-node-dec-path`)
		.then((decPaths) => {
			expect(decPaths[0].getAttribute("d")).equal(path);
		});
});

Cypress.Commands.add("verifyDecorationPathOnLink", (linkName, decoratorId, path) => {
	cy.getLinkFromName(linkName)
		.find(`.d3-link-dec-group[data-id=link_dec_group_0_${decoratorId}] .d3-link-dec-path`)
		.then((decPaths) => {
			cy.log("d = " + decPaths[0].getAttribute("d"));
			expect(decPaths[0].getAttribute("d")).equal(path);
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

Cypress.Commands.add("verifyNodeDimensions", (nodeId, width, height) => {
	// Find node in object model based on nodeId
	cy.getNodeFromObjectModel(nodeId)
		.then((node) => {
			expect(node.width).to.equal(width);
			expect(node.height).to.equal(height);
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
	cy.getObjectCountFromObjectModel()
		.then((count) => expect(count).to.equal(0));
});

Cypress.Commands.add("verifyCanvasIsEmpty", () => {
	// Verify no nodes on canvas
	cy.verifyNumberOfNodes(0);
	// Verify no comments on canvas
	cy.verifyNumberOfComments(0);
	// Verify no links on canvas
	cy.verifyNumberOfLinks(0);
});

Cypress.Commands.add("verifyLinkBetweenNodes", (srcNodeName, trgNodeName, linkCount) => {
	// verify that the link is on DOM
	cy.get(".d3-link-group")
		.then((canvasLinks) => {
			const noOfCanvasLinks = canvasLinks.length;
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
					verifyEditActionHandlerLinkNodesEntryInConsole(srcNodeId, trgNodeId);
				});
		});
});

function verifyEditActionHandlerLinkNodesEntryInConsole(srcNodeId, trgNodeId) {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect(lastEventLog.event).to.equal("editActionHandler(): linkNodes");
		expect(lastEventLog.data.nodes[0].id).to.equal(srcNodeId);
		expect(lastEventLog.data.targetNodes[0].id).to.equal(trgNodeId);
	});
}

Cypress.Commands.add("verifyNodeDoesNotExistInPalette", (nodeName) => {
	// expect index is -1 since node should not be found in palette
	cy.findNodeIndexInPalette(nodeName)
		.then((idx) => expect(idx).to.equal(-1));
});

Cypress.Commands.add("verifyNodeIsAddedInPaletteCategory", (nodeName, nodeCategory) => {
	// Verify category exists in palette
	cy.findCategory(nodeCategory)
		.should("not.be.null");

	// Open category
	cy.clickCategory(nodeCategory);

	// Verify node exists in category
	cy.findNodeIndexInPalette(nodeName)
		.should("not.eq", -1);
});

Cypress.Commands.add("verifyPaletteNodeImageCSS", (nodeName, style, value) => {
	cy.findNodeIndexInPalette(nodeName)
		.then((nodeIndex) => {
			cy.get(".palette-list-item-icon").eq(nodeIndex)
				.invoke("css", style)
				.then((cssValue) => {
					cy.verifyValueInCompareRange(value, cssValue);
				});
		});
});

Cypress.Commands.add("verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort", (srcNodeName, srcPortId, trgNodeName, trgPortId, linkCount) => {
	// verify that the link is in the internal object model
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					expect(links.length).to.equal(linkCount);
				});
		});
});

Cypress.Commands.add("verifyNumberOfPortsOnNode", (nodeName, portType, noOfPorts) => {
	// Verify the "Supernode" node has 1 "output" ports
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-port-" + portType)
		.should("have.length", noOfPorts);
});

Cypress.Commands.add("verifyNumberOfItemsInToolbar", (noOfItems) => {
	cy.get("#toolbar-items")
		.find("li")
		.its("length")
		.then((totalItemsLength) => {
			// Find hidden items length
			cy.get("#actions-container")
				.find("#overflow-action")
				.eq(0)
				.find(".toolbar-popover-list-hide")
				.eq(0)
				.find("li")
				.its("length")
				.then((hiddenItemsLength) => {
					// Get number of visible items
					const itemsVisible = totalItemsLength - hiddenItemsLength;
					expect(itemsVisible).to.equal(noOfItems);
				});
		});
});

Cypress.Commands.add("verifyPrimaryPipelineZoomInCanvasInfo", (x, y, k) => {
	cy.getPipeline()
		.then((pipeline) => {
			const zoom = pipeline.zoom;
			expect(zoom.x).to.equal(x);
			expect(zoom.y).to.equal(y);
			expect(zoom.k).to.equal(k);
		});
});

Cypress.Commands.add("verifyTipForCategory", (nodeCategory) => {
	// Verify the tip shows next to given category
	cy.get(".tip-palette-item")
		.should("not.eq", null);
	// Verify tip label
	cy.get(".tip-palette-item")
		.find(".tip-palette-label")
		.should("have.text", nodeCategory);
	// Verify tip description
	cy.get(".tip-palette-item")
		.find(".tip-palette-desc")
		.should("have.text", "Description for " + nodeCategory);
});

Cypress.Commands.add("verifyTipForNodeInCategory", (nodeName, nodeCategory) => {
	// Verify the tip shows next to the node in category
	cy.get(".tip-palette-item")
		.should("not.eq", null);
	// Verify tip label
	cy.findNodeIndexInPalette(nodeName)
		.then((nodeIndex) => {
			cy.get(".palette-list-item")
				.eq(nodeIndex)
				.then((paletteItem) => {
					// get node dimensions
					const nodeRight = paletteItem[0].getBoundingClientRect().x + paletteItem[0].getBoundingClientRect().width;
					cy.get(".tip-palette-item")
						.then((tip) => {
							const tipLeft = tip[0].getBoundingClientRect().x;
							expect(tipLeft).to.be.greaterThan(nodeRight);
						});
				});
		});
});

Cypress.Commands.add("verifyTipDoesNotShowForNodeInCategory", (nodeName) => {
	// Verify the tip doesn't show for node in category
	cy.get(".tip-palette-item")
		.should("not.exist");
});

Cypress.Commands.add("verifyTipForNodeAtLocation", (nodeName, tipLocation) => {
	// Verify the tip shows "below" the node "Define Types"
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeTipSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", "tip") + "']";
			cy.get(nodeTipSelector)
				.then((tip) => {
					// Verify tip is displayed on canvas
					cy.wrap(tip).should("have.length", 1);

					// Verify tip location
					const tipTop = tip[0].offsetTop;
					if (tipLocation === "below") {
						expect(tipTop).to.be.greaterThan(node[0].getBoundingClientRect().top + node[0].getBoundingClientRect().height);
					} else if (tipLocation === "above") {
						expect(tipTop).to.be.lessThan(node[0].getBoundingClientRect().top);
					}

					// Verify tip label
					cy.wrap(tip)
						.find(".tip-node-label")
						.should("have.text", nodeName);
				});
		});
});

Cypress.Commands.add("verifyTipDoesNotShowForNode", (nodeName) => {
	// Verify the tip doesn't show for node on canvas
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeTipSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", "tip") + "']";
			cy.get(nodeTipSelector)
				.should("not.exist");
		});
});

Cypress.Commands.add("verifyTipForNodeInSupernodeAtLocation", (nodeName, supernodeName, tipLocation) => {
	// Verify the tip shows "below" the node "Discard Fields" in the supernode "Supernode"
	cy.getNodeWithLabelInSupernode(nodeName, supernodeName)
		.then((node) => {
			const nodeTipSelector = "[data-id='" + node[0].getAttribute("data-id").replace("grp", "tip") + "']";
			cy.get(nodeTipSelector)
				.then((tip) => {
					// Verify tip is displayed on canvas
					cy.wrap(tip).should("have.length", 1);

					// Verify tip location
					const tipTop = tip[0].offsetTop;
					if (tipLocation === "below") {
						expect(tipTop).to.be.greaterThan(node[0].getBoundingClientRect().top + node[0].getBoundingClientRect().height);
					} else if (tipLocation === "above") {
						expect(tipTop).to.be.lessThan(node[0].getBoundingClientRect().top);
					}

					// Verify tip label
					cy.wrap(tip)
						.find(".tip-node-label")
						.should("have.text", nodeName);
				});
		});
});

Cypress.Commands.add("verifyTipForInputPortOfNode", (nodeName, inputPortId, portName) => {
	cy.getNodePortSelector(nodeName, "inp_port", inputPortId)
		.then((portSelector) => {
			cy.getNodePortTipSelector(inputPortId)
				.then((portTipSelector) => {
					cy.get(portTipSelector)
						.then((tip) => {
							// Verify tip is displayed on canvas
							cy.wrap(tip).should("have.length", 1);

							// Verify tip location
							const tipTop = tip[0].offsetTop;
							cy.get(portSelector)
								.then((port) => {
									const portBottom = port[0].getBoundingClientRect().top + port[0].getBoundingClientRect().height;
									expect(tipTop).to.be.greaterThan(portBottom);
								});

							// Verify tip label
							cy.wrap(tip)
								.get(".tip-port")
								.should("have.text", portName);
						});
				});
		});
});

Cypress.Commands.add("verifyTipDoesNotShowForInputPortId", (inputPortId) => {
	// Verify the tip doesn't show for input port id "inPort2"
	cy.getNodePortTipSelector(inputPortId)
		.then((portTipSelector) => cy.get(portTipSelector).should("not.exist"));
});

Cypress.Commands.add("verifyTipForOutputPortOfNode", (nodeName, outputPortId, portName) => {
	cy.getNodePortSelector(nodeName, "out_port", outputPortId)
		.then((portSelector) => {
			cy.getNodePortTipSelector(outputPortId)
				.then((portTipSelector) => {
					cy.get(portTipSelector)
						.then((tip) => {
							// Verify tip is displayed on canvas
							cy.wrap(tip).should("have.length", 1);

							// Verify tip location
							const tipTop = tip[0].offsetTop;
							cy.get(portSelector)
								.then((port) => {
									const portBottom = port[0].getBoundingClientRect().top + port[0].getBoundingClientRect().height;
									expect(tipTop).to.be.greaterThan(portBottom);
								});

							// Verify tip label
							cy.wrap(tip)
								.get(".tip-port")
								.should("have.text", portName);
						});
				});
		});
});

Cypress.Commands.add("verifyTipForLink", (mouseY, sourceNode, sourcePort, targetNode, targetPort) => {
	cy.get("[data-id*=link_tip_0_]") // Find tip with id that starts with 'link_tip_0_'
		.then((tip) => {
			// Verify tip is displayed on canvas
			cy.wrap(tip).should("have.length", 1);

			// Verify tip location
			const tipTop = tip[0].offsetTop;
			expect(tipTop).to.be.greaterThan(mouseY);

			// Verify tip label
			const sourceString = `'${sourceNode}', port '${sourcePort}'`;
			const targetString = `'${targetNode}', port '${targetPort}'`;
			const linkLabel = `Link from ${sourceString} to ${targetString}`;
			cy.wrap(tip)
				.find("#tooltipContainer")
				.should("have.text", linkLabel);
		});

});

Cypress.Commands.add("verifyTipDoesNotShowForLink", () => {
	cy.get("[data-id*=link_tip_0_]") // Find tip with id that starts with 'link_tip_0_'
		.should("not.exist");
});

Cypress.Commands.add("verifyNotificationIconType", (type) => {
	if (type) {
		cy.get(".notificationCounterIcon").should("have.class", type);
	} else {
		cy.get(".notificationCounterIcon").should("not.have.any.keys", ["info", "success", "warning", "error"]);
	}
});

Cypress.Commands.add("verifyNotificationCounter", (count) => {
	cy.get(".toggleNotificationPanel-action .toolbar-text-content").should("have.text", " " + count + " ");
});

Cypress.Commands.add("verifyNotificationMessagesLength", (messagesLength) => {
	cy.get(".notifications-button-container .notifications").should("have.length", messagesLength);
});

Cypress.Commands.add("verifyNotificationMessageContent", (index, type, title, content, timestamp) => {
	cy.get(".notifications-button-container .notifications")
		.eq(index)
		.should((message) => {
			if (type) {
				expect(message).to.have.class(type);
			}
			if (title) {
				expect(message.find(".notification-message-title")).to.have.text(title);
			}
			if (content) {
				expect(message.find(".notification-message-content")).to.have.text(content);
			}
			if (timestamp) {
				expect(message.find(".notification-message-timestamp")).to.exist;
			} else if (typeof timestamp === "boolean" && timestamp === false) {
				expect(message.find(".notification-message-timestamp")).to.not.exist;
			}
		});
});

Cypress.Commands.add("verifyLatestNotificationMessage", (messagesLength, type, timestamp) => {
	cy.verifyNotificationCounter(messagesLength);
	cy.verifyNotificationMessagesLength(messagesLength);
	cy.verifyNotificationIconType(type);
	cy.verifyNotificationMessageContent(messagesLength - 1, type, type + " title", type + " message", timestamp);
});

Cypress.Commands.add("clickNotificationAtIndex", (index) => {
	cy.get(".notifications-button-container .notifications")
		.eq(index)
		.click();
});

Cypress.Commands.add("verifyNotificationCenterHidden", (hidden) => {
	if (hidden) {
		cy.get(".notification-panel-container").should("have.class", "panel-hidden");
	} else {
		cy.get(".notification-panel-container").should("not.have.class", "panel-hidden");
	}
});

Cypress.Commands.add("verifyNotificationCenterContent", (id, content) => {
	if (typeof content === "string" && content.length > 0) {
		cy.get(".notification-panel-" + id).should("contain", content);
	}	else if (typeof content === "string" && content.length === 0) {
		cy.get(".notification-panel-" + id).should("be.empty");
	} else {
		cy.get(".notification-panel-" + id).should("not.exist");
	}
});

Cypress.Commands.add("verifyValueInCompareRange", (value, cssValue) => {
	// value should be in the compare range of cssValue
	expect(Number(value.split("px")[0])).to.be.closeTo(Number(cssValue.split("px")[0]), Cypress.env("compareRange"));
});
