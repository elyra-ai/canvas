/*
 * Copyright 2023 Elyra Authors
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
import { cloneDeep } from "lodash";

function op() {
	return "customFilterKeys";
}

/**
 * A custom filter condition that will return fields that are the values of another parameter
 *
 * @param {Object} propertyId Id of the property being operated upon
 * @param {Object} conditionItem The condition to evaluate
 * @param {Object} controller The properties controller
 * @param {Object} fields Array of fields to filter
 * @return {Object} Array of filtered field names
 */
function evaluate(propertyId, conditionItem, controller, inFields) {
	const fields = cloneDeep(inFields);
	const parameterToReadFrom = conditionItem.parameter_2_ref || null;
	let parameterValues = cloneDeep(controller.getPropertyValue({ name: parameterToReadFrom })) || [];

	if (!parameterToReadFrom) {
		return fields;
	}

	if (parameterValues.length > 0) {
		// Only get the first field that matches
		return fields.filter(function(filterField) {
			if (parameterValues.includes(filterField.name)) {
				parameterValues = parameterValues.filter((filteredParam) => filteredParam !== filterField.name);
				return true;
			}
			return false;
		});
	}
	return [];
}

// Public Methods ------------------------------------------------------------->

export { op, evaluate };
