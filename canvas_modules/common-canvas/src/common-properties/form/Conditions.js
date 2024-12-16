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

import { has } from "lodash";

/*
* Iterates over the conditions and replaces the default message with translated message
*/
function translateMessages(conditions, l10nProvider) {
	if (conditions && Array.isArray(conditions)) {
		for (var condition of conditions) {
			searchMessage(condition, l10nProvider);
		}
	}
	return conditions;
}

function searchMessage(object, l10nProvider) {
	for (var x in object) {
		if (has(object, x)) {
			if (typeof object[x] === "object" && object[x] !== null) {
				if (object[x].message) {
					object[x].message.default = l10nProvider.l10nResource(object[x].message);
				} else {
					searchMessage(object[x], l10nProvider);
				}
			}
		}
	}
}

export { translateMessages };
