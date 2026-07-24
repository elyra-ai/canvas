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
import { TextInput, Select, SelectItem, Toggle, Button } from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";

const PARAM_TYPES = [
	{ value: "string", label: "Text" },
	{ value: "integer", label: "Integer" },
	{ value: "double", label: "Number (decimal)" },
	{ value: "boolean", label: "Boolean (toggle)" },
	{ value: "enum", label: "Dropdown (enum)" }
];

export default class ParameterForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.addEnumValue = this.addEnumValue.bind(this);
		this.removeEnumValue = this.removeEnumValue.bind(this);
		this.updateEnumValue = this.updateEnumValue.bind(this);
	}

	handleChange(field, value) {
		const updated = { ...this.props.param, [field]: value };
		if (field === "type" && value !== "enum") {
			updated.enumValues = [];
		}
		this.props.onChange(updated);
	}

	addEnumValue() {
		const enumValues = [...(this.props.param.enumValues || []), ""];
		this.handleChange("enumValues", enumValues);
	}

	removeEnumValue(index) {
		const enumValues = (this.props.param.enumValues || []).filter((_, i) => i !== index);
		this.handleChange("enumValues", enumValues);
	}

	updateEnumValue(index, value) {
		const enumValues = (this.props.param.enumValues || []).map((v, i) => (i === index ? value : v));
		this.handleChange("enumValues", enumValues);
	}

	render() {
		const { param, availableActions } = this.props;

		return (
			<div className="studio-parameter-form">
				<div className="studio-form-field">
					<TextInput
						id={`param-displayname-${param.paramId}`}
						labelText="Display Label"
						value={param.displayName || ""}
						size="sm"
						onChange={(e) => this.handleChange("displayName", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`param-id-${param.paramId}`}
						labelText="Field ID (no spaces)"
						placeholder="my_param"
						value={param.id || ""}
						size="sm"
						onChange={(e) => this.handleChange("id", e.target.value.replace(/\s+/g, "_"))}
					/>
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`param-desc-${param.paramId}`}
						labelText="Description (optional helper text below the field)"
						value={param.description || ""}
						size="sm"
						onChange={(e) => this.handleChange("description", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<Select
						id={`param-type-${param.paramId}`}
						labelText="Type"
						value={param.type || "string"}
						size="sm"
						onChange={(e) => this.handleChange("type", e.target.value)}
					>
						{PARAM_TYPES.map((t) => (
							<SelectItem key={t.value} value={t.value} text={t.label} />
						))}
					</Select>
				</div>

				<div className="studio-form-field">
					<Toggle
						id={`param-required-${param.paramId}`}
						labelText="Required"
						toggled={Boolean(param.required)}
						size="sm"
						onToggle={(checked) => this.handleChange("required", checked)}
					/>
				</div>

				{param.type !== "boolean" && param.type !== "enum" && (
					<div className="studio-form-field">
						<TextInput
							id={`param-default-${param.paramId}`}
							labelText="Default value"
							value={param.default !== null && param.default !== "" ? String(param.default) : ""}
							size="sm"
							onChange={(e) => this.handleChange("default", e.target.value)}
						/>
					</div>
				)}

				{availableActions && availableActions.length > 0 && (
					<div className="studio-form-field">
						<Select
							id={`param-actionref-${param.paramId}`}
							labelText="Action (icon button beside this field)"
							value={param.actionRef || ""}
							size="sm"
							onChange={(e) => this.handleChange("actionRef", e.target.value)}
						>
							<SelectItem value="" text="— None —" />
							{availableActions.map((a) => (
								<SelectItem key={a.actionId} value={a.id} text={a.id || "(unnamed action)"} />
							))}
						</Select>
					</div>
				)}

				{param.type === "enum" && (
					<div className="studio-enum-values">
						<div className="studio-ports-section-label">Allowed Values</div>
						{(param.enumValues || []).map((val, i) => (
							<div key={i} className="studio-enum-row">
								<TextInput
									id={`enum-val-${param.paramId}-${i}`}
									labelText=""
									value={val}
									size="sm"
									placeholder={`Option ${i + 1}`}
									onChange={(e) => this.updateEnumValue(i, e.target.value)}
								/>
								<Button
									kind="ghost"
									size="sm"
									hasIconOnly
									renderIcon={TrashCan}
									iconDescription="Remove value"
									onClick={() => this.removeEnumValue(i)}
								/>
							</div>
						))}
						<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addEnumValue}>
							Add option
						</Button>
					</div>
				)}
			</div>
		);
	}
}

ParameterForm.propTypes = {
	param: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	availableActions: PropTypes.array
};
