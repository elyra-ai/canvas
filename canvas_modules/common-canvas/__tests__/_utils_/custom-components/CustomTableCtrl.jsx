/*
 * Copyright 2017-2025 Elyra Authors
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
import { Table } from "reactable";
import { connect } from "react-redux";

class CustomTableCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.getValues = this.getValues.bind(this);
	}
	getValues() {
		const values = [];
		if (Array.isArray(this.props.controlValue)) {
			values.push(
				{
					Age: this.props.controlValue[0],
					Value: this.props.controlValue[1]
				}
			);
		}
		return values;
	}
	render() {
		let visibility;
		if (this.props.state === "hidden") {
			visibility = { visibility: "hidden" };
		}
		let content = null;
		if (Array.isArray(this.props.controlValue)) {
			content = (<div className="text">{this.props.controlValue.join("-")}</div>);
		}
		if (this.props.editStyle !== "summary") {
			content = (
				<div className="custom-table" >
					<Table className="table" data={this.getValues()} />
				</div>
			);
		}
		return (
			<div style={visibility}>
				{content}
			</div>
		);
	}
}

CustomTableCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	editStyle: PropTypes.string,
	state: PropTypes.string, // pass in by redux
	controlValue: PropTypes.array // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomTableCtrl);
