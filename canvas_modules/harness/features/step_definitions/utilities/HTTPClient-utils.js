/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
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

function postData(url, data, callback) {
	var anHttpRequest = new XMLHttpRequest();
	anHttpRequest.onreadystatechange = function() {
		if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
			return callback();
		}
		return null;
	};
	anHttpRequest.open("POST", url, true);
	anHttpRequest.setRequestHeader("Content-Type", "application/json");
	anHttpRequest.send(data);
}

module.exports = {
	getHarnessData: getHarnessData,
	postData: postData
};
