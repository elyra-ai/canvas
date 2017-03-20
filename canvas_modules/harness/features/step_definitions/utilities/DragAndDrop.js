"use strict"

export function simulateDragDrop(sourceElementClassName, index, dropEventClientX, dropEventClientY) {

    var sourceNodeList = document.getElementsByClassName(sourceElementClassName);
    var sourceNode = sourceNodeList[index];
    var destinationNode = document.getElementById("canvas-div");

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
            }
        }
        if(clientX) event.clientX = clientX;
        if(clientY) event.clientY = clientY;

        return event
    }

    function dispatchEvent(node, type, event) {
      console.log("dispatch type = " + type);
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
