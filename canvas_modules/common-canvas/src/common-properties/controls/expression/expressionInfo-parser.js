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

import logger from "../../../../utils/logger";
import { L10nProvider, ResourceDef } from "../../util/L10nProvider";
import { cloneDeep, propertyOf } from "lodash";

function setExpressionInfo(inExpressionInfo) {
	const expressionFunctionInfo = {};
	if (inExpressionInfo && inExpressionInfo.functions) {
		const l10nProvider = new L10nProvider(propertyOf(inExpressionInfo)("resources"));
		const expressionInfo = cloneDeep(inExpressionInfo.functions);
		if (Array.isArray(expressionInfo.function_info) && Array.isArray(expressionInfo.function_categories)) {
			// build up the visible function labels from the input label and the parameter information.
			const functionInfoList = expressionInfo.parmsSet ? expressionInfo.function_info : _genFunctionParameters(expressionInfo.function_info, l10nProvider);
			expressionInfo.parmsSet = true;

			// build up the categories for the functions and associate the category with the function info detail.
			expressionFunctionInfo.functionCategories = [];
			expressionInfo.function_categories.forEach((category) => {
				expressionFunctionInfo.functionCategories[category.id] = {};
				expressionFunctionInfo.functionCategories[category.id].locLabel = l10nProvider.l10nLabel(category, category.id);
				expressionFunctionInfo.functionCategories[category.id].functionList = [];
				category.function_refs.forEach((functionId) => {
					const functionInfo = _getFunctionInfo(functionId, functionInfoList);
					if (functionInfo) {
						expressionFunctionInfo.functionCategories[category.id].functionList.push(functionInfo);
					}
				});
			});

			// build up the operator buttons list with the operator function info detail.
			expressionFunctionInfo.operators = [];
			if (expressionInfo.operator_refs) {
				expressionInfo.operator_refs.forEach((functionId) => {
					const functionInfo = _getFunctionInfo(functionId, functionInfoList);
					if (functionInfo) {
						expressionFunctionInfo.operators.push(functionInfo);
					}
				});
			}
			expressionFunctionInfo.fields = { "field_categories": [], "field_table_info": [] };
			if (inExpressionInfo.fields) {
				if (inExpressionInfo.fields.field_categories) {
					inExpressionInfo.fields.field_categories.forEach((fieldCat) => {
						fieldCat.locLabel = l10nProvider.l10nLabel(fieldCat, fieldCat.id);
						fieldCat.field_columns.field_column_info.locLabel = l10nProvider.l10nLabel(fieldCat.field_columns.field_column_info, fieldCat.id + ".field_column_info");
						fieldCat.field_columns.value_column_info.locLabel = l10nProvider.l10nLabel(fieldCat.field_columns.value_column_info, fieldCat.id + ".value_column_info");

						const fieldColInfoDesc = l10nProvider.l10nDesc(fieldCat.field_columns.field_column_info, fieldCat.id + ".field_column_info");
						if (fieldColInfoDesc !== fieldCat.id + ".field_column_info") {
							fieldCat.field_columns.field_column_info.descLabel = fieldColInfoDesc;
						}
						const valueColInfoDesc = l10nProvider.l10nDesc(fieldCat.field_columns.value_column_info, fieldCat.id + ".value_column_info");
						if (valueColInfoDesc !== fieldCat.id + ".value_column_info") {
							fieldCat.field_columns.value_column_info.descLabel = valueColInfoDesc;
						}

						if (fieldCat.field_columns.additional_column_info) {
							fieldCat.field_columns.additional_column_info.forEach((col) => {
								col.locLabel = l10nProvider.l10nLabel(col, fieldCat.id + ".additional_column_info." + col.id);
							});
						}
						expressionFunctionInfo.fields.field_categories.push(fieldCat);
					});
				}
				if (inExpressionInfo.fields.field_table_info) {
					inExpressionInfo.fields.field_table_info.forEach((fieldInfo) => {
						expressionFunctionInfo.fields.field_table_info.push(fieldInfo);
					});
				}
			}
		}
	}

	if (inExpressionInfo && inExpressionInfo.resources) {
		expressionFunctionInfo.resources = inExpressionInfo.resources;
	}

	return expressionFunctionInfo;
}

// build up the visible function labels from the label and the parameter information.
function _genFunctionParameters(functionInfoList, l10nProvider) {
	return functionInfoList.map((functionInfo) => {
		const newEntry = functionInfo;
		newEntry.locLabel = l10nProvider.l10nLabel(newEntry, newEntry.id);
		newEntry.help = l10nProvider.l10nDesc(newEntry, newEntry.locLabel);
		newEntry.value = newEntry.locLabel;
		// Translatable return type of function
		if (newEntry.return_type_label) {
			const returnTypeLabel = ResourceDef.make(newEntry.return_type_label);
			newEntry.locReturnType = l10nProvider.l10nResource(returnTypeLabel);
		}
		if (Array.isArray(functionInfo.parameters)) {
			// if the function label has any parameter substituion char '?' then replace with parameter label
			if (newEntry.locLabel && newEntry.locLabel.indexOf("?") !== -1) {
				functionInfo.parameters.forEach((parameter) => {
					const paramIndex = newEntry.locLabel.indexOf("?");
					if (paramIndex !== -1) {
						newEntry.locLabel = newEntry.locLabel.replace("?", " " + l10nProvider.l10nLabel(parameter, parameter.id) + " ");
					}
				});
			} else {
				// build up function label as a function call with parameters.
				newEntry.value += "(";
				newEntry.locLabel += "(";
				functionInfo.parameters.forEach((parameter, index) => {
					const separator = (index > 0) ? ", " : "";
					newEntry.locLabel += separator + l10nProvider.l10nLabel(parameter, parameter.id);
					newEntry.value += separator + "?";
				});
				newEntry.locLabel += ")";
				newEntry.value += ")";
			}
		}
		return newEntry;
	});

}

function _getFunctionInfo(functionId, functionInfoList) {
	const functionInfo = functionInfoList.find((functionElem) => functionElem.id === functionId);
	if (!functionInfo) {
		logger.warn("Expression function information list, no function information found for " + functionId);
		return null;
	}
	return functionInfo;
}


export default setExpressionInfo;
