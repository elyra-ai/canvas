/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import "./properties-cmds";

// turn off screenshots when running in headless mode.
Cypress.Screenshot.defaults({
	screenshotOnRunFailure: false,
});
