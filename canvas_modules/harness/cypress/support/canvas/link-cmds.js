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

function getLinkSelector(linkId, element) {
	const inst = document.extraCanvas === true ? "1" : "0";
	let selector = null;
	if (element === "grp") {
		selector = `div > svg > g > g[data-id^=link_${element}_${inst}_${linkId}]`;
	} else if (element === "line") {
		selector = `div > svg > g > g > path[data-id^=link_${element}_${inst}_${linkId}]`;
	}
	return selector;
}

Cypress.Commands.add("clickDecoratorHotspotOnLink", (decoratorId, linkName) => {
	cy.getLinkFromName(linkName)
		.find(`.d3-link-dec-outline[data-id=link_dec_outln_0_${decoratorId}]`)
		.click();
});

Cypress.Commands.add("linkNodes", (srcNodeName, trgNodeName, linkCount) => {
	// Link source node to target node
	cy.getNodeForLabel(srcNodeName)
		.find(".d3-node-halo")
		.trigger("mousedown", "right", { button: 0 }, { force: true });
	cy.getNodeForLabel(trgNodeName)
		.trigger("mousemove", { force: true })
		.trigger("mouseup", { force: true });

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

Cypress.Commands.add("getNodePortSelector", (nodeName, nodeElement, portId) => {
	const inst = document.extraCanvas === true ? "1" : "0";
	cy.getNodeIdForLabel(nodeName)
		.then((nodeId) => {
			const portSelector = `[data-id='node_${nodeElement}_${inst}_${nodeId}_${portId}']`;
			return portSelector;
		});
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

Cypress.Commands.add("verifyLinkPath", (srcNodeName, srcPortId, trgNodeName, trgPortId, path) => {
	cy.getPipeline()
		.then((pipeline) => {
			cy.getPortLinks(pipeline, srcNodeName, srcPortId, trgNodeName, trgPortId)
				.then((links) => {
					cy.wrap(links).should("have.length", 1);

					cy.get(getLinkSelector(links[0].id, "line"))
						.then((link) => expect(link[0].getAttribute("d")).to.equal(path));
				});
		});
});
