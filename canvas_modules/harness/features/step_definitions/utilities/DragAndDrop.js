"use strict"

// Simulate dragging a node from the palette to the canvas
function dragNodeDropOnCanvas(sourceElementClassName, index, dropClientX, dropClientY) {
  function simulateDragDrop(sourceNode , destinationNode, dropEventClientX, dropEventClientY) {
      var EVENT_TYPES = {
          DRAG_END: 'dragend',
          DRAG_START: 'dragstart',
          DROP: 'drop'
      }

      function createCustomEvent(type, clientX, clientY) {
          var event = new CustomEvent("CustomEvent")
          event.initCustomEvent(type, true, true, null)
          event.dataTransfer = {
              data: {
              },
              setData: function(type, val) {
                  this.data[type] = val
              },
              getData: function(type) {
                  return this.data[type]
              },
              setDragImage: function(img,x,y) {
                //console.log("setDragImage");
              }
          }
          if(clientX) event.clientX = clientX;
          if(clientY) event.clientY = clientY;

          return event
      }

      function dispatchEvent(node, type, event) {
          if (node.dispatchEvent) {
              return node.dispatchEvent(event)
          }
          if (node.fireEvent) {
              return node.fireEvent("on" + type, event)
          }
      }

      var event = createCustomEvent(EVENT_TYPES.DRAG_START)
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event)

      var dropEvent = createCustomEvent(EVENT_TYPES.DROP, dropEventClientX, dropEventClientY)
      dropEvent.dataTransfer = event.dataTransfer
      dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent)

      var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END)
      dragEndEvent.dataTransfer = event.dataTransfer
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent)

  }

  // if I embed simulateDragDrop here it works
  var sourceNodeList = document.getElementsByClassName(sourceElementClassName);
  var sourceNode = sourceNodeList[index];
  var destinationNode = document.getElementById("canvas-div");

  simulateDragDrop(sourceNode, destinationNode, dropClientX, dropClientY);
}

//----------------------
// simulate creating a link by dragging a node to a second node
function dragNodeDropOnNode(index, destinationIndex, dropClientX, dropClientY) {
  function simulateDragDrop(sourceNode , destinationNode, dropEventClientX, dropEventClientY) {
      var EVENT_TYPES = {
          DRAG_END: 'dragend',
          DRAG_START: 'dragstart',
          DROP: 'drop'
      }

      function createCustomEvent(type, clientX, clientY) {
          var event = new CustomEvent("CustomEvent")
          event.initCustomEvent(type, true, true, null)
          event.dataTransfer = {
              data: {
              },
              setData: function(type, val) {
                  this.data[type] = val
              },
              getData: function(type) {
                  return this.data[type]
              },
              setDragImage: function(img,x,y) {
                //console.log("setDragImage");
              }
          }
          if(clientX) event.clientX = clientX;
          if(clientY) event.clientY = clientY;

          return event
      }

      function dispatchEvent(node, type, event) {
          if (node.dispatchEvent) {
              return node.dispatchEvent(event)
          }
          if (node.fireEvent) {
              return node.fireEvent("on" + type, event)
          }
      }

      var event = createCustomEvent(EVENT_TYPES.DRAG_START)
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event)

      var dropEvent = createCustomEvent(EVENT_TYPES.DROP, dropEventClientX, dropEventClientY)
      dropEvent.dataTransfer = event.dataTransfer
      dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent)

      var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END)
      dragEndEvent.dataTransfer = event.dataTransfer
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent)

  }
    // if I embed simulateDragDrop here it works
  var sourceNodeList = document.getElementsByClassName("node-circle");
  var sourceNode = sourceNodeList[index];
  var destinationNodeList = document.getElementsByClassName("node-inner-circle");
  var destinationNode = destinationNodeList[destinationIndex];
  simulateDragDrop(sourceNode , destinationNode, dropClientX, dropClientY);
}

//----------------------
// simulate creating a link by dragging a comment to a second node
function dragCommentDropOnNode(index, destinationIndex, dropClientX, dropClientY) {
  function simulateDragDrop(sourceNode , destinationNode, dropEventClientX, dropEventClientY) {
      var EVENT_TYPES = {
          DRAG_END: 'dragend',
          DRAG_START: 'dragstart',
          DROP: 'drop'
      }

      function createCustomEvent(type, clientX, clientY) {
          var event = new CustomEvent("CustomEvent")
          event.initCustomEvent(type, true, true, null)
          event.dataTransfer = {
              data: {
              },
              setData: function(type, val) {
                  this.data[type] = val
              },
              getData: function(type) {
                  return this.data[type]
              },
              setDragImage: function(img,x,y) {
                //console.log("setDragImage");
              }
          }
          if(clientX) event.clientX = clientX;
          if(clientY) event.clientY = clientY;

          return event
      }

      function dispatchEvent(node, type, event) {
          if (node.dispatchEvent) {
              return node.dispatchEvent(event)
          }
          if (node.fireEvent) {
              return node.fireEvent("on" + type, event)
          }
      }

      var event = createCustomEvent(EVENT_TYPES.DRAG_START)
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event)

      var dropEvent = createCustomEvent(EVENT_TYPES.DROP, dropEventClientX, dropEventClientY)
      dropEvent.dataTransfer = event.dataTransfer
      dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent)

      var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END)
      dragEndEvent.dataTransfer = event.dataTransfer
      dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent)

  }
    // if I embed simulateDragDrop here it works
  var sourceNodeList = document.getElementsByClassName("comment-box");
  var sourceNode = sourceNodeList[index];
  var destinationNodeList = document.getElementsByClassName("node-inner-circle");
  var destinationNode = destinationNodeList[destinationIndex];
  simulateDragDrop(sourceNode , destinationNode, dropClientX, dropClientY);
}

module.exports = {
    dragNodeDropOnNode: dragNodeDropOnNode,
    dragNodeDropOnCanvas: dragNodeDropOnCanvas,
    dragCommentDropOnNode: dragCommentDropOnNode
}
