/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import _ from "underscore";

export class L10nProvider {
	constructor(resources) {
		this.resources = resources;
	}

	/**
	 * Look up a localised resource using the supplied key.
	 */
	l10n(key, defaultVal) {
		if (this.resources) {
			const value = _.propertyOf(this.resources)(key);
			if (value) {
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
			if (resourceObj.resourceKey) {
				text = this.l10n(resourceObj.resourceKey);
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
}
export class ResourceDef {
	constructor(defaultText, resourceKey) {
		this.default = defaultText;
		this.resourceKey = resourceKey;
	}
	static make(resourceObj) {
		return new ResourceDef(_.propertyOf(resourceObj)("default"), _.propertyOf(resourceObj)("resourceKey"));
	}
}
