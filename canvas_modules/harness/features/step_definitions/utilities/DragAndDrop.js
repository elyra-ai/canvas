function simulateDragDrop(sourceSelector, sourceIndex, destinationSelector, destinationIndex, dropEventClientX, dropEventClientY) {
	var EVENT_TYPES = {
		DRAG_END: "dragend",
		DRAG_START: "dragstart",
		DROP: "drop"
	};

/* global CustomEvent document */

	function createCustomEvent(type, clientX, clientY) {
		var custEvent = new CustomEvent("CustomEvent");
		custEvent.initCustomEvent(type, true, true, null);
		custEvent.dataTransfer = {
			data: {
			},
			setData: function(cType, val) {
				this.data[cType] = val;
			},
			getData: function(cType) {
				return this.data[cType];
			},
			setDragImage: function(img, xX, yY) {
				// console.log("setDragImage");
			}
		};
		if (clientX) {
			custEvent.clientX = clientX;
		}
		if (clientY) {
			custEvent.clientY = clientY;
		}

		return custEvent;
	}

	function dispatchEvent(node, type, dispEvent) {
		if (node.dispatchEvent) {
			return node.dispatchEvent(dispEvent);
		}
		if (node.fireEvent) {
			return node.fireEvent("on" + type, dispEvent);
		}
		return null;
	}

	function getElementFromSelector(selector, index) {
		var element;
		if (selector.startsWith(".")) {
			var elementList = document.getElementsByClassName(selector.slice(1));
			element = elementList[index];
		} else if (selector.startsWith("#")) {
			element = document.getElementById(selector.slice(1));
		}
		return element;
	}

	var sourceNode = getElementFromSelector(sourceSelector, sourceIndex);
	var destinationNode = getElementFromSelector(destinationSelector, destinationIndex);

	var event = createCustomEvent(EVENT_TYPES.DRAG_START);
	dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event);

	var dropEvent = createCustomEvent(EVENT_TYPES.DROP, dropEventClientX, dropEventClientY);
	dropEvent.dataTransfer = event.dataTransfer;
	dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent);

	var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END);
	dragEndEvent.dataTransfer = event.dataTransfer;
	dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent);

}

module.exports = {
	simulateDragDrop: simulateDragDrop
};
