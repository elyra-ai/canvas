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

const CONTROL_TYPE_MAP = {
	string: "textfield",
	integer: "numberfield",
	double: "numberfield",
	boolean: "toggletext",
	enum: "oneofselect"
};

const OPS_NEEDING_VALUE = new Set([
	"equals", "notEquals", "greaterThan", "lessThan",
	"contains", "notContains", "startsWith", "endsWith"
]);

function coerceDefault(value, type) {
	if (value === null || value === "") {
		if (type === "boolean") {
			return false;
		}
		if (type === "integer" || type === "double") {
			return 0;
		}
		return "";
	}
	if (type === "integer") {
		return parseInt(value, 10) || 0;
	}
	if (type === "double") {
		return parseFloat(value) || 0;
	}
	if (type === "boolean") {
		return Boolean(value);
	}
	return value;
}

function buildCondition(cond) {
	if (!cond.paramRef) {
		return null;
	}
	const evaluateCondition = { parameter_ref: cond.paramRef, op: cond.op || "isNotEmpty" };
	if (OPS_NEEDING_VALUE.has(cond.op) && cond.value) {
		evaluateCondition.value = cond.value;
	}
	return {
		validation: {
			fail_message: {
				type: "error",
				focus_parameter_ref: cond.paramRef,
				message: { default: cond.errorMessage || "This field is required." }
			},
			evaluate: { condition: evaluateCondition }
		}
	};
}

function buildActionInfo(actions) {
	return (actions || [])
		.filter((a) => Boolean(a.id))
		.map((a) => ({
			id: a.id,
			label: { default: a.label || a.id },
			description: { default: a.description || "" },
			control: "image",
			data: {},
			image: {
				url: a.imageUrl || "",
				placement: a.placement || "right",
				size: { height: Number(a.height) || 20, width: Number(a.width) || 25 }
			}
		}));
}

export default function propertiesGenerator(paramDefEntry, nodeLabel, nodeOp) {
	const parameters = (paramDefEntry && paramDefEntry.parameters) || [];
	const titleDefinition = paramDefEntry && paramDefEntry.titleDefinition;
	const conditions = (paramDefEntry && paramDefEntry.conditions) || [];
	const actions = (paramDefEntry && paramDefEntry.actions) || [];

	const currentParameters = {};
	const parametersSchema = [];
	const parameterInfo = [];
	const parameterRefs = [];

	parameters.forEach((param) => {
		if (!param.id) {
			return;
		}

		currentParameters[param.id] = coerceDefault(param.default, param.type);

		const schemaParam = {
			id: param.id,
			type: param.type === "enum" ? "string" : (param.type || "string"),
			required: Boolean(param.required)
		};
		if (param.type === "enum" && param.enumValues && param.enumValues.length > 0) {
			schemaParam.enum = param.enumValues.filter(Boolean);
		}
		parametersSchema.push(schemaParam);

		const infoEntry = {
			parameter_ref: param.id,
			label: { default: param.displayName || param.id },
			control_type: CONTROL_TYPE_MAP[param.type] || "textfield"
		};
		if (param.description) {
			infoEntry.description = { default: param.description };
		}
		if (param.actionRef) {
			infoEntry.action_ref = param.actionRef;
		}
		parameterInfo.push(infoEntry);
		parameterRefs.push(param.id);
	});

	const uiHintsId = nodeOp || "studio-node";
	const actionInfo = buildActionInfo(actions);
	const builtConditions = conditions.map(buildCondition).filter(Boolean);

	const result = {
		current_parameters: currentParameters,
		parameters: parametersSchema,
		uihints: {
			id: uiHintsId,
			label: { default: nodeLabel || "Node Properties" },
			parameter_info: parameterInfo,
			group_info: [
				{
					id: "main-group",
					type: "controls",
					parameter_refs: parameterRefs
				}
			]
		},
		resources: {}
	};

	if (titleDefinition && titleDefinition.title) {
		result.titleDefinition = {
			title: titleDefinition.title,
			editable: titleDefinition.editable !== false
		};
	}

	if (actionInfo.length > 0) {
		result.uihints.action_info = actionInfo;
	}

	if (builtConditions.length > 0) {
		result.conditions = builtConditions;
	}

	return result;
}
