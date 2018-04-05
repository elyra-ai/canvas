/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7] */

import React from "react";
import ValidationMessage from "./../components/validation-message";
import ValidationIcon from "./../components/validation-icon";
import { DEFAULT_VALIDATION_MESSAGE, VALIDATION_MESSAGE, EDITOR_CONTROL, STATES, CONTROL_TYPE } from "./../constants/constants.js";

function splitNewlines(text) {
	if (text.length > 0) {
		const split = text.split("\n");
		if (Array.isArray(split)) {
			return split;
		}
		return [split];
	}
	return [];
}

function joinNewlines(list) {
	if (Array.isArray(list)) {
		return list.length === 0 ? [] : list.join("\n");
	}
	return list;
}

function handleTableRowClick(evt, rowIndex, selection, allowedSelection) {
	// logger.info(selection);
	var selected = selection;
	const index = selected.indexOf(rowIndex);

	if (allowedSelection === "single") {
		selected = [rowIndex];
	} else if (evt.metaKey === true || evt.ctrlKey === true) {
		// If already selected then remove otherwise add
		if (index >= 0) {
			selected.splice(index, 1);
		} else {
			selected = selected.concat(rowIndex);
		}
	} else if (evt.shiftKey === true) {
		const anchor = selected.length > 0 ? selected[0] : rowIndex;
		const start = anchor > rowIndex ? rowIndex : anchor;
		const end = (anchor > rowIndex ? anchor : rowIndex) + 1;
		const newSelns = [];
		for (let i = start; i < end; i++) {
			newSelns.push(i);
		}
		selected = newSelns;
	} else {
		selected = [rowIndex];
	}
	return selected;
}


function	getControlID(control, propertyId) {
	let id = EDITOR_CONTROL + control.name;
	if (propertyId && typeof propertyId.row !== "undefined") {
		id = id + "_" + propertyId.row;
	}
	return id;
}

function	getConditionMsgState(controller, conditionProps) {
	let message = DEFAULT_VALIDATION_MESSAGE;
	message = controller.getErrorMessage(conditionProps.propertyId);
	if (typeof message === "undefined" || message === null) {
		message = DEFAULT_VALIDATION_MESSAGE;
	}
	let errorMessage = (<ValidationMessage
		validateErrorMessage={message}
		controlType={conditionProps.controlType}
	/>);
	let errorIcon = (<ValidationIcon
		validateErrorMessage={message}
		controlType={conditionProps.controlType}
	/>);
	const stateDisabled = {};
	let showTooltip = true;
	let stateStyle = {};

	let messageType = "info";
	if (typeof message !== "undefined" && message !== null) {
		messageType = message.type;
		switch (message.type) {
		case "warning":
			stateStyle = {
				borderColor: VALIDATION_MESSAGE.WARNING
			};
			break;
		case "error":
			stateStyle = {
				borderColor: VALIDATION_MESSAGE.ERROR
			};
			break;
		default:
		}
	}

	let itemState = null;
	if (conditionProps.controlType === CONTROL_TYPE.PANEL) {
		itemState = controller.getPanelState(conditionProps.propertyId);
	} else {
		itemState = controller.getControlState(conditionProps.propertyId);
	}
	if (itemState) {
		switch (itemState) {
		case STATES.DISABLED:
			stateDisabled.disabled = true;
			stateStyle.color = VALIDATION_MESSAGE.DISABLED;
			stateStyle.borderColor = VALIDATION_MESSAGE.DISABLED;
			stateStyle.pointerEvents = "none";
			showTooltip = false;
			errorMessage = <div />;
			errorIcon = <div />;
			break;
		case STATES.HIDDEN:
			stateStyle.display = "none";
			showTooltip = false;
			errorMessage = <div />;
			errorIcon = <div />;
			break;
		default:
		}
	}
	return {
		message: errorMessage,
		messageType: messageType,
		icon: errorIcon,
		disabled: stateDisabled,
		style: stateStyle,
		showTooltip: showTooltip
	};
}

function	getCharLimit(control, defaultLimit) {
	let limit = defaultLimit;
	if (control.charLimit) {
		limit = control.charLimit;
	}
	return limit;
}

module.exports = {
	getCharLimit: getCharLimit,
	getControlID: getControlID,
	splitNewlines: splitNewlines,
	joinNewlines: joinNewlines,
	handleTableRowClick: handleTableRowClick,
	getConditionMsgState: getConditionMsgState
};
