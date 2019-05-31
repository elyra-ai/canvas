/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */
import { setCanvasConfig } from "../utilities/test-utils.js";

module.exports = function() {

	this.Then(/^I have set this canvas config ""([^']*)""$/, function(config) {
		try {
			setCanvasConfig(JSON.parse(config));
		} catch (err) {
			console.log("Err = " + err);
			throw err;
		}
	});

};
