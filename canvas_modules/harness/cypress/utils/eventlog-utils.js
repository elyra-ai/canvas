/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

function getLastEventLogData(doc, override) {
	const eventLog = doc.eventLog;
	const message = override && override ? override : 1;
	const lastEventLog = eventLog[eventLog.length - message];
	return lastEventLog;
}

function getLastLogOfType(doc, logType) {
	const eventLog = doc.eventLog;
	let lastEventLog = "";
	eventLog.forEach((log) => {
		if (log.event === logType) {
			lastEventLog = log;
		}
	});
	return lastEventLog;
}

export {
	getLastEventLogData,
	getLastLogOfType
};
