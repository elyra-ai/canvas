/*
 * Copyright 2017-2022 Elyra Authors
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

import { propertyOf } from "lodash";

export class L10nProvider {
	constructor(resources) {
		this.resources = resources;
	}

	/**
	 * Look up a localised resource using the supplied key.
	 */
	l10n(key, defaultVal) {
		if (this.resources) {
			const value = propertyOf(this.resources)(key);
			if (value || value === "") {
				return value;
			}
		}
		if (defaultVal) {
			return defaultVal;
		}
		return key;
	}

	/**
	 * Look up a localised resource.  Check for resource first, then fall back to default value
	 */
	l10nResource(resourceObj) {
		let text;
		if (resourceObj) {
			if (resourceObj.resource_key) {
				text = this.l10n(resourceObj.resource_key);
				if ((!text || text === resourceObj.resource_key) && resourceObj.default) {
					text = resourceObj.default;
				}
			} else if (resourceObj.default) {
				text = resourceObj.default;
			}
		}
		return text;
	}

	/**
	 * Look up a localised resource label using the supplied base key with ".label" appended.
	 */
	l10nLabel(uiObject, key) {
		return this.l10nResource(uiObject.label) ? this.l10nResource(uiObject.label) : this.l10n(key + ".label", key);
	}

	/**
	 * Look up a localised resource description/tooltip using the supplied base key with ".desc" appended.
	 */
	l10nDesc(uiObject, key) {
		return this.l10nResource(uiObject.description) ? this.l10nResource(uiObject.description) : this.l10n(key + ".desc", key);
	}

	/**
	 * Look up a localised resource label for an enumerated value using the supplied
	 * base key with the value and ".label" appended e.g. "measurement.continous.label".
	 */
	l10nValueLabel(baseKey, value) {
		const lookupKey = baseKey + "." + value + ".label";
		return this.l10n(lookupKey, value);
	}

	l10nValueDesc(baseKey, value) {
		const lookupKey = baseKey + "." + value + ".desc";
		return this.l10n(lookupKey, value);
	}
}

export class ResourceDef {
	static make(resourceObj) {
		let resource;
		if (resourceObj) {
			resource = new ResourceDef();
			resource.default = resourceObj.default;
			resource.resource_key = resourceObj.resource_key;
			if (resourceObj.placement) {
				resource.placement = resourceObj.placement;
			}
			if (resourceObj.type) {
				resource.type = resourceObj.type;
			}
			if (resourceObj.link) {
				resource.link = resourceObj.link;
			}
		}
		return resource;
	}
}
