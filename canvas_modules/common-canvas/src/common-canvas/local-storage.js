/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import Logger from "../logging/canvas-logger.js";

// WARNING: Some client apps (eg. Streams) runs Common Canvas within a webview
// created through visual studio. In this environment localStorage is not
// accessible (and will throw an exception if accessed) so in this class we
// need to make sure it is always available before accessing it.

export default class LocalStorage {
	static set(attributeName, value) {
		try {
			if (window.localStorage) {
				window.localStorage[attributeName] = value;
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
	}

	static get(attributeName) {
		try {
			if (window.localStorage) {
				return window.localStorage[attributeName];
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
		return null;
	}

	static delete(attributeName) {
		try {
			if (window.localStorage) {
				delete window.localStorage[attributeName];
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
	}
}

LocalStorage.logger = new Logger(["LocalStorage"]);
