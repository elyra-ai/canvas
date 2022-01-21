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
import { Button } from "carbon-components-react";

import Tooltip from "./../../../../tooltip/tooltip";
import { v4 as uuid4 } from "uuid";
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
							direction="bottom"
							className="properties-tooltips"
						>
							<Button
								className={classNames("properties-operator-button", { "first": (index % 2 === 0),
									"second": !(index % 2 === 0) })}
								size="small"
								kind="tertiary"
								onClick={this.onOperatorClick.bind(this, operator.value)}
							>
								<div className="properties-operator-button-label">
									{operator.locLabel}
								</div>
							</Button>
						</Tooltip>
					</div>
				);
			});

			return (
				<div className="properties-operator-container" >
					{operatorButtons}
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
