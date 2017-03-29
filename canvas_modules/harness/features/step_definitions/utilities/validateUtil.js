function getObjectModelCount(objectModel, type, compare) {
	var count = 0;
	var omJson = JSON.parse(objectModel);
	if (type === "nodes") {
		var nodes = omJson.diagram.nodes;
		for (var idx = 0; idx < nodes.length; idx++) {
			if (nodes[idx].image === compare) {
				count++;
			}
		}
	} else if (type === "comments") {
		var comments = omJson.diagram.comments;
		for (var cidx = 0; cidx < comments.length; cidx++) {
			if (comments[cidx].content === compare) {
				count++;
			}
		}
	} else if (type === "links") {
		var links = omJson.diagram.links;
		count = links.length;
	}
	return count;
}

function isObjectModelEmpty(objectModel) {
	var omJson = JSON.parse(objectModel);
	var count = omJson.diagram.nodes.length +
							omJson.diagram.comments.length +
							omJson.diagram.links.length;
	return count;
}

function getEventLogCount(eventLog, eventType, eventData) {
	var count = 0;
	var elJson = JSON.parse(eventLog);
	for (var idx = 0; idx < elJson.length; idx++) {
		if (elJson[idx].event === eventType &&
			(elJson[idx].data === eventData ||
			elJson[idx].content === eventData)) {
			count++;
		}
	}
	return count;
}

function getLinkEventCount(eventLog, eventType) {
	var elJson = JSON.parse(eventLog);
	var count = 0;
	for (var idx = 0; idx < elJson.length; idx++) {
		if (elJson[idx].event === eventType) {
			count++;
		}
	}
	return count;
}

module.exports = {
	getObjectModelCount: getObjectModelCount,
	getEventLogCount: getEventLogCount,
	getLinkEventCount: getLinkEventCount,
	isObjectModelEmpty: isObjectModelEmpty
};
