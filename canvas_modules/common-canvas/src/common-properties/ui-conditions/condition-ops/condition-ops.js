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
import logger from "./../../../../utils/logger";

import * as cellNotEmpty from "./cellNotEmpty";
import * as colNotExists from "./colNotExists";
import * as colDoesExists from "./colDoesExists";
import * as contains from "./contains";
import * as equals from "./equals";
import * as greaterThan from "./greaterThan";
import * as isEmpty from "./isEmpty";
import * as isNotEmpty from "./isNotEmpty";
import * as lessThan from "./lessThan";
import * as matches from "./matches";
import * as notContains from "./notContains";
import * as notEquals from "./notEquals";
import * as notMatches from "./notMatches";
import * as isDateTime from "./isDateTime";
import * as dmTypeEquals from "./dmTypeEquals";
import * as dmTypeNotEquals from "./dmTypeNotEquals";
import * as dmMeasurementEquals from "./dmMeasurementEquals";
import * as dmMeasurementNotEquals from "./dmMeasurementNotEquals";
import * as dmRoleEquals from "./dmRoleEquals";
import * as dmRoleNotEquals from "./dmRoleNotEquals";
import * as lengthEquals from "./lengthEquals";
import * as lengthLessThan from "./lengthLessThan";
import * as lengthGreaterThan from "./lengthGreaterThan";


/**
* @param customOps - Array of custom operators to be added to standard operators
*/
function getConditionOps(customOps) {
	const ops = {};
	ops[cellNotEmpty.op()] = cellNotEmpty.evaluate;
	ops[colNotExists.op()] = colNotExists.evaluate;
	ops[colDoesExists.op()] = colDoesExists.evaluate;
	ops[contains.op()] = contains.evaluate;
	ops[equals.op()] = equals.evaluate;
	ops[greaterThan.op()] = greaterThan.evaluate;
	ops[isEmpty.op()] = isEmpty.evaluate;
	ops[isNotEmpty.op()] = isNotEmpty.evaluate;
	ops[lessThan.op()] = lessThan.evaluate;
	ops[matches.op()] = matches.evaluate;
	ops[notContains.op()] = notContains.evaluate;
	ops[notEquals.op()] = notEquals.evaluate;
	ops[notMatches.op()] = notMatches.evaluate;
	ops[isDateTime.op()] = isDateTime.evaluate;
	ops[dmTypeEquals.op()] = dmTypeEquals.evaluate;
	ops[dmTypeNotEquals.op()] = dmTypeNotEquals.evaluate;
	ops[dmMeasurementEquals.op()] = dmMeasurementEquals.evaluate;
	ops[dmMeasurementNotEquals.op()] = dmMeasurementNotEquals.evaluate;
	ops[dmRoleEquals.op()] = dmRoleEquals.evaluate;
	ops[dmRoleNotEquals.op()] = dmRoleNotEquals.evaluate;
	ops[lengthEquals.op()] = lengthEquals.evaluate;
	ops[lengthLessThan.op()] = lengthLessThan.evaluate;
	ops[lengthGreaterThan.op()] = lengthGreaterThan.evaluate;


	if (Array.isArray(customOps)) {
		for (const custOp of customOps) {
			if (custOp && typeof custOp.op === "function" && typeof custOp.evaluate === "function") {
				ops[custOp.op()] = custOp.evaluate;
			} else {
				logger.warn("Custom operator missing require function of `op` or `evaluate`");
			}
		}
	}
	return ops;
}

export { getConditionOps };
