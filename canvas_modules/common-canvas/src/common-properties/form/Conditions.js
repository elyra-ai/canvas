/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
		if (object.hasOwnProperty(x)) {
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

module.exports = {
	translateMessages: translateMessages
};
