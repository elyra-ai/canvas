/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
				{fieldsOrFunction}
				{operators}
			</div>
		);
	}
}

ExpressionSelectionPanel.propTypes = {
	controller: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	functionList: PropTypes.object.isRequired,
	operatorList: PropTypes.array.isRequired
};
