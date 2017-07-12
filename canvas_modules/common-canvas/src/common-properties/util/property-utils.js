/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/**
 * A better type identifier than a simple 'typeOf' call:
 *
 * 	toType({a: 4}); //"object"
 *	toType([1, 2, 3]); //"array"
 *	(function() {console.log(toType(arguments))})(); //arguments
 *	toType(new ReferenceError); //"error"
 *	toType(new Date); //"date"
 *	toType(/a-z/); //"regexp"
 *	toType(Math); //"math"
 *	toType(JSON); //"json"
 *	toType(new Number(4)); //"number"
 *	toType(new String("abc")); //"string"
 *	toType(new Boolean(true)); //"boolean"
 */
function toType(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

module.exports = {
	toType: toType
};
