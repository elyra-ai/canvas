"use strict"


function validateObjecModel(objectModel, type, compare) {
  var omJson = JSON.parse(objectModel);
  if (type === "nodes") {
    var nodes = omJson.diagram.nodes;
    for (i=0;i < nodes.length; i++) {
      if (nodes[i].image === compare) {
        return true;
      }
    }
  } else if(type === "comments") {
    var comments = omJson.diagram.comments;
    for (i=0;i < comments.length; i++) {
      if (comments[i].content === compare) {
        return true;
      }
    }
  } else if (type === "links") {
    var links = omJson.diagram.links;
    if (links.length === compare) {
      return true;
    }
    console.log("validateObjecModel() links found "+links.length+ " expected "+compare);
  }
  return false;
}

function validateEventLog(eventLog, eventType, eventData) {
  var elJson = JSON.parse(eventLog);
  for (i=0;i < elJson.length; i++) {
    if (elJson[i].event === eventType &&
        (elJson[i].data === eventData ||
         elJson[i].content === eventData)) {
      return true;
    }
  }
  return false;
}

function validateLinkEvent(eventLog, eventType, expectedLength) {
  var elJson = JSON.parse(eventLog);
  var count = 0
  for (i=0;i < elJson.length; i++) {
    if (elJson[i].event === eventType) {
      count++;
    }
  }
  if (count === expectedLength) {
    return true;
  }
  return false;
}

module.exports = {
    validateObjecModel: validateObjecModel,
    validateEventLog: validateEventLog,
    validateLinkEvent: validateLinkEvent
}
