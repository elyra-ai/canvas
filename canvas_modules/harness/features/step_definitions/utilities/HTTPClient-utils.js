/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* global XMLHttpRequest */

// Simulate dragging a node from the palette to the canvas
function getHarnessData(url, callback) {
	var anHttpRequest = new XMLHttpRequest();
	anHttpRequest.onreadystatechange = function() {
		if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
			return callback(anHttpRequest.responseText);
		}
		return null;
	};
	anHttpRequest.open("GET", url, true);
	anHttpRequest.send(null);
}

module.exports = {
	getHarnessData: getHarnessData
};
