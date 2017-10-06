/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2017. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

/* eslint max-depth: ["error", 5] */

/*
This code is a modified version from portal-common-api for the common-canvas toolbar
https://github.ibm.com/dap/portal-common-api/blob/master/src/js/nav/v2/nav.js
*/

var pendingTooltips = {};
var _ID_ACTION_BAR = "#canvas-toolbar";

var _CLASS_DISABLED = "disabled";
var _CLASS_SELECTED = "selected";

var _ACTION_BAR_CLASS_PREFIX = "canvas-action-bar_";
var _CLASS_TOOLTIP = _ACTION_BAR_CLASS_PREFIX + "tooltip";
var _CLASS_TOOLTIP_TRIGGER = _ACTION_BAR_CLASS_PREFIX + "tooltip-trigger";

var _ATTR_ARIA_DESCRIBEDBY = "aria-describedby";
var _ATTR_ARIA_HIDDEN = "aria-hidden";

function updateTooltips(canvasContainerClassName) {
	var tooltips = document.getElementsByClassName(_CLASS_TOOLTIP);
	while (tooltips.length > 0) {
		document.body.removeChild(tooltips[0]);
	}

	updateTooltipsInContainer(canvasContainerClassName);
	updateTooltipListeners();
}

function updateTooltipsInContainer(containerClass) {
	var actionBar = document.querySelector(_ID_ACTION_BAR);
	if (!actionBar) {
		return;
	}

	var actionsContainers = actionBar.querySelectorAll("." + containerClass);
	for (var containerIdx = 0; containerIdx < actionsContainers.length; containerIdx++) {
		var actionsContainer = actionsContainers[containerIdx];
		if (actionsContainer && actionsContainer.hasChildNodes()) {
			var buttonContainers = actionsContainer.childNodes;
			for (var idx = 0; idx < buttonContainers.length; idx++) {
				var buttonContainer = buttonContainers[idx];
				var button = buttonContainer.firstElementChild;
				if (button && button.dataset.hasOwnProperty("tooltip")) {
					var tooltipId = _CLASS_TOOLTIP + "-" + button.dataset.action;
					if (button.dataset.actionbarTooltip === "" || buttonContainer.classList.contains(_CLASS_DISABLED)) {
						buttonContainer.classList.remove(_CLASS_TOOLTIP_TRIGGER);
						buttonContainer.removeAttribute(_ATTR_ARIA_DESCRIBEDBY);
					} else {
						buttonContainer.classList.add(_CLASS_TOOLTIP_TRIGGER);
						buttonContainer.setAttribute(_ATTR_ARIA_DESCRIBEDBY, tooltipId);
						document.body.appendChild(buildTooltip(tooltipId, button.dataset.tooltip));
					}
				}
			}
		}
	}
}

function buildTooltip(tooltipId, content) {
	var tooltip = document.createElement("div");
	tooltip.id = tooltipId;
	tooltip.className = _CLASS_TOOLTIP;
	tooltip.setAttribute(_ATTR_ARIA_HIDDEN, "true");
	tooltip.innerHTML = "<svg x='0px' y='0px' viewBox='0 0 9.1 16.1' >" +
		"<polyline points='9.1,15.7 1.4,8.1 9.1,0.5  '/>" +
		"<polygon points='8.1,16.1 0,8.1 8.1,0 8.1,1.4 1.4,8.1 8.1,14.7  '/></svg>" +
		"<span>" + content + "</span>";
	return tooltip;
}

function updateTooltipLayout(tooltip, tooltipTrigger) {
	var textWidth = tooltip.querySelector("span").offsetWidth;
	var tooltipStyle = getComputedStyle(tooltip);
	var horizontalPadding = parseFloat(tooltipStyle.paddingLeft) +
			parseFloat(tooltipStyle.paddingRight);
	var tooltipCorrection = 3;
	var tooltipWidth = textWidth + horizontalPadding + tooltipCorrection;
	tooltip.style.width = tooltipWidth + "px";

	var viewportMargin = 5;
	var rightViewportMargin = document.documentElement.clientWidth - viewportMargin;
	var triggerLayout = tooltipTrigger.getBoundingClientRect();
	var tooltipLeft = Math.min(triggerLayout.left, rightViewportMargin - tooltipWidth);
	if (tooltipWidth < triggerLayout.width) {
		tooltipLeft += (triggerLayout.width - tooltipWidth) / 2;
	}
	tooltip.style.left = Math.max(tooltipLeft, viewportMargin) + "px";

	var pointer = tooltip.querySelector("svg");
	var pointerLayout = pointer.getBoundingClientRect();
	tooltip.style.top = (triggerLayout.bottom + pointerLayout.height) + "px";

	var pointerCorrection = 1;
	pointer.style.left = (triggerLayout.left - tooltip.getBoundingClientRect().left +
			tooltipTrigger.offsetWidth / 2 - pointerLayout.width / 2	 + pointerCorrection) + "px";
}

function updateTooltipListeners() {
	var actionBar = document.querySelector(_ID_ACTION_BAR);
	if (!actionBar) {
		return;
	}

	var tooltipTriggers = actionBar.querySelectorAll("." + _CLASS_TOOLTIP_TRIGGER);
	for (var idx = 0; idx < tooltipTriggers.length; idx++) {
		var tooltipTrigger = tooltipTriggers[idx];
		tooltipTrigger.onmouseover = function() {
			showTooltipWithDelay(this);
		};
		tooltipTrigger.onmouseleave = function() {
			setTooltipVisible(this, false);
		};
		tooltipTrigger.onmousedown = function() {
			setTooltipVisible(this, false);
		};
	}
}

function showTooltipWithDelay(tooltipTrigger) {
	var tooltipId = tooltipTrigger.getAttribute(_ATTR_ARIA_DESCRIBEDBY);
	if (!tooltipId || pendingTooltips[tooltipId]) {
		return;
	}
	pendingTooltips[tooltipId] = setTimeout(function() {
		setTooltipVisible(tooltipTrigger, true);
	}, 1000);
}

function setTooltipVisible(tooltipTrigger, visible) {
	if (tooltipTrigger.classList.contains(_CLASS_SELECTED)) {
		return;
	}
	var tooltipId = tooltipTrigger.getAttribute(_ATTR_ARIA_DESCRIBEDBY);
	if (!tooltipId) {
		return;
	}
	if (!visible) {
		clearTimeout(pendingTooltips[tooltipId]);
		delete pendingTooltips[tooltipId];
	}

	var tooltip = document.getElementById(tooltipId);
	if (tooltip) {
		if (visible) {
			updateTooltipLayout(tooltip, tooltipTrigger);
		}
		tooltip.setAttribute(_ATTR_ARIA_HIDDEN, !visible);
	}
}

module.exports = {
	updateTooltips: updateTooltips
};
