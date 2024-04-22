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
/* eslint max-len: "off" */

import * as testUtils from "../../utils/eventlog-utils";
import { extractTransformValues } from "./utils-cmds.js";

const mainCanvasSelector = "#canvas-div-0 > #d3-svg-canvas-div-0 > .svg-area > .d3-canvas-group > .d3-nodes-links-group > ";
const dataLinkSelector = mainCanvasSelector + ".d3-link-group.d3-data-link .d3-link-line";
const commentLinkSelector = mainCanvasSelector + ".d3-link-group.d3-comment-link .d3-link-line";
const assocLinkSelector = mainCanvasSelector + ".d3-link-group.d3-object-link .d3-link-line";
const nodesInFlowSelector = ".d3-svg-canvas-div > .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group";
const nodesInSubFlowSelector = ".d3-svg-canvas-div > .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group > .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group";
const nodesInSubFlowInSubFlowSelector = ".d3-svg-canvas-div > .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group > .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group> .svg-area > .d3-canvas-group > .d3-nodes-links-group > .d3-node-group";


Cypress.Commands.add("verifyNumberOfBreadcrumbs", (noOfBreadcrumbs) => {
	cy.get(".harness-pipeline-breadcrumbs-label")
		.should("have.length", noOfBreadcrumbs);
});

Cypress.Commands.add("verifyNodeTransform", (nodeLabel, x, y) => {
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			const transformAttr = node[0].getAttribute("transform");
			const transform = extractTransformValues(transformAttr);

			cy.verifyValueInCompareRange(Math.round(transform.x), x);
			cy.verifyValueInCompareRange(Math.round(transform.y), y);
		});
});

Cypress.Commands.add("verifyCommentTransform", (commentText, x, y) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const transformAttr = comment[0].getAttribute("transform");
			const transform = extractTransformValues(transformAttr);

			cy.verifyValueInCompareRange(Math.round(transform.x), x);
			cy.verifyValueInCompareRange(Math.round(transform.y), y);
		});
});

Cypress.Commands.add("verifyCommentColor", (commentText, color) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const classVal = comment[0].className.baseVal;
			const col = color ? " bkg-col-" + color : "";
			expect(classVal).to.equal("d3-comment-group d3-draggable" + col);
		});
});

Cypress.Commands.add("verifyCommentContainsHTML", (commentText, commentHTML) => {
	cy.getCommentWithText(commentText)
		.find("foreignObject .d3-comment-text")
		.then((com) => {
			expect(com[0].innerHTML).to.equal(commentHTML);
		});
});

Cypress.Commands.add("verifyZoomTransform", (x, y, k) => {
	cy.getCanvasTranslateCoords()
		.then((transform) => {
			cy.verifyValueInCompareRange(Math.round(transform.x), x);
			cy.verifyValueInCompareRange(Math.round(transform.y), y);
			cy.verifyValueInCompareRange(Math.round(transform.k * 100), k * 100);
		});
});

Cypress.Commands.add("verifyCreateAutoCommentCommand", (x, y) => {
	cy.document().then((doc) => {
		const lastEventLog = testUtils.getLastEventLogData(doc);
		expect("createAutoComment").to.equal(lastEventLog.data.editType);
		expect("toolbar").to.equal(lastEventLog.data.editSource);
		expect(x).to.equal(lastEventLog.data.mousePos.x);
		expect(y).to.equal(lastEventLog.data.mousePos.y);
	});
});


Cypress.Commands.add("verifyZoomTransformDoesNotExist", () => {
	cy.get(".svg-area > g")
		.eq(0)
		.its("transform")
		.should("not.exist");
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, x, y) => {
	cy.getNodeWithLabelInSubFlow(nodeLabel)
		.then((node) => {
			const transformAttr = node[0].getAttribute("transform");
			const transform = extractTransformValues(transformAttr);

			cy.verifyValueInCompareRange(Math.round(transform.x), x);
			cy.verifyValueInCompareRange(Math.round(transform.y), y);
		});
});

Cypress.Commands.add("verifyNodeTransformInSupernode", (nodeLabel, supernodeName, x, y) => {
	cy.getNodeWithLabelInSupernode(nodeLabel, supernodeName)
		.then((node) => {
			const transformAttr = node[0].getAttribute("transform");
			const transform = extractTransformValues(transformAttr);

			cy.verifyValueInCompareRange(Math.round(transform.x), x);
			cy.verifyValueInCompareRange(Math.round(transform.y), y);
		});
});

Cypress.Commands.add("verifyNodeIsDeleted", (nodeName, deleteUsingContextMenu) => {
	// verify node is not the canvas DOM
	cy.checkNodeDoesntExist(nodeName);

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
	cy.checkCommentDoesntExist(commentText);

	// verify that the comment is not in the internal object model
	cy.getCommentContentCountFromObjectModel(commentText)
		.should("eq", 0);
});

Cypress.Commands.add("verifyNodeIsSelected", (nodeName) => {
	// Verify node is selected on document
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeOutlineSelector = getNodeSelectionOutlineSelector(node[0]);
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
			const commentOutlineSelector = getCommentSelectionOutlineSelector(comment[0]);
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
			const nodeOutlineSelector = getNodeSelectionOutlineSelector(node[0]);
			cy.get(nodeOutlineSelector)
				.should("have.attr", "data-selected", "no");
		});

	// Verify node is not selected in object model
	cy.isNodeSelected(nodeName).should("eq", false);
});

Cypress.Commands.add("verifyNodeImage", (nodeLabel, value) => {
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			const nodeImageSel = getNodeImageSelector(node[0]);
			cy.get(nodeImageSel)
				.should("have.attr", "data-image", value);
		});
});

Cypress.Commands.add("verifyCommentIsNotSelected", (commentText) => {
	// Verify comment is not selected on document
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const commentOutlineSelector = getCommentSelectionOutlineSelector(comment[0]);
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

Cypress.Commands.add("verifyNodeExists", (nodeLabel) => {
	// Verify node is in the DOM
	cy.getNodeWithLabel(nodeLabel)
		.should("have.length", 1);

	// Verify that the node is in the internal object model
	cy.getNodeLabelCountFromObjectModel(nodeLabel)
		.then((count) => expect(count).to.equal(1));
});

Cypress.Commands.add("verifyCommentExists", (commentText) => {
	// verify comment is in the DOM
	cy.getCommentWithText(commentText)
		.should("have.length", 1);

	// verify that the comment is in the internal object model
	cy.getCommentContentCountFromObjectModel(commentText)
		.then((count) => expect(count).to.equal(1));
});

Cypress.Commands.add("verifyEditActionInConsole", (action, dataField, dataContent) => {
	cy.document().then((doc) => {
		const actionText = "editActionHandler(): " + action;
		const lastEventLog = testUtils.getLastLogOfType(doc, actionText);
		expect(lastEventLog.event).to.equal(actionText);
		expect(lastEventLog.data[dataField]).to.equal(dataContent);
	});
});

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
			const nodeElementSelector = nodeElement === "label"
				? getNodeLabelSelector(node[0])
				: getNodeImageSelector(node[0]);
			cy.get(nodeElementSelector)
				.should("have.attr", "x", String(xPos))
				.and("have.attr", "y", String(yPos));
		});
});

Cypress.Commands.add("verifyNodeElementWidth", (nodeName, nodeElement, width) => {
	// nodeElement can be either "image" or "label"
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeElementSelector = nodeElement === "label"
				? getNodeLabelSelector(node[0])
				: getNodeImageSelector(node[0]);
			cy.get(nodeElementSelector)
				.invoke("css", "width")
				.then((cssValue) => {
					cy.verifyPixelValueInCompareRange(width, cssValue);
				});
		});
});

Cypress.Commands.add("verifyNumberOfNodes", (noOfNodes) => {
	cy.get("body").then(($body) => {
		if ($body.find(nodesInFlowSelector).length) {
			cy.get(nodesInFlowSelector)
				.should("have.length", noOfNodes);
		} else {
			// No nodes found on canvas
			expect(0).equal(noOfNodes);
		}
	});

	// verify the number of nodes in the internal object model
	cy.get(".svg-area")
		.find(".d3-svg-background")
		.then((background) => {
			cy.getPipelineById(background.attr("data-pipeline-id"))
				.then((pipeline) => {
					cy.getCountNodes(pipeline).should("eq", noOfNodes);
				});
		});
});

Cypress.Commands.add("verifyNumberOfNodesInSubFlow", (noOfNodes) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-canvas-group .d3-node-image").length) {
			cy.get(nodesInSubFlowSelector)
				.should("have.length", noOfNodes);
		} else {
			// No nodes found on canvas
			expect(0).equal(noOfNodes);
		}
	});
});

Cypress.Commands.add("verifyNumberOfNodesInSubFlowInSubFlow", (noOfNodes) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-canvas-group .d3-node-image").length) {
			cy.get(nodesInSubFlowInSubFlowSelector)
				.should("have.length", noOfNodes);
		} else {
			// No nodes found on canvas
			expect(0).equal(noOfNodes);
		}
	});
});


Cypress.Commands.add("verifyNumberOfNodesInExtraCanvas", (noOfNodes) => {
	cy.get("#canvas-div-1").find(".d3-canvas-group .d3-node-image")
		.should("have.length", noOfNodes);

	// verify the number of nodes in the internal object model
	cy.getPipelineForExtraCanvas().then((extraCanvasPipeline) => {
		cy.getCountNodes(extraCanvasPipeline).should("eq", noOfNodes);
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
		let objectLinks = 0;
		if ($body.find(dataLinkSelector).length) {
			dataLinks = $body.find(dataLinkSelector).length;
		}
		if ($body.find(commentLinkSelector).length) {
			commentLinks = $body.find(commentLinkSelector).length;
		}
		if ($body.find(assocLinkSelector).length) {
			objectLinks = $body.find(assocLinkSelector).length;
		}
		expect(dataLinks + commentLinks + objectLinks).equal(noOfLinks);
	});

	// verify the number of links in the internal object model
	cy.getPipeline().then((pipeline) => {
		cy.getCountLinks(pipeline).should("eq", noOfLinks);
	});
});

Cypress.Commands.add("verifyNumberOfPortDataLinks", (noOfLinks) => {
	cy.get("body").then(($body) => {
		if ($body.find(dataLinkSelector).length) {
			cy.document().then((doc) => {
				cy.get(dataLinkSelector).should("have.length", noOfLinks);
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

Cypress.Commands.add("verifyNumberOfCommentLinks", (noOfCommentLinks) => {
	cy.get("body").then(($body) => {
		if ($body.find(commentLinkSelector).length) {
			cy.document().then((doc) => {
				cy.get(commentLinkSelector).should("have.length", noOfCommentLinks);
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
		if ($body.find(assocLinkSelector).length) {
			cy.document().then((doc) => {
				cy.get(assocLinkSelector).should("have.length", noOfAssociationLinks);
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

Cypress.Commands.add("verifyLinkPath", (srcNodeName, srcPortId, trgNodeName, trgPortId, expectedPath) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", 1);
					cy.getLinkLineUsingLinkId(links[0].id, "line")
						.then((linkLine) => {
							verifyPath(linkLine[0], expectedPath);
						});
				});
		});
});

Cypress.Commands.add("verifyDetachedLinkPathFromSource", (srcNodeName, srcPortId, pathCount, expectedPaths) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getDetachedPortLinksFromSource(pipeline, srcNodeName, srcPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", pathCount);
					links.forEach((link, index) => {
						cy.getLinkLineUsingLinkId(link.id, "line")
							.then((linkLine) => {
								verifyPath(linkLine[0], expectedPaths[index]);
							});
					});
				});
		});
});

Cypress.Commands.add("verifyDetachedLinkPathToTarget", (trgNodeName, trgPortId, pathCount, expectedPaths) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getDetachedPortLinksToTarget(pipeline, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", pathCount);
					links.forEach((link, index) => {
						cy.getLinkLineUsingLinkId(link.id, "line")
							.then((linkLine) => {
								verifyPath(linkLine[0], expectedPaths[index]);
							});
					});
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
	cy.checkLinkDoesntExist(linkId);

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

Cypress.Commands.add("verifyNumberOfExternalPipelines", (noOfPipelines) => {
	cy.getCanvasData().then((canvasData) => {
		const externalPipelines = canvasData.pipelines.filter((p) => p.parentUrl);
		expect(externalPipelines.length).to.equal(noOfPipelines);
	});
});

Cypress.Commands.add("verifyNumberOfExternalPipelineFlows", (noOfExtPipelineFlows) => {
	cy.getExternalPipelineFlows().then((extPFlows) => {
		expect(extPFlows.length).to.equal(noOfExtPipelineFlows);
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
	cy.getNumberOfSelectedLinks()
		.then((selectedLinks) => {
			cy.getNumberOfSelectedComments()
				.then((selectedComments) => {
					cy.getNumberOfSelectedNodes()
						.then((selectedNodes) => {
							expect(noOfSelectedObjects).equal(selectedLinks + selectedComments + selectedNodes);
						});
				});
		});
});

Cypress.Commands.add("verifyOptionInContextMenu", (optionName) => {
	cy.getOptionFromContextMenu(optionName).should("have.length", 1);
});

Cypress.Commands.add("verifyOptionNotInContextMenu", (optionName) => {
	cy.getOptionFromContextMenu(optionName).should("not.exist");
});

Cypress.Commands.add("verifyContextMenuPosition", (distFromLeft, distFromTop) => {
	// first() returns context menu
	cy.get(".context-menu-popover").first()
		.invoke("css", "left")
		.then((cssValue) => {
			cy.verifyPixelValueInCompareRange(distFromLeft, cssValue);
		});
	cy.get(".context-menu-popover").first()
		.invoke("css", "top")
		.then((cssValue) => {
			cy.verifyPixelValueInCompareRange(distFromTop, cssValue);
		});
});

Cypress.Commands.add("verifySubmenuPushedUpBy", (distFromTop) => {
	// last() returns context submenu
	cy.get(".context-menu-popover").last()
		.invoke("css", "top")
		.then((cssValue) => {
			// cssValue is a negative number Eg. -91px
			// Sending 91px to verifyPixelValueInCompareRange
			cy.verifyPixelValueInCompareRange(distFromTop, Math.abs(Number(cssValue.split("px")[0])) + "px");
		});
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnNode", (nodeName, noOfDecorators) => {
	cy.getNodeWithLabel(nodeName)
		.find(".d3-node-dec-group")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkWithLabel(linkName)
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
	cy.getLinkWithLabel(linkName)
		.find(".d3-link-dec-label")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyNumberOfPathDecoratorsOnLink", (linkName, noOfDecorators) => {
	cy.getLinkWithLabel(linkName)
		.find(".d3-link-dec-path")
		.should("have.length", noOfDecorators);
});

Cypress.Commands.add("verifyLabelDecorationOnNode", (nodeName, decoratorId, label, xPos, yPos) => {
	cy.verifyDecorationTransformOnNode(nodeName, decoratorId, xPos, yPos)
		.then((labelDecorator) => {
			cy.wrap(labelDecorator)
				.find(".d3-node-dec-label")
				.should("have.text", label);
		});
});

Cypress.Commands.add("verifyLabelDecorationOnLink", (linkLabel, decoratorId, label, xPos, yPos) => {
	cy.verifyDecorationTransformOnLink(linkLabel, decoratorId, xPos, yPos)
		.then((labelDecorator) => {
			cy.wrap(labelDecorator)
				.find(".d3-link-dec-label")
				.should("have.text", label);
		});
});

Cypress.Commands.add("verifyJsxDecorationOnNode", (nodeName, decoratorId, xPos, yPos) => {
	cy.verifyDecorationTransformOnNode(nodeName, decoratorId, xPos, yPos)
		.then((jsxDecorator) => {
			cy.wrap(jsxDecorator)
				.find(".d3-foreign-object-dec-jsx");
		});
});

Cypress.Commands.add("verifyJsxDecorationOnLink", (linkLabel, decoratorId, xPos, yPos) => {
	cy.verifyDecorationTransformOnLink(linkLabel, decoratorId, xPos, yPos)
		.then((jsxDecorator) => {
			cy.wrap(jsxDecorator)
				.find(".d3-foreign-object-dec-jsx");
		});
});

Cypress.Commands.add("verifyDecorationTransformOnNode", (nodeName, decoratorId, xPos, yPos) => {
	cy.wait(10);
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
	cy.getLinkWithLabel(linkName)
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
	cy.getLinkWithLabel(linkName)
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

Cypress.Commands.add("verifyNodeDimensions", (nodeLabel, width, height) => {
	cy.getNodeWithLabel(nodeLabel)
		.then((node) => {
			const nodeSelector = getNodeBodySelector(node[0]);
			cy.getObjectDimensions(nodeSelector)
				.then((nodeDimensions) => {
					cy.verifyValueInCompareRange(nodeDimensions.width, width);
					cy.verifyValueInCompareRange(nodeDimensions.height, height);
				});
		});
});

Cypress.Commands.add("verifyBottomPanelHeight", (height) => {
	cy.get(".bottom-panel").should((element) => {
		expect(element).to.have.css("height", `${height}px`);
	});
});

Cypress.Commands.add("verifyBottomPanelWidth", (width) => {
	cy.get(".bottom-panel").should((element) => {
		// Use compareCloseTo here because top-panel width is slighyly different
		// on the build machine to its width when running tests on a local machine.
		compareCloseTo(element[0].offsetWidth, width);
	});
});

Cypress.Commands.add("verifyTopPanelHeight", (height) => {
	cy.get(".top-panel").should((element) => {
		expect(element).to.have.css("height", `${height}px`);
	});
});

Cypress.Commands.add("verifyTopPanelWidth", (width) => {
	cy.get(".top-panel").should((element) => {
		// Use compareCloseTo here because top-panel width is slighyly different
		// on the build machine to its width when running tests on a local machine.
		compareCloseTo(element[0].offsetWidth, width);
	});
});


Cypress.Commands.add("verifyCommentDimensions", (commentText, width, height) => {
	cy.getCommentWithText(commentText)
		.then((comment) => {
			const commentSelector = getCommentBodySelector(comment[0]);
			cy.getObjectDimensions(commentSelector)
				.then((commentDimensions) => {
					cy.verifyValueInCompareRange(commentDimensions.width, width);
					cy.verifyValueInCompareRange(commentDimensions.height, height);
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

});

Cypress.Commands.add("verifyLinkNodesActionOccurred", (srcNodeName, trgNodeName) => {
	// verify that an event for a new link is in the external object model event log
	cy.getNodeIdForLabel(srcNodeName)
		.then((srcNodeId) => {
			cy.getNodeIdForLabel(trgNodeName)
				.then((trgNodeId) => {
					verifyEditActionHandlerLinkNodesEntryInConsole(srcNodeId, trgNodeId);
				});
		});
});


function verifyEditActionHandlerLinkNodesEntryInConsole(srcNodeId, trgNodeId, action) {
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

Cypress.Commands.add("verifyNodeDoesExistInPaletteAtIndex", (nodeName, index) => {
	cy.findNodeIndexInPalette(nodeName)
		.then((idx) => expect(idx).to.equal(index));
});

Cypress.Commands.add("verifyCategoryIsClosed", (categoryLabel) => {
	cy.get(".cds--accordion__item")
		.then((catItems) => {
			for (let i = 0; i < catItems.length; i++) {
				if (catItems[i].textContent.includes(categoryLabel)) {
					const index = catItems[i].className.indexOf("cds--accordion__item--active");
					expect(index).to.equal(-1);
				}
			}
		});
});

Cypress.Commands.add("verifyCategoryIsOpened", (categoryLabel) => {
	cy.get(".cds--accordion__item--active")
		.contains(categoryLabel)
		.should("exist");
});

Cypress.Commands.add("verifyNodeIsAddedInPaletteCategory", (nodeName, categoryLabel) => {
	// Verify category exists in palette
	cy.findCategory(categoryLabel)
		.should("not.be.null");

	// Open category
	cy.clickCategory(categoryLabel);

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
					cy.verifyPixelValueInCompareRange(value, cssValue);
				});
		});
});

Cypress.Commands.add("verifyNumberOfLinksBetweenNodeOutputPortAndNodeInputPort", (srcNodeName, srcPortId, trgNodeName, trgPortId, linkCount) => {
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
	cy.get(".toolbar-left-bar .toolbar-item")
		.then((leftBarItems) => {
			cy.get(".toolbar-right-bar .toolbar-item")
				.then((rightBarItems) => {
					cy.get(".toolbar-overflow-item")
						.then((toolbarOverflowItems) => {
							const leftBarTopItemsCount = getCountToolbarItemsOnTopRow(leftBarItems);
							const overflowTopItemsCount = getCountToolbarItemsOnTopRow(toolbarOverflowItems);
							const rightBarTopItemsCount = getCountToolbarItemsOnTopRow(rightBarItems);

							let visibleItemsCount = leftBarTopItemsCount + rightBarTopItemsCount;

							// If there is one more overflow item than the left bar items
							// then an overflow item is visible.
							if (overflowTopItemsCount > leftBarTopItemsCount) {
								visibleItemsCount++;
							}

							expect(visibleItemsCount).to.equal(noOfItems);
						});
				});
		});
});

Cypress.Commands.add("verifyToolbarButtonEnabled", (action, state) => {
	cy.get(".toolbar-div")
		.find("." + action + "-action > div > button")
		.then((buttons) => {
			const classList = Array.from(buttons[0].classList);
			const enabled = !classList.includes("cds--btn--disabled");
			expect(enabled).to.equal(state);
		});
});

Cypress.Commands.add("verifyPrimaryPipelineZoomInCanvasInfo", (x, y, k) => {
	cy.getPipeline()
		.then((pipeline) => {
			const zoom = pipeline.zoom;
			compareCloseTo(zoom.x, x);
			compareCloseTo(zoom.y, y);
			expect((Math.round(zoom.k * 100))).to.equal(k * 100);
		});
});

Cypress.Commands.add("verifyTipClass", (tip, className) => {
	cy.wrap(tip).should("have.class", className);
});

Cypress.Commands.add("verifyTipForToolbarItem", (toolbarItem, tipText) => {
	cy.getToolbarAction(toolbarItem)
		.find(".tooltip-trigger")
		.then((item) => {
			const toolbarTipSelector = "[data-id='" + item[0].getAttribute("data-id").replace("tooltip-trigger", "tooltip") + "']";
			cy.get(toolbarTipSelector)
				.then((tip) => {
					// Verify tip is displayed on canvas
					cy.wrap(tip).should("have.length", 1);

					// Verify tip label
					cy.wrap(tip).should("have.text", tipText);

					// Verify toolbar tip class
					cy.verifyTipClass(tip, "icon-tooltip");
				});
		});
});

Cypress.Commands.add("verifyTipForToolbarItemNotDisplayed", (toolbarItem) => {
	cy.getToolbarAction(toolbarItem)
		.find(".tooltip-trigger")
		.should("not.exist");
});

Cypress.Commands.add("verifyTipForCategory", (categoryLabel) => {
	// Verify the tip shows
	cy.get(".tip-palette-item")
		.should("not.eq", null);
	// Verify tip label
	cy.get(".tip-palette-item")
		.find(".tip-palette-label")
		.should("have.text", categoryLabel);
	cy.getCategory(categoryLabel).then((cat) => {
		// Verify tip description
		cy.get(".tip-palette-item")
			.find(".tip-palette-desc")
			.should("have.text", cat.description);
	});
});

Cypress.Commands.add("verifyTipForNodeTemplateInCategory", (nodeLabel, categoryLabel) => {
	// Verify the tip shows
	cy.get(".tip-palette-item")
		.should("not.eq", null);
	// Verify tip label
	cy.get(".tip-palette-item")
		.find(".tip-palette-label")
		.should("have.text", nodeLabel);
	cy.getNodeTemplate(nodeLabel, categoryLabel).then((nt) => {
		// Verify tip description
		cy.get(".tip-palette-item")
			.find(".tip-palette-desc")
			.should("have.text", nt.app_data.ui_data.description);
	});
});

Cypress.Commands.add("verifyTipForNodeAtLocation", (nodeName, tipLocation) => {
	// Verify the tip shows "below" the node "Define Types"
	cy.getNodeWithLabel(nodeName)
		.then((node) => {
			const nodeTipSelector = "[data-id*='" + node[0].getAttribute("data-id").replace("grp", "tip") + "']";
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

					// Verify node tip class
					cy.verifyTipClass(tip, "definition-tooltip");
				});
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

					// Verify node tip class
					cy.verifyTipClass(tip, "definition-tooltip");
				});
		});
});

Cypress.Commands.add("verifyTipForInputPortOfNode", (nodeName, inputPortId, portName) => {
	cy.getNodePortSelector(nodeName, "input", inputPortId)
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

							// Verify port tip class
							cy.verifyTipClass(tip, "definition-tooltip");
						});
				});
		});
});

Cypress.Commands.add("verifyTipForOutputPortOfNode", (nodeName, outputPortId, portName) => {
	cy.getNodePortSelector(nodeName, "output", outputPortId)
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

							// Verify port tip class
							cy.verifyTipClass(tip, "definition-tooltip");
						});
				});
		});
});

Cypress.Commands.add("verifyTipForLink", (sourceNode, sourcePort, targetNode, targetPort) => {
	cy.get("[data-id*=link_tip_0_]") // Find tip with id that has 'link_tip_0_'
		.then((tip) => {
			// Verify tip is displayed on canvas
			cy.wrap(tip).should("have.length", 1);

			// Verify tip label
			const sourceString = `'${sourceNode}', port '${sourcePort}'`;
			const targetString = `'${targetNode}', port '${targetPort}'`;
			const linkLabel = `Link from ${sourceString} to ${targetString}`;
			cy.wrap(tip)
				.find(".tooltipContainer")
				.should("have.text", linkLabel);

			// Verify link tip class
			cy.verifyTipClass(tip, "definition-tooltip");
		});

});

Cypress.Commands.add("verifyTipForDecoration", (tipText) => {
	cy.get("[data-id*=dec_tip_0_]") // Find decoration tip with id that has 'dec_tip_0_'
		.then((tip) => {
			// Verify tip is displayed on canvas
			cy.wrap(tip).should("have.length", 1);

			// Verify tip label
			cy.wrap(tip)
				.find(".tip-decoration")
				.should("have.text", tipText);

			// Verify node tip class
			cy.verifyTipClass(tip, "definition-tooltip");
		});
});

Cypress.Commands.add("verifyTipDoesNotShowForCategory", (categoryLabel) => {
	cy.findCategory(categoryLabel)
		.then((category) => {
			const id = category[0].getAttribute("data-id");
			const categoryTipSelector = "div[data-id$=paletteTip_" + id + "][aria-hidden=false]";
			cy.get(categoryTipSelector)
				.should("not.exist");
		});
});

Cypress.Commands.add("verifyTipDoesNotShowForNodeTemplate", (nodeLabel, categoryLabel) => {
	cy.getNodeTemplate(nodeLabel, categoryLabel)
		.then((nt) => {
			const categoryTipSelector = "div[data-id$=paletteTip_" + nt.op + "][aria-hidden=false]";
			cy.get(categoryTipSelector)
				.should("not.exist");
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

Cypress.Commands.add("verifyTipDoesNotShowForInputPortId", (inputPortId) => {
	// Verify the tip doesn't show for input port id "inPort2"
	cy.getNodePortTipSelector(inputPortId)
		.then((portTipSelector) => cy.get(portTipSelector).should("not.exist"));
});

Cypress.Commands.add("verifyTipDoesNotShowForLink", () => {
	cy.get("[data-id*=link_tip_0_]") // Find tip with id that has 'link_tip_0_'
		.should("not.exist");
});

Cypress.Commands.add("verifyTipDoesNotShowForDecoration", () => {
	cy.get("[data-id*=dec_tip_0_]") // Find decoration tip with id that has 'dec_tip_0_'
		.should("not.exist");
});

Cypress.Commands.add("verifyNotificationIconType", (type) => {
	if (type) {
		cy.get(".notificationCounterIcon").should("have.class", type);
	} else {
		cy.get(".notificationCounterIcon").should("not.have.any.keys", ["info", "success", "warning", "error"]);
	}
});

Cypress.Commands.add("verifyCanvasTransform", (movString) => {
	cy.get("#canvas-div-0 .d3-canvas-group")
		.invoke("attr", "transform")
		.should("eq", movString);
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

Cypress.Commands.add("verifyNotificationCenterExists", () => {
	cy.get(".notification-panel");
});

Cypress.Commands.add("verifyNotificationCenterDoesntExist", (hidden) => {
	cy.get(".notification-panel").should("not.exist");
});

Cypress.Commands.add("verifyNodeWidthHeight", (nodeLabel, nodeWidth, nodeHeight) => {
	cy.getNodeWithLabel(nodeLabel).get(".d3-node-body-outline")
		.should((element) => {
			expect(element).to.have.css("height", `${nodeHeight}px`);
			expect(element).to.have.css("width", `${nodeWidth}px`);
		});
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

Cypress.Commands.add("verifyNodeHasDataId", (nodeLabel, dataIdValue, categoryLabel) => {
	cy.findNodeInCategory(nodeLabel, categoryLabel)
		.invoke("attr", "data-id")
		.then((dataId) => {
			expect(dataId).to.equal(dataIdValue);
		});
});

// Compares two pixel value to see if they are within the compareRange value or not.
Cypress.Commands.add("verifyPixelValueInCompareRange", (value, cssValue) => {
	// value should be in the compare range of cssValue
	cy.verifyValueInCompareRange(value.split("px")[0], cssValue.split("px")[0]);
});

// Compares two value to see if they are within the compareRange value or not.
Cypress.Commands.add("verifyValueInCompareRange", (value, compareValue) => {
	compareCloseTo(value, compareValue);
});

// Returns the count of toolbar items passed in that are on the top row of the
// toolbar. That is, where their offset top is 0.
function getCountToolbarItemsOnTopRow(items) {
	let itemsVisible = 0;

	for (let i = 0; i < items.length; i++) {
		if (items[i].offsetTop === 0) {
			itemsVisible++;
		}
	}
	return itemsVisible;
}

function verifyPath(actualPath, expectedPath) {
	const actualElements = actualPath.getAttribute("d").split(" ");
	// console.log(actualPath.getAttribute("d"));
	const expectedElements = expectedPath.split(" ");
	for (let i = 0; i < actualElements.length; i++) {
		const actualNumber = parseFloat(actualElements[i]);
		const expectedNumber = parseFloat(expectedElements[i]);
		if (isNaN(actualNumber)) {
			expect(actualElements[i]).to.equal(expectedElements[i]);
		} else {
			compareCloseTo(actualNumber, expectedNumber);
		}
	}
}

function compareCloseTo(value, compareValue) {
	expect(Number(value)).to.be.closeTo(Number(compareValue), Cypress.env("compareRange"));
}

function getNodeGroupSelector(node) {
	return ".d3-node-group[data-id='" + node.getAttribute("data-id") + "']";
}

function getNodeSelectionOutlineSelector(node) {
	return getNodeGroupSelector(node) + " > .d3-node-selection-highlight";
}

function getNodeBodySelector(node) {
	return getNodeGroupSelector(node) + " > .d3-node-body-outline";
}

function getNodeImageSelector(node) {
	return getNodeGroupSelector(node) + " > .d3-node-image";
}

function getNodeLabelSelector(node) {
	return getNodeGroupSelector(node) + " > .d3-foreign-object-node-label";
}

function getCommentSelectionOutlineSelector(comment) {
	return "[data-id='" + comment.getAttribute("data-id") + "'] > .d3-comment-selection-highlight";
}

function getCommentBodySelector(comment) {
	return "[data-id='" + comment.getAttribute("data-id") + "'] > .d3-comment-rect";
}
