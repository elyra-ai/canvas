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
	constructor(resources){
		this.resources = resources;
	}

  /**
   * Look up a localised resource using the supplied key.
   */
  l10n(key){
		let value;
		if (this.resources) {
			value = _.propertyOf(this.resources)(key);
		}
		return (value ? value : key);
	}

  /**
   * Look up a localised resource label using the supplied base key with ".label" appended.
   */
  l10nLabel(uiObject, key){
		if (uiObject.label){
			return uiObject.label;
		}else{
			if (uiObject.resourceKey){
				return this.l10n(uiObject.resourceKey + ".label");
			}else{
				return this.l10n(key + ".label");
			}
		}
  }

  /**
   * Look up a localised resource description/tooltip using the supplied base key with ".desc" appended.
   */
  l10nDesc(uiObject, key){
		if (uiObject.description){
			return uiObject.description;
		}else{
			if (uiObject.resourceKey){
				return this.l10n(uiObject.resourceKey + ".desc");
			}else{
				return this.l10n(key + ".desc");
			}
		}
  }

  /**
   * Look up a localised resource label for an enumerated value using the supplied
   * base key with the value and ".label" appended e.g. "measurement.continous.label".
   */
  l10nValueLabel(baseKey, value) {
    let lookupKey = baseKey + "." + value + ".label"
    let result = this.l10n(lookupKey)
    // If the key is returned unchanged then assume lookup failed so use the base value
    if (result === lookupKey) {
			return value;
		}
    else {
      return result
    }
  }
}
