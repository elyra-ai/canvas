/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import FlexibleTable from "../../components/flexible-table";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";

import { TABLE_SCROLLBAR_WIDTH, STATES, CONDITION_MESSAGE_TYPE } from "../../constants/constants";


export default class SomeofselectControl extends React.Component {
	constructor(props) {
		super(props);
		this.newSelection = null;
		this.genSelectOptions = this.genSelectOptions.bind(this);
	}

	componentDidMount() {
		if (this.newSelection) {
			this.props.controller.updatePropertyValue(this.props.propertyId, this.newSelection);
			this.newSelection = null;
		}
	}

	handleChange(value, selected) {
		let controlValues = this.props.controller.getPropertyValue(this.props.propertyId);
		if (selected) {
			// add to values
			if (Array.isArray(controlValues) && controlValues.indexOf(value) === -1) {
				controlValues.push(value);
			} else {
				controlValues = [value];
			}
		} else if (Array.isArray(controlValues)) {
			// remove value
			const valueIndex = controlValues.indexOf(value);
			controlValues.splice(valueIndex, 1);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, controlValues);
	}

	genSelectOptions(selectedValues, state) {
		const options = [];

		// Allow for enumeration replacement
		const controlOpts = this.props.controller.getFilteredEnumItems(this.props.propertyId, this.props.control);
		for (let i = 0; i < controlOpts.values.length; i++) {
			const checked = selectedValues.indexOf(controlOpts.values[i]) !== -1;
			const id = this.props.propertyId.name + "-" + i;
			const cellContent = (<Checkbox
				disabled={state === STATES.DISABLED}
				id={id}
				labelText={controlOpts.valueLabels[i]}
				onChange={this.handleChange.bind(this, controlOpts.values[i])}
				checked={checked}
			/>);

			const columns = [];
			columns.push({
				column: "someofselect-checkbox",
				content: cellContent,
			}
			);
			// add padding for scrollbar
			columns.push({
				key: i + "-1-scrollbar",
				column: "scrollbar",
				width: TABLE_SCROLLBAR_WIDTH,
				content: <div />
			});
			options.push({ className: "table-row", columns: columns });
		}

		// Check for filtered selections
		if (Array.isArray(selectedValues)) {
			const newSelns = selectedValues.slice(0);
			for (let i = 0; i < selectedValues.length; i++) {
				if ((controlOpts.values.indexOf(selectedValues[i])) === -1) {
					newSelns.splice(newSelns.indexOf(selectedValues[i]), 1);
				}
			}
			if (selectedValues.length !== newSelns.length) {
				this.newSelection = newSelns;
			}
		}

		return options;
	}

	render() {
		let controlValue = this.props.controller.getPropertyValue(this.props.propertyId);
		const state = this.props.controller.getControlState(this.props.propertyId);
		const messageInfo = this.props.controller.getErrorMessage(this.props.propertyId);
		const messageType = (messageInfo) ? messageInfo.type : CONDITION_MESSAGE_TYPE.INFO;

		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}

		const options = this.genSelectOptions(controlValue, state);
		const rows = this.props.control.rows ? this.props.control.rows : 4;

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-someofselect ", { "hide": state === STATES.HIDDEN,
					"error": messageType === CONDITION_MESSAGE_TYPE.ERROR, "warning": messageType === CONDITION_MESSAGE_TYPE.WARNING })}
			>
				<FlexibleTable
					columns={[]}
					rows={rows}
					data={options}
					scrollKey={this.props.control.name}
					controller={this.props.controller}
				/>
				<ValidationMessage state={state} messageInfo={messageInfo} inTable={this.props.tableControl} />
			</div>

		);
	}
}

SomeofselectControl.propTypes = {
	control: PropTypes.object,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool
};
