/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint no-empty-function: ["error", { "allow": ["functions", "arrowFunctions"] }] */
/* global document*/

global.Range = function Range() {};

const createContextualFragment = (html) => {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.children[0]; // so hokey it's not even funny
};

global.Range.prototype.createContextualFragment = (html) => createContextualFragment(html);

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
	return {
		setEnd: () => {},
		setStart: () => {},
		getBoundingClientRect: () => ({ right: 0 }),
		getClientRects: () => [],
		createContextualFragment,
	};
};
