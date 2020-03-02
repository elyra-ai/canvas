/*
 * Copyright 2017-2020 IBM Corporation
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

import cellNotEmpty from "./cellNotEmpty";
import colNotExists from "./colNotExists";
import colDoesExists from "./colDoesExists";
import contains from "./contains";
import equals from "./equals";
import greaterThan from "./greaterThan";
import isEmpty from "./isEmpty";
import isNotEmpty from "./isNotEmpty";
import lessThan from "./lessThan";
import matches from "./matches";
import notContains from "./notContains";
import notEquals from "./notEquals";
import notMatches from "./notMatches";
import isDateTime from "./isDateTime";
import dmTypeEquals from "./dmTypeEquals";
import dmTypeNotEquals from "./dmTypeNotEquals";
import dmMeasurementEquals from "./dmMeasurementEquals";
import dmMeasurementNotEquals from "./dmMeasurementNotEquals";
import dmRoleEquals from "./dmRoleEquals";
import dmRoleNotEquals from "./dmRoleNotEquals";


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

module.exports.getConditionOps = getConditionOps;
