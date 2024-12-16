/*
 * Copyright 2017-2025 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Logger from "../logging/canvas-logger.js";

// WARNING: Some client apps (eg. Streams) runs Common Canvas within a webview
// created through visual studio. In this environment localStorage is not
// accessible (and will throw an exception if accessed) so in this class we
// need to make sure it is always available before accessing it.

export default class LocalStorage {
	static set(attributeName, value) {
		try {
			if (window.electronUtil && window.electronUtil.wsdStorage && window.electronUtil.wsdStorage.setItem) {
				window.electronUtil.wsdStorage.setItem(attributeName, value);

			} else if (window.localStorage) {
				window.localStorage[attributeName] = value;
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
	}

	static get(attributeName) {
		try {
			if (window.electronUtil && window.electronUtil.wsdStorage && window.electronUtil.wsdStorage.getItem) {
				return window.electronUtil.wsdStorage.getItem(attributeName);

			} else if (window.localStorage) {
				return window.localStorage[attributeName];
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
		return null;
	}

	static delete(attributeName) {
		try {
			if (window.electronUtil && window.electronUtil.wsdStorage && window.electronUtil.wsdStorage.removeItem) {
				window.electronUtil.wsdStorage.removeItem(attributeName);

			} else if (window.localStorage) {
				delete window.localStorage[attributeName];
			}
		} catch (err) {
			LocalStorage.logger.warn("Local storage is not accessible: " + err);
		}
	}
}

LocalStorage.logger = new Logger(["LocalStorage"]);
