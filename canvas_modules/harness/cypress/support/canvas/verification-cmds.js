/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("verifyNodeTransform", (nodeLabel, transformValue) => {
	cy.getNodeForLabel(nodeLabel)
		.should("have.attr", "transform", transformValue);
});

Cypress.Commands.add("verifyNodeTransformInSubFlow", (nodeLabel, transformValue) => {
	cy.getNodeForLabelInSubFlow(nodeLabel)
		.should("have.attr", "transform", transformValue);
});
