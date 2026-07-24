/*
 * Copyright 2017-2026 Elyra Authors
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
import { Button, Select, SelectItem, TextInput } from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";

const CONDITION_TYPES = [
	{ value: "validation", label: "Validation error" },
	{ value: "enabled", label: "Enable / disable a field" },
	{ value: "visible", label: "Show / hide a field" }
];

const CONDITION_OPS = [
	{ value: "isNotEmpty", label: "is not empty" },
	{ value: "isEmpty", label: "is empty" },
	{ value: "equals", label: "equals value" },
	{ value: "notEquals", label: "does not equal value" },
	{ value: "greaterThan", label: "greater than value" },
	{ value: "lessThan", label: "less than value" },
	{ value: "contains", label: "contains value" },
	{ value: "notContains", label: "does not contain value" },
	{ value: "startsWith", label: "starts with value" },
	{ value: "endsWith", label: "ends with value" }
];

const OPS_NEEDING_VALUE = new Set([
	"equals", "notEquals", "greaterThan", "lessThan",
	"contains", "notContains", "startsWith", "endsWith"
]);

export default class ConditionsBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.addCondition = this.addCondition.bind(this);
		this.removeCondition = this.removeCondition.bind(this);
		this.updateCondition = this.updateCondition.bind(this);
	}

	addCondition() {
		const newCondition = {
			conditionId: uuid4(),
			conditionType: "validation",
			paramRef: (this.props.parameters && this.props.parameters[0] && this.props.parameters[0].id) || "",
			targetParamRef: "",
			op: "isNotEmpty",
			value: "",
			errorMessage: "This field is required."
		};
		this.props.onChange([...(this.props.conditions || []), newCondition]);
	}

	removeCondition(conditionId) {
		this.props.onChange((this.props.conditions || []).filter((c) => c.conditionId !== conditionId));
	}

	updateCondition(conditionId, field, value) {
		const updated = (this.props.conditions || []).map((c) => {
			if (c.conditionId !== conditionId) {
				return c;
			}
			return { ...c, [field]: value };
		});
		this.props.onChange(updated);
	}

	render() {
		const { conditions, parameters } = this.props;
		const paramOptions = (parameters || []).filter((p) => Boolean(p.id));

		return (
			<div className="studio-conditions-builder">
				<div className="studio-subsection-header">
					<span>Validation Rules</span>
					<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addCondition}>
						Add Rule
					</Button>
				</div>

				{(!conditions || conditions.length === 0) && (
					<div className="studio-placeholder-text">
						No validation rules yet. Click &quot;Add Rule&quot; to require a field or add other checks.
					</div>
				)}

				{(conditions || []).map((cond) => {
					const condType = cond.conditionType || "validation";
					const isEnabledVisible = condType === "enabled" || condType === "visible";
					return (
						<div key={cond.conditionId} className="studio-condition-row">
							<div className="studio-condition-fields">
								<Select
									id={`cond-type-${cond.conditionId}`}
									labelText="Condition type"
									value={condType}
									size="sm"
									onChange={(e) => this.updateCondition(cond.conditionId, "conditionType", e.target.value)}
								>
									{CONDITION_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value} text={t.label} />
									))}
								</Select>

								{isEnabledVisible && (
									<Select
										id={`cond-target-${cond.conditionId}`}
										labelText={condType === "enabled" ? "Enable/disable this field" : "Show/hide this field"}
										value={cond.targetParamRef || ""}
										size="sm"
										onChange={(e) => this.updateCondition(cond.conditionId, "targetParamRef", e.target.value)}
									>
										<SelectItem value="" text="— pick parameter —" />
										{paramOptions.map((p) => (
											<SelectItem key={p.paramId} value={p.id} text={p.displayName || p.id} />
										))}
									</Select>
								)}

								<Select
									id={`cond-param-${cond.conditionId}`}
									labelText={isEnabledVisible ? "When this parameter" : "Parameter"}
									value={cond.paramRef || ""}
									size="sm"
									onChange={(e) => this.updateCondition(cond.conditionId, "paramRef", e.target.value)}
								>
									<SelectItem value="" text="— pick parameter —" />
									{paramOptions.map((p) => (
										<SelectItem key={p.paramId} value={p.id} text={p.displayName || p.id} />
									))}
								</Select>

								<Select
									id={`cond-op-${cond.conditionId}`}
									labelText="Rule"
									value={cond.op || "isNotEmpty"}
									size="sm"
									onChange={(e) => this.updateCondition(cond.conditionId, "op", e.target.value)}
								>
									{CONDITION_OPS.map((op) => (
										<SelectItem key={op.value} value={op.value} text={op.label} />
									))}
								</Select>

								{OPS_NEEDING_VALUE.has(cond.op) && (
									<TextInput
										id={`cond-val-${cond.conditionId}`}
										labelText="Value"
										value={cond.value || ""}
										size="sm"
										onChange={(e) => this.updateCondition(cond.conditionId, "value", e.target.value)}
									/>
								)}

								{!isEnabledVisible && (
									<TextInput
										id={`cond-msg-${cond.conditionId}`}
										labelText="Error message"
										value={cond.errorMessage || ""}
										size="sm"
										onChange={(e) => this.updateCondition(cond.conditionId, "errorMessage", e.target.value)}
									/>
								)}
							</div>

							<Button
								kind="ghost"
								size="sm"
								hasIconOnly
								renderIcon={TrashCan}
								iconDescription="Remove rule"
								className="studio-condition-delete"
								onClick={() => this.removeCondition(cond.conditionId)}
							/>
						</div>
					);
				})}
			</div>
		);
	}
}

ConditionsBuilder.propTypes = {
	conditions: PropTypes.array,
	parameters: PropTypes.array,
	onChange: PropTypes.func.isRequired
};
