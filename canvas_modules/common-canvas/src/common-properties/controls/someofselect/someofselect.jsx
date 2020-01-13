/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016, 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlexibleTable from "../../components/flexible-table";
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
		this.updateSelections = this.updateSelections.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true);
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
	}

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput) {
		const newValues = intersection(this.props.value, this.props.controlOpts.values);
		if (!isEqual(newValues, this.props.value)) {
			this.props.controller.updatePropertyValue(this.props.propertyId, newValues, skipValidateInput);
		}
	}

	updateSelections(selected) {
		const controlValues = [];
		for (let i = 0; i < selected.length; i++) {
			const value = this.props.controlOpts.values[selected[i]];
			controlValues.push(value);
		}
		this.props.controller.updatePropertyValue(this.props.propertyId, controlValues);
	}

	genSelectOptions(selectedValues) {
		const tableOptions = {
			options: [],
			selected: []
		};
		// Allow for enumeration replacement
		for (let i = 0; i < this.props.controlOpts.values.length; i++) {
			const checked = selectedValues.indexOf(this.props.controlOpts.values[i]) !== -1;
			if (checked) {
				tableOptions.selected.push(i);
			}
			const columns = [];
			columns.push({
				column: "someofselect",
				state: this.props.state,
				content: this.props.controlOpts.valueLabels[i],
			}
			);
			// add padding for scrollbar
			columns.push({
				key: i + "-1-scrollbar",
				column: "scrollbar",
				width: TABLE_SCROLLBAR_WIDTH,
				content: <div />
			});
			tableOptions.options.push({ className: "table-row", columns: columns, disabled: this.props.state === STATES.DISABLED }); // add state in obj
		}
		return tableOptions;
	}

	render() {
		let controlValue = this.props.value;
		if (typeof controlValue === "undefined" || controlValue === null) {
			controlValue = [];
		}
		const tableOptions = this.genSelectOptions(controlValue);
		const rows = this.props.control.rows ? this.props.control.rows : 4;

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-someofselect ", { "hide": this.props.state === STATES.HIDDEN },
					this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				<FlexibleTable
					columns={[{ "key": "someofselect", "label": "" }]}
					rows={rows}
					data={tableOptions.options}
					scrollKey={this.props.control.name}
					controller={this.props.controller}
					selectedRows={tableOptions.selected}
					updateRowSelections={this.updateSelections}
					selectable
					showHeader={false}
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
