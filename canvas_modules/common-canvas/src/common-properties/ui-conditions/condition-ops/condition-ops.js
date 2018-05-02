/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
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
import notContains from "./notContains";
import notEquals from "./notEquals";
import isDateTime from "./isDateTime";


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
	ops[notContains.op()] = notContains.evaluate;
	ops[notEquals.op()] = notEquals.evaluate;
	ops[isDateTime.op()] = isDateTime.evaluate;


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
