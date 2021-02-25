/*
 * Copyright 2017-2020 Elyra Authors
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

Cypress.Commands.add("getLinkFromName", (linkName) => {
	const nodeNames = linkName.split("-");
	cy.getPipeline()
		.then((pipeline) => {
			// Get source node id
			cy.getNodeIdForLabel(nodeNames[0])
				.then((srcNodeId) => {
					// Get target node id
					cy.getNodeIdForLabel(nodeNames[1])
						.then((trgNodeId) => {
							// Get canvas link from object model joining the source and target nodes
							const canvasLink = pipeline.links.find((lnk) =>
								lnk.srcNodeId === srcNodeId && lnk.trgNodeId === trgNodeId);

							// Get the same canvas link from document and return link
							cy.get(getLinkSelector(canvasLink.id, "grp"))
								.then((link) => link);
						});
				});
		});
});


Cypress.Commands.add("getLinkUsingId", (linkId) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.get(getLinkSelector(linkId, "grp"))
				.then((link) => link);
		});
});


function getLinkSelector(linkId, element) {
	const inst = document.extraCanvas === true ? "1" : "0";
	let selector = null;
	if (element === "grp") {
		selector = `div > svg > g > g > g[data-id^="link_grp_${inst}_${linkId}"]`;
	} else if (element === "line") {
		selector = `div > svg > g > g > g[data-id^="link_grp_${inst}_${linkId}"] > path`;
	} else if (element === "startHandle") {
		selector = `div > svg > g > g > g[data-id^="link_grp_${inst}_${linkId}"] > g > .d3-link-handle-start`;
	} else if (element === "endHandle") {
		selector = `div > svg > g > g > g[data-id^="link_grp_${inst}_${linkId}"] > g > .d3-link-handle-end`;
	}
	return selector;
}

Cypress.Commands.add("clickDecoratorHotspotOnLink", (decoratorId, linkName) => {
	cy.getLinkFromName(linkName)
		.find(`.d3-link-dec-group[data-id=link_dec_group_0_${decoratorId}]`)
		.click();
});

Cypress.Commands.add("moveLinkHandleToPos", (linkId, element, xPos, yPos) => {
	cy.window().then((win) => {
		cy.get(getLinkSelector(linkId, element))
			.trigger("mousedown", { view: win });
		cy.get(".d3-svg-canvas-div > .svg-area")
			.trigger("mousemove", xPos, yPos)
			.trigger("mouseup", xPos, yPos, { view: win });
	});
});

Cypress.Commands.add("moveLinkHandleToNode", (
	srcNodeName, srcPortId, trgNodeName, trgPortId, element, nodeName) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", 1);
					// console.log(links[0]);
					cy.clickLink(links[0].id);
					cy.moveLinkHandleToNodeByLinkId(links[0].id, element, nodeName);
				});
		});
});

Cypress.Commands.add("moveLinkHandleToNodeByLinkId", (linkId, element, nodeName) => {
	cy.window().then((win) => {
		cy.getNodeSelector(nodeName)
			.then((trgSelector) => {
				cy.get(getLinkSelector(linkId, element))
					.trigger("mousedown", { view: win });
				cy.get(trgSelector)
					.trigger("mousemove", { force: true, view: win })
					.trigger("mouseup", { force: true, view: win });
			});
	});
});

Cypress.Commands.add("moveLinkHandleToPort", (
	srcNodeName, srcPortId, trgNodeName, trgPortId, element, nodeName, portId) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", 1);
					cy.clickLink(links[0].id);
					cy.moveLinkHandleToPortByLinkId(links[0].id, element, nodeName, portId);
				});
		});
});

Cypress.Commands.add("moveLinkHandleToPortByLinkId", (linkId, element, nodeName, portId) => {
	cy.window().then((win) => {
		const portElement = element === "endHandle" ? "inp_port" : "out_port";
		cy.getNodePortSelector(nodeName, portElement, portId)
			.then((trgSelector) => {
				cy.get(getLinkSelector(linkId, element))
					.trigger("mousedown", { view: win });
				cy.get(trgSelector)
					.trigger("mousemove", { force: true, view: win })
					.trigger("mouseup", { force: true, view: win });
			});
	});
});

Cypress.Commands.add("linkNodes", (srcNodeName, trgNodeName) => {
	// Link source node to target node
	cy.getNodeWithLabel(srcNodeName)
		.find(".d3-node-halo")
		.trigger("mousedown", "right", { button: 0 }, { force: true });
	cy.getNodeWithLabel(trgNodeName)
		.trigger("mousemove", { force: true })
		.trigger("mouseup", { force: true });
});

Cypress.Commands.add("linkNodeOutputPortToNodeInputPort", (srcNodeName, srcPortId, trgNodeName, trgPortId) => {
	cy.getNodePortSelector(srcNodeName, "out_port", srcPortId)
		.then((srcSelector) => {
			cy.getNodePortSelector(trgNodeName, "inp_port", trgPortId)
				.then((trgSelector) => {
					// We're using { force: true } on mousemove and mouseup triggers
					// to disable element visibility errorCheck from Cypress
					cy.get(srcSelector)
						.trigger("mousedown", { button: 0 });
					cy.get(trgSelector)
						.trigger("mousemove", { force: true })
						.trigger("mouseup", { force: true });
				});
		});
});

Cypress.Commands.add("linkNodeOutputPortToNodeInputPortInSupernode",
	(supernodeName, srcNodeName, srcPortId, trgNodeName, trgPortId) => {
		cy.getNodePortSelectorInSupernode(supernodeName, srcNodeName, "out_port", srcPortId)
			.then((srcSelector) => {
				cy.getNodePortSelectorInSupernode(supernodeName, trgNodeName, "inp_port", trgPortId)
					.then((trgSelector) => {
						// We're using { force: true } on mousemove and mouseup triggers
						// to disable element visibility errorCheck from Cypress
						cy.get(srcSelector)
							.trigger("mousedown", { button: 0 });
						cy.get(trgSelector)
							.trigger("mousemove", { force: true })
							.trigger("mouseup", { force: true });
					});
			});
	});

Cypress.Commands.add("linkNodeOutputPortToNode", (srcNodeName, srcPortId, trgNodeName) => {
	// This will simulate a drag from a specific port onto a target node rather
	// than a specific port. This should be interpreted as a link to the zeroth
	// port of the target node.
	cy.getNodePortSelector(srcNodeName, "out_port", srcPortId)
		.then((srcSelector) => {
			cy.getNodeWithLabel(trgNodeName)
				.then((trgSelector) => {
					cy.get(srcSelector)
						.trigger("mousedown", { button: 0 });
					cy.get(trgSelector)
						.trigger("mousemove", { force: true })
						.trigger("mouseup", { force: true });
				});
		});
});

Cypress.Commands.add("linkNodeOutputPortToPointOnCanvas", (srcNodeName, srcPortId, xPos, yPos) => {
	// This will simulate a drag from a specific port to a position on the canvas
	// which will create a detached link when enableDetachableLinks config field
	// is set to true.
	cy.getNodePortSelector(srcNodeName, "out_port", srcPortId)
		.then((srcSelector) => {
			cy.get(srcSelector)
				.trigger("mousedown", { button: 0 });
			cy.get(".d3-svg-canvas-div > .svg-area")
				.trigger("mousemove", { force: true })
				.trigger("mouseup", xPos, yPos, { force: true });
		});
});

Cypress.Commands.add("getNodeSelector", (nodeName) => {
	const inst = document.extraCanvas === true ? "1" : "0";
	cy.getNodeIdForLabel(nodeName)
		.then((nodeId) => {
			const nodeSelector = `[data-id='node_grp_${inst}_${nodeId}']`;
			return nodeSelector;
		});
});

Cypress.Commands.add("getNodePortSelector", (nodeName, nodeElement, portId) => {
	const inst = document.extraCanvas === true ? "1" : "0";
	cy.getNodeIdForLabel(nodeName)
		.then((nodeId) => {
			const portSelector = `[data-id='node_${nodeElement}_${inst}_${nodeId}_${portId}']`;
			return portSelector;
		});
});

Cypress.Commands.add("getNodePortSelectorInSupernode", (supernodeName, nodeName, nodeElement, portId) => {
	const inst = document.extraCanvas === true ? "1" : "0";
	cy.getNodeIdForLabelInSupernode(nodeName, supernodeName)
		.then((nodeId) => {
			const portSelector = `[data-id='node_${nodeElement}_${inst}_${nodeId}_${portId}']`;
			return portSelector;
		});
});

Cypress.Commands.add("getNodePortTipSelector", (portId) => {
	const inst = document.extraCanvas === true ? "1" : "0";
	const portTipSelector = `[data-id='node_port_tip_${inst}_${portId}']`;
	return portTipSelector;
});

Cypress.Commands.add("getPortLinks", (pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId) => {
	const links = pipeline.links;
	cy.getNodeIdForLabel(srcNodeName)
		.then((srcNodeId) => {
			cy.getNodeIdForLabel(trgNodeName)
				.then((trgNodeId) => {
					var outLinks = [];
					links.forEach(function(link) {
						if (link.srcNodeId === srcNodeId &&
							link.trgNodeId === trgNodeId &&
							link.srcNodePortId === srcPortId &&
							link.trgNodePortId === trgPortId) {
							outLinks.push(link);
						}
					});
					return outLinks;
				});
		});
});

Cypress.Commands.add("deleteLinkAt", (linkX, linkY) => {
	// Delete link using context menu
	cy.get(".d3-svg-canvas-div")
		.rightclick(linkX, linkY);
	cy.clickOptionFromContextMenu("Delete");
});

Cypress.Commands.add("hoverOverLinkName", (linkName) => {
	cy.getLinkFromName(linkName)
		.children()
		.eq(1)
		.trigger("mouseenter", { force: true });
});

Cypress.Commands.add("getLinkUsingLinkId", (linkId) => {
	cy.get("body").then(($body) => {
		if ($body.find(".d3-link-group").length) {
			cy.get(getLinkGrpSelector())
				.then((grpArray) => findGrpForLinkId(grpArray, linkId));
		}
		// No nodes found on canvas
		return null;
	});
});

function getLinkGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > g[data-id^='link_grp_${inst}']`;
	return selector;
}

function findGrpForLinkId(grpArray, linkId) {
	for (let idx = 0; idx < grpArray.length; idx++) {
		if (grpArray[idx].__data__.id === linkId) {
			return grpArray[idx];
		}
	}
	return null;
}


Cypress.Commands.add("getLinkLineUsingLinkId", (linkId) => {
	cy.get(getLinkSelector(linkId, "line"))
		.then((linkGrp) => linkGrp);
});

Cypress.Commands.add("clickLink", (linkId) => {
	cy.getLinkUsingLinkId(linkId).click();
});

Cypress.Commands.add("ctrlOrCmdClickLink", (linkId) => {
	// Get the os name to decide whether to click ctrl or cmd
	cy.useCtrlOrCmdKey().then((selectedKey) => {
		cy.get("body")
			.type(selectedKey, { release: false })
			.getLinkUsingLinkId(linkId)
			.click();
		// Cancel the command/ctrl key press -- the documentation doesn't say
		// this needs to be done but if it isn't the command key stays pressed down
		// causing problems with subsequent selections.
		cy.get("body")
			.type(selectedKey, { release: true });
	});
});

Cypress.Commands.add("getNumberOfSelectedLinks", () => {
	cy.getSelectedLinks()
		.then((selectedLinks) => selectedLinks.length);
});

Cypress.Commands.add("getSelectedLinks", () => {
	cy.document().then((doc) => doc.canvasController.getSelectedLinks());
});
