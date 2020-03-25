/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint-disable no-console */

/**
 * @type {Cypress.PluginConfig}
 */

// `cy.log()` command's output can be seen on the screen along with test steps
module.exports = (on) => {
	on("task", { log(message) {
		console.log(message);
		return null;
	} });
};
