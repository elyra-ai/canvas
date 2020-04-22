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

Cypress.Commands.add("getLinkFromAPIName", (linkName) => {
	const nodeNames = linkName.split("-");
	cy.getPipeline()
		.then((pipeline) => {
			// Get source node id
			cy.getNodeForLabel(nodeNames[0])
				.then((sourceNode) => {
					const srcNodeId = sourceNode[0].getAttribute("data-id").substring(11);
					// Get target node id
					cy.getNodeForLabel(nodeNames[1])
						.then((targetNode) => {
							const trgNodeId = targetNode[0].getAttribute("data-id").substring(11);
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
	cy.getLinkFromAPIName(linkName)
		.find(`.d3-link-dec-outline[data-id=link_dec_outln_0_${decoratorId}]`)
		.click();
});
