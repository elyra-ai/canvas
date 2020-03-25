/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("getNodeForLabel", (nodeLabel) =>
	cy.get(getNodeGrpSelector())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

Cypress.Commands.add("getNodeForLabelInSubFlow", (nodeLabel) =>
	cy.get(getNodeGrpSelectorInSubFlow())
		.then((grpArray) => findGrpForLabel(grpArray, nodeLabel)));

function getNodeGrpSelector() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function getNodeGrpSelectorInSubFlow() {
	const inst = document.extraCanvas === true ? "1" : "0";
	const selector = `div > svg > g > g > svg > g > g[data-id^='node_grp_${inst}']`;
	return selector;
}

function findGrpForLabel(grpArray, nodeLabel) {
	for (let idx = 0; idx < grpArray.length; idx++) {
		if (grpArray[idx].__data__.label === nodeLabel) {
			return grpArray[idx];
		}
	}
	return null;
}
