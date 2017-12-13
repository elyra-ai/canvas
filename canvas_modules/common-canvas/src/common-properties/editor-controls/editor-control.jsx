/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint max-depth: ["error", 7] */

import React from "react";
import PropTypes from "prop-types";
import ValidationMessage from "./validation-message.jsx";
import ValidationIcon from "./validation-icon.jsx";
import { DEFAULT_VALIDATION_MESSAGE, VALIDATION_MESSAGE, EDITOR_CONTROL } from "../constants/constants.js";

export default class EditorControl extends React.Component {

	static splitNewlines(text) {
		if (text.length > 0) {
			const split = text.split("\n");
			if (Array.isArray(split)) {
				return split;
			}
			return [split];
		}
		return [];
	}

	static joinNewlines(list) {
		if (Array.isArray(list)) {
			return list.length === 0 ? [] : list.join("\n");
		}
		return list;
	}

	static genSelectOptions(control, selectedValues) {
		var options = [];
		for (var i = 0; i < control.values.length; i++) {
			options.push(
				<option key={i} value={control.values[i]}>{control.valueLabels[i]}</option>
			);
		}
		return options;
	}

	static genColumnSelectOptions(fields, selectedValues, includeEmpty) {
		var options = [];
		if (includeEmpty) {
			options.push(
				<option key={-1} disabled value={""}>...</option>
			);
		}

		for (var i = 0; i < fields.length; i++) {
			options.push(
				<option key={i} value={fields[i].name}>{fields[i].name}</option>
			);
		}
		return options;
	}

	static genStringSelectOptions(values, selectedValues) {
		var options = [];
		for (var i = 0; i < values.length; i++) {
			options.push(
				<option key={i} value={values[i]}>{values[i]}</option>
			);
		}
		return options;
	}

	static handleTableRowClick(evt, rowIndex, selection, allowedSelection) {
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

	constructor(props) {
		super(props);
		this.getControlID = this.getControlID.bind(this);
		this.getConditionMsgState = this.getConditionMsgState.bind(this);
	}

	getControlID() {
		return EDITOR_CONTROL + this.props.control.name;
	}

	getConditionMsgState(conditionProps) {
		let message = DEFAULT_VALIDATION_MESSAGE;
		message = this.props.controller.getErrorMessage(conditionProps.propertyId);
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
		const controlState = this.props.controller.getControlState(conditionProps.propertyId);
		if (controlState) {
			switch (controlState) {
			case "disabled":
				stateDisabled.disabled = true;
				stateStyle.color = VALIDATION_MESSAGE.DISABLED;
				stateStyle.borderColor = VALIDATION_MESSAGE.DISABLED;
				showTooltip = false;
				errorMessage = <div />;
				errorIcon = <div />;
				break;
			case "hidden":
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

	getCharLimit(defaultLimit) {
		let limit = defaultLimit;
		if (this.props.control.charLimit) {
			limit = this.props.control.charLimit;
		}
		return limit;
	}


	// TODO Remove?
	_updateCellConditions(conditionProps, stateDisabled, stateStyle) {
		if (this.props.control.valueDef && this.props.control.valueDef.isMap) {
			const controlStates = this.props.controller.getControlStates();
			for (var key in controlStates) {
				if (controlStates.hasOwnProperty(key)) {
					// Separate any complex type sub-control reference
					let paramName = key;
					let offset = key.indexOf("[");
					if (offset > -1) {
						paramName = key.substring(0, offset);
						const rowIndex = parseInt(key.substring(offset + 1), 10);
						offset = key.indexOf("[", offset + 1);
						const colIndex = offset > -1 ? parseInt(key.substring(offset + 1), 10) : -1;
						if (conditionProps.controlName === paramName && rowIndex > -1) {
							this._updateHiddenDisabled(controlStates[key],
								rowIndex, colIndex, stateDisabled, stateStyle);
						}
					}
				}
			}
		}
	}
	// TODO Remove?
	_updateHiddenDisabled(controlState, rowIndex, colIndex, stateDisabled, stateStyle) {
		if (controlState === "disabled") {
			if (!stateDisabled[rowIndex]) {
				stateDisabled[rowIndex] = {};
			}
			if (!stateStyle[rowIndex]) {
				stateStyle[rowIndex] = {};
			}
			if (colIndex > -1) {
				stateDisabled[rowIndex][colIndex] = { disabled: true };
				stateStyle[rowIndex][colIndex] = {
					color: VALIDATION_MESSAGE.DISABLED,
					borderColor: VALIDATION_MESSAGE.DISABLED
				};
			} else {
				stateDisabled[rowIndex].disabled = true;
				stateStyle[rowIndex].color = VALIDATION_MESSAGE.DISABLED;
				stateStyle[rowIndex].borderColor = VALIDATION_MESSAGE.DISABLED;
			}
		} else if (controlState === "hidden") {
			if (!stateStyle[rowIndex]) {
				stateStyle[rowIndex] = {};
			}
			if (colIndex > -1) {
				stateStyle[rowIndex][colIndex] = { display: "none" };
			} else {
				stateStyle[rowIndex].display = "none";
			}
		}
	}

	render() {
		return (
			<div key="editor-control" />
		);
	}
}

EditorControl.propTypes = {
	control: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	controller: PropTypes.object.isRequired
};
