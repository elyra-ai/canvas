/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Button from "carbon-components-react/lib/components/Button";

import PropertyUtils from "./../../../util/property-utils";
import { MESSAGE_KEYS, TOOL_TIP_DELAY } from "./../../../constants/constants";
import Tooltip from "./../../../../tooltip/tooltip.jsx";
import uuid4 from "uuid/v4";
import classNames from "classnames";


export default class ExpressionSelectOperator extends React.Component {

	onOperatorClick(value, evt) {
		if (this.props.onChange) {
			this.props.onChange(value);
		}
	}

	_makeOperatorContent() {
		if (this.props.operatorList) {
			const operatorButtons = [];
			this.props.operatorList.forEach((operator, index) => {
				const tooltipId = uuid4() + "-tooltip-expression-operator";
				const tooltip = (
					<div className="properties-tooltips">
						{operator.help}
					</div>
				);
				operatorButtons.push(
					<div className="properties-operator-tooltip-container" key={"expression-operator-" + index}>
						<Tooltip
							id={tooltipId}
							tip={tooltip}
							direction="left"
							delay={TOOL_TIP_DELAY}
							className="properties-tooltips"
						>
							<Button
								className={classNames("properties-operator-button", { "first": (index % 2 === 0),
									"second": !(index % 2 === 0) })}
								size="small"
								kind="tertiary"
								onClick={this.onOperatorClick.bind(this, operator.value)}
							>
								{operator.locLabel}
							</Button>
						</Tooltip>
					</div>
				);
			});

			const operatorTitle = PropertyUtils.formatMessage(this.props.controller.getReactIntl(),
				MESSAGE_KEYS.EXPRESSION_OPERATORS_LABEL);
			return (
				<div className="properties-operator-container" >
					<div className="properties-operator-title" >
						<span>{operatorTitle}</span>
					</div>
					<div className="properties-operator-button-container">
						{operatorButtons}
					</div>
					<br />
				</div>
			);
		}
		return (<div />);
	}
	render() {
		const operatorDiv = this._makeOperatorContent();
		return (
			<div className="properties-expression-selection-operator" >
				{operatorDiv}
			</div>
		);
	}
}

ExpressionSelectOperator.propTypes = {
	controller: PropTypes.object.isRequired,
	onChange: PropTypes.func,
	operatorList: PropTypes.array
};
