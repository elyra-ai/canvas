/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import EditorControl from "./editor-control.jsx";

export default class OneofselectControl extends EditorControl {
	constructor(props) {
		super(props);

		this.state = {
			clippedClassName: ""
		};
		this.handleChange = this.handleChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onFocus = this.onFocus.bind(this);
	}

	handleChange(evt) {
		this.props.controller.updatePropertyValue(this.props.propertyId, evt.value);
	}
	onBlur() {
		this.props.controller.validateInput(this.props.propertyId);
	}
	// Added to prevent entire row being selected in table
	onClick(evt) {
		const me = ReactDOM.findDOMNode(this.refs.input);
		const myRect = me.getBoundingClientRect();
		const parentRect = me.getRootNode().getElementsByClassName("panel-container-open-right-flyout-panel")[0].getBoundingClientRect();

		let clippedClassName = "";
		// 200 is the height of .Dropdown-menu in common-properties.css
		if (Math.abs((parentRect.top + parentRect.height) - (myRect.top + myRect.height)) < 200) {
			clippedClassName = "Dropdown-menu-clipped";
		}
		this.setState({ clippedClassName: clippedClassName });

		if (this.props.tableControl) {
			evt.stopPropagation();
		}
		this.props.controller.validateInput(this.props.propertyId);
	}

	onFocus(isOpen) {
		// This method is invoked by the dropdown *only* when the control is clicked
		const that = this;
		if (!isOpen && this.props.tableControl) {
			// Give time for the dropdown to be added to the dom
			setTimeout(function() {
				const dropdowns = ReactDOM.findDOMNode(that).getElementsByClassName("Dropdown-menu");
				if (dropdowns.length > 0) {
					var theTop = that.findTopPos(dropdowns[0]);
					var styles = "position: fixed; width: 200px; top: " + (theTop) + "px;";
					dropdowns[0].setAttribute("style", styles);
				}
			}, 50);
		}
	}

	findTopPos(elem) {
		let curtop = 0;
		let curtopscroll = 0;
		let node = elem;
		const modalClassName = "modal-lg modal-dialog";
		let modalOffset = 0;
		if (window.matchMedia("(min-width: 768px)").matches) {
			modalOffset = 20;
		}
		if (node.offsetParent) {
			do {
				curtop += node.offsetTop;
				curtopscroll += node.className !== modalClassName && node.offsetParent ? node.offsetParent.scrollTop : 0;
				node = node.offsetParent;
			} while (node.offsetParent !== null);
		}
		if (node.className.indexOf("rightside-modal-container") >= 0) {
			modalOffset -= 24; // adjust matchMedia offset and 4px for borders from .modal-content and #flexible-table-container
		}
		return curtop - curtopscroll - modalOffset;
	}

	genSelectOptions(control, selectedValue) {
		var options = [];
		var selectedOption = [];
		const optionsLength = control.values.length;
		for (var j = 0; j < optionsLength; j++) {
			options.push({
				value: control.values[j],
				label: control.valueLabels[j]
			});
		}

		for (var k = 0; k < options.length; k++) {
			if (options[k].value === selectedValue) {
				selectedOption = options[k];
				break;
			}
		}

		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	render() {
		const controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const conditionProps = {
			propertyId: this.props.propertyId,
			controlType: "dropdown"
		};
		const conditionState = this.getConditionMsgState(conditionProps);

		const errorMessage = conditionState.message;
		const messageType = conditionState.messageType;
		const icon = this.props.tableControl ? <div /> : conditionState.icon;
		const stateDisabled = conditionState.disabled;
		const stateStyle = conditionState.style;

		let controlIconContainerClass = "control-icon-container";
		if (messageType !== "info") {
			controlIconContainerClass = "control-icon-container-enabled";
		}

		var dropDown = this.genSelectOptions(this.props.control, controlValue);
		return (
			<div id="oneofselect-control-container">
				<div id={controlIconContainerClass}>
					<div>
						<div onClick={this.onClick.bind(this)} className={"Dropdown-control-panel " + this.state.clippedClassName} style={stateStyle}>
							<Dropdown {...stateDisabled}
								id={this.getControlID()}
								name={this.props.control.name}
								options={dropDown.options}
								onChange={this.handleChange}
								onFocus={this.onFocus}
								onBlur={this.onBlur}
								value={dropDown.selectedOption.label}
								placeholder={this.props.control.additionalText}
								ref="input"
							/>
						</div>
					</div>
					{icon}
				</div>
				{errorMessage}
			</div>
		);
	}
}

OneofselectControl.propTypes = {
	control: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
