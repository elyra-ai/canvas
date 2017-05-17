/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

module.exports = {
	"extends": "@dap/eslint-config-portal-common",
	"env": {
		"mocha": true
	},
	rules: {
		// Disallow Unused Expressions
		"no-unused-expressions": "off"
	}
};
