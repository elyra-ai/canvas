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
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

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
