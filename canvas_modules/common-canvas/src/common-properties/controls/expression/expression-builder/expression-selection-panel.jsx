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
import ExpressionSelectFieldOrFunction from "./expression-select-field-function.jsx";

import ExpressionSelectOperator from "./expression-select-operator.jsx";

export default class ExpressionSelectionPanel extends React.Component {
	render() {
		const fieldsOrFunction = (
			<ExpressionSelectFieldOrFunction
				controller= {this.props.controller}
				onChange={this.props.onChange}
				functionList={this.props.functionList}
				language={this.props.language}
			/>
		);
		const operators = (
			<ExpressionSelectOperator
				controller= {this.props.controller}
				onChange={this.props.onChange}
				operatorList={this.props.operatorList}
			/>
		);

		return (
			<div className="properties-expression-selection-container" >
				{operators}
				{fieldsOrFunction}
			</div>
		);
	}
}

ExpressionSelectionPanel.propTypes = {
	controller: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	functionList: PropTypes.array.isRequired,
	operatorList: PropTypes.array.isRequired,
	language: PropTypes.string
};
