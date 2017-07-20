/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

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
		custEvent.clientX = clientX;
		custEvent.clientY = clientY;

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

	var event = createCustomEvent(EVENT_TYPES.DRAG_START, 0, 0);
	dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event);

	var dropEvent = createCustomEvent(EVENT_TYPES.DROP, dropEventClientX, dropEventClientY);
	dropEvent.dataTransfer = event.dataTransfer;
	dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent);

	var dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END);
	dragEndEvent.dataTransfer = event.dataTransfer;
	dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent);
}

function simulateD3LinkCreation(sourceSelector, sourceIndex, destinationSelector, destinationIndex, dropEventClientX, dropEventClientY) {
	var EVENT_TYPES = {
		MOUSE_DOWN: "mousedown",
		MOUSE_UP: "mouseup"
	};

/* global CustomEvent document */

	function createCustomEvent(type, clientX, clientY) {
		var custEvent = new CustomEvent("CustomEvent");
		custEvent.initCustomEvent(type, true, true, null);
		custEvent.clientX = clientX;
		custEvent.clientY = clientY;

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

	var event = createCustomEvent(EVENT_TYPES.MOUSE_DOWN, 0, 0);
	dispatchEvent(sourceNode, EVENT_TYPES.MOUSE_DOWN, event);

	var dropEvent = createCustomEvent(EVENT_TYPES.MOUSE_UP, dropEventClientX, dropEventClientY);
	dispatchEvent(destinationNode, EVENT_TYPES.MOUSE_UP, dropEvent);
}

module.exports = {
	simulateDragDrop: simulateDragDrop,
	simulateD3LinkCreation: simulateD3LinkCreation
};
