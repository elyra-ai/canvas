/*
 * Copyright 2017-2022 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlexibleTable from "../../components/flexible-table";
import * as ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import { isEqual, intersection } from "lodash";

import { STATES, UPDATE_TYPE } from "../../constants/constants";

class SomeofselectControl extends React.Component {
	constructor(props) {
		super(props);
		this.genSelectOptions = this.genSelectOptions.bind(this);
		this.updateValueFromFilterEnum = this.updateValueFromFilterEnum.bind(this);
		this.updateSelections = this.updateSelections.bind(this);
	}

	componentDidMount() {
		this.updateValueFromFilterEnum(true, UPDATE_TYPE);
	}

	componentDidUpdate(prevProps) {
		// only update if filter options have changed. Fixes issue where filter options are updated after value in setProperties
		if (!isEqual(this.props.controlOpts, prevProps.controlOpts)) {
			this.updateValueFromFilterEnum();
		}
	}

	// this is needed in order to reset the property value when a value is filtered out.
	updateValueFromFilterEnum(skipValidateInput, updateType) {
		const newValues = intersection(this.props.value, this.props.controlOpts.values);
		if (!isEqual(newValues, this.props.value)) {
			this.props.controller.updatePropertyValue(this.props.propertyId, newValues, skipValidateInput, updateType);
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
		const rows = this.props.control.rows ? this.props.control.rows : 5.5;
		const tableLabel = (this.props.control.label && this.props.control.label.text) ? this.props.control.label.text : "";

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-someofselect ", { "hide": this.props.state === STATES.HIDDEN },
					this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				{this.props.controlItem}
				<FlexibleTable
					columns={[{ "key": "someofselect", "label": "" }]}
					rows={rows}
					data={tableOptions.options}
					scrollKey={this.props.control.name}
					tableLabel={tableLabel}
					selectedRows={tableOptions.selected}
					updateRowSelections={this.updateSelections}
					selectable
					showHeader={false}
					light={this.props.controller.getLight()}
					emptyTablePlaceholder={this.props.control.additionalText}
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
	controlItem: PropTypes.element,
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
