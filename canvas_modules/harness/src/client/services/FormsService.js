/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
import fetch from "isomorphic-fetch";

class FormsService {
	getFiles(type) {
		var url = "/v1/test-harness/forms/" + type;
		var that = this;
		var headers = {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Cache-Control": "no-cache,no-store"
		};
		return that.handleRequest(
			fetch(url, {
				headers: headers,
				method: "GET",
				mode: "cors",
				credentials: "include"
			})
		);
	}

	getFileContent(type, filename) {
		var url = "/v1/test-harness/forms/" + type + "?file=" + filename;
		var that = this;
		var headers = {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Cache-Control": "no-cache,no-store"
		};
		return that.handleRequest(
			fetch(url, {
				headers: headers,
				method: "GET",
				mode: "cors",
				credentials: "include"
			})
		);
	}

	// postCanvas(canvas) {
	// 	var url = "/v1/test-harness/canvas";
	// 	var that = this;
	// 	var headers = {
	// 		"Accept": "application/json",
	// 		"Content-Type": "application/json",
	// 		"Cache-Control": "no-cache,no-store"
	// 	};
	// 	return that.handleRequest(
	// 		fetch(url, {
	// 			headers: headers,
	// 			method: "POST",
	// 			mode: "cors",
	// 			credentials: "include",
	// 			body: JSON.stringify(canvas)
	// 		})
	// 	);
	// }
	//
	// getEventLog() {
	// 	var url = "/v1/test-harness/events";
	// 	var that = this;
	// 	var headers = {
	// 		"Accept": "application/json",
	// 		"Content-Type": "application/json",
	// 		"Cache-Control": "no-cache,no-store"
	// 	};
	// 	return that.handleRequest(
	// 		fetch(url, {
	// 			headers: headers,
	// 			method: "GET",
	// 			mode: "cors",
	// 			credentials: "include"
	// 		})
	// 	);
	// }
	//
	// postEventLog(event) {
	// 	var url = "/v1/test-harness/events";
	// 	var that = this;
	// 	var headers = {
	// 		"Accept": "application/json",
	// 		"Content-Type": "application/json",
	// 		"Cache-Control": "no-cache,no-store"
	// 	};
	// 	return that.handleRequest(
	// 		fetch(url, {
	// 			headers: headers,
	// 			method: "POST",
	// 			mode: "cors",
	// 			credentials: "include",
	// 			body: JSON.stringify(event)
	// 		})
	// 	);
	// }

	handleRequest(getPromise) {
		return getPromise.then(function(response) {
			if (!response.ok) {
				console.log("handleRequest(): error response=" + response.statusText);
			}
			return response.json();
		})
		.catch(function(ex) {
			console.error(ex);
			return ex;
		});
	}
}

export default new FormsService();
