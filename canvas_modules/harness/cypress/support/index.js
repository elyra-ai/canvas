/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import "./properties/properties-cmds";
import "./canvas/comments-cmds";
import "./canvas/context-menu-cmds";
import "./canvas/node-cmds";
import "./canvas/object-model-cmds";
import "./canvas/test-harness-cmds";
import "./canvas/toolbar-cmds";
import "./canvas/verification-cmds";

// turn off screenshots when running in headless mode.
Cypress.Screenshot.defaults({
	screenshotOnRunFailure: false,
});
