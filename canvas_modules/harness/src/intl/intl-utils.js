/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function _getMessages(locale, bundles) {
	const messages = {};
	for (const bundle of bundles) {
		Object.assign(messages, bundle[locale]);
	}
	return messages;
}

module.exports = {
	getMessages: _getMessages
};
