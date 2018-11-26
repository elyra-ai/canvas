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
import { connect } from "react-redux";
import FlexibleTable from "../../components/flexible-table";
import Checkbox from "carbon-components-react/lib/components/Checkbox";
import ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import intersection from "lodash/intersection";
import isEqual from "lodash/isEqual";

import { TABLE_SCROLLBAR_WIDTH, STATES } from "../../constants/constants";


class SomeofselectControl extends React.Component {
	constructor(props) {
		super(props);
		this.genSelectOptions = this.genSelectOptions.bind(this);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
	}

	componentDidUpdate() {
		this.updateValueFromFilterEnum();
	}

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		const newValues = intersection(this.props.value, this.props.controlOpts.values);
		if (!isEqual(newValues, this.props.value)) {
			this.props.controller.updatePropertyValue(this.props.propertyId, newValues, skipValidateInput);
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

	genSelectOptions(selectedValues) {
		const options = [];

		// Allow for enumeration replacement
		for (let i = 0; i < this.props.controlOpts.values.length; i++) {
			const checked = selectedValues.indexOf(this.props.controlOpts.values[i]) !== -1;
			const id = this.props.propertyId.name + "-" + i;
			const cellContent = (<Checkbox
				disabled={this.props.state === STATES.DISABLED}
				id={id}
				labelText={this.props.controlOpts.valueLabels[i]}
				onChange={this.handleChange.bind(this, this.props.controlOpts.values[i])}
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
		return options;
	}

	render() {
		let controlValue = this.props.value;
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}

		const options = this.genSelectOptions(controlValue);
		const rows = this.props.control.rows ? this.props.control.rows : 4;

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-someofselect ", { "hide": this.props.state === STATES.HIDDEN },
					this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				<FlexibleTable
					columns={[]}
					rows={rows}
					data={options}
					scrollKey={this.props.control.name}
					controller={this.props.controller}
				/>
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={this.props.tableControl} />
			</div>

		);
	}
}

SomeofselectControl.propTypes = {
	control: PropTypes.object,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	tableControl: PropTypes.bool,
	state: PropTypes.string, // pass in by redux
	value: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object, // pass in by redux
	controlOpts: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId),
	controlOpts: ownProps.controller.getFilteredEnumItems(ownProps.propertyId, ownProps.control)
});

export default connect(mapStateToProps, null)(SomeofselectControl);
