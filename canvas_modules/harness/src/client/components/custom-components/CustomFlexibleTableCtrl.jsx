/*
 * Copyright 2025 Elyra Authors
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
import { Checkbox, TextInput } from "@carbon/react";

import { FlexibleTable } from "common-canvas"; // eslint-disable-line import/no-unresolved

const NUM_ROWS = 100;

class CustomFlexibleTableCtrl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			checkedAll: false,
			checkedRows: new Array(NUM_ROWS).fill(false)
		};

		this.headers = [
			{
				"key": "harness-custom-ft-checkbox",
				"width": "55px",
				"label":
					<div className="harness-custom-ft-th-checkbox">
						<Checkbox
							id={"ta-checkbox-all-values"}
							onChange={() => this.setState({ checkedAll: !this.state.checkedAll })}
							checked={this.state.checkedAll}
							hideLabel
							labelText=""
						/>
					</div>
			},
			{
				"key": "harness-custom-ft-cola",
				"width": "100px",
				"resizable": true,
				"label": "Column A"
			},
			{
				"key": "harness-custom-ft-colb",
				"width": "80px",
				"resizable": true,
				"label": "Column B"
			},
			{
				"key": "harness-custom-ft-colc",
				"width": "200px",
				"resizable": true,
				"label": "Column C"
			},
			{
				"key": "harness-custom-ft-cold",
				"width": "150px",
				"resizable": true,
				"label": "Column D"
			},
			{
				"key": "harness-custom-ft-cole",
				"width": "10",
				"resizable": true,
				"label": "Column E"
			},
			{
				"key": "harness-custom-ft-colf",
				"resizable": true,
				"label": "Column F"
			},
			{
				"key": "harness-custom-ft-colg",
				"resizable": true,
				"label": "Column G"
			},
			{
				"key": "harness-custom-ft-colh",
				"width": "120px",
				"resizable": true,
				"label": "Column H"
			},
			{
				"key": "harness-custom-ft-coli",
				"resizable": true,
				"label": "Column I"
			},
			{
				"key": "harness-custom-ft-colj",
				"width": "30",
				"resizable": true,
				"label": "Column J"
			},
			{
				"key": "harness-custom-ft-colk",
				"width": "20",
				"resizable": true,
				"label": "Column K"
			},
			{
				"key": "harness-custom-ft-coll",
				"width": "100px",
				"resizable": true,
				"label": "Column L"
			}
		];
		this.rows = this.getRows();
	}

	getRows() {
		const rows = [];
		for (let ridx = 0; ridx < NUM_ROWS; ridx++) {
			const rowData = {
				className: `custom-ft-row-${ridx}`,
				columns: [{
					column: "harness-custom-ft-checkbox",
					content: (<div className="harness-custom-ft-td-checkbox">
						<Checkbox
							id={"custom-ft-checkbox-value-" + ridx}
							checked={this.state.checkedAll === true || this.state.checkedRows[ridx]}
							onChange={this.handleRowChecked.bind(this, ridx)}
							hideLabel
						/>
					</div>)
				}]
			};
			for (let cidx = 1; cidx < this.headers.length; cidx++) {
				if (cidx === 3) {
					rowData.columns.push({
						column: this.headers[cidx].key,
						content: (<div>
							<TextInput
								defaultValue={`${this.headers[cidx].label} row ${ridx}`}
								size="sm"
							/>
						</div>)
					});
				} else if (cidx === 5) {
					rowData.columns.push({
						column: this.headers[cidx].key,
						content: <span>{`Cell content ${cidx}-${ridx} whose column width is 200px`}</span>
					});
				} else {
					rowData.columns.push({
						column: this.headers[cidx].key,
						content: <span title={`Cell content ${cidx}-${ridx}`}>{`Cell content ${cidx}-${ridx}`}</span>
					});
				}
			}
			rows.push(rowData);
		}
		return rows;
	}

	handleRowChecked(index, evt) {
		const newState = Array.from(this.state.checkedRows);
		this.setState({ checkedRows: newState[index] = evt });
	}

	render() {
		return (
			<div className="harness-custom-flexible-table">
				<FlexibleTable
					enableTanstackTable
					columns={this.headers}
					data={this.rows}
				/>
			</div>
		);
	}
}

CustomFlexibleTableCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
	controlValue: PropTypes.array // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomFlexibleTableCtrl);
