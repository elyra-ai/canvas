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
		let value;
		if (this.resources) {
			value = _.propertyOf(this.resources)(key);
		}
		if (value) {
			return value;
		}
		if (defaultVal) {
			return defaultVal;
		}
		return key;
	}

	/**
	 * Look up a localised resource label using the supplied base key with ".label" appended.
	 */
	l10nLabel(uiObject, key) {
		if (uiObject.label) {
			if (uiObject.label.resourceKey) {
				return this.l10n(uiObject.label.resourceKey);
			}
			if (uiObject.label.default) {
				return uiObject.label.default;
			}
		}
		return this.l10n(key + ".label", key);
	}

	/**
	 * Look up a localised resource description/tooltip using the supplied base key with ".desc" appended.
	 */
	l10nDesc(uiObject, key) {
		if (uiObject.description) {
			if (uiObject.description.resourceKey) {
				return this.l10n(uiObject.description.resourceKey);
			}
			if (uiObject.description.default) {
				return uiObject.description.default;
			}
		}
		return this.l10n(key + ".desc");
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
