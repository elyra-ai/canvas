/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/* eslint complexity: ["error", 30]*/

import logger from "../../../../utils/logger";
import { L10nProvider } from "../../util/L10nProvider";
import propertyOf from "lodash/propertyOf";
import cloneDeep from "lodash/cloneDeep";

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
		}
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


module.exports = {
	setExpressionInfo: setExpressionInfo
};
