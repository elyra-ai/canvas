/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// WARNING: Some client apps (eg. Streams) runs Common Canvas within a webview
// created through visual studio. In this environment localStorage is not
// accessible so in this class we need to make sure it is always available
// before accessing it.

export default class LocalStorage {

	static set(attributeName, value) {
		if (window.localStorage) {
			window.localStorage[attributeName] = value;
		}
	}

	static get(attributeName) {
		if (window.localStorage) {
			return window.localStorage[attributeName];
		}
		return null;
	}

	static delete(attributeName) {
		if (window.localStorage) {
			delete window.localStorage[attributeName];
		}
	}
}
