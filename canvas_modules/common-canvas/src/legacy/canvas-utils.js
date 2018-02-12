/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import clone from "lodash/clone";

const HALO_RADIUS = 45;

// http://stackoverflow.com/questions/17456783/javascript-figure-out-point-y-by-angle-and-distance
function findNewPoint(x, y, angle, distance) {
	var result = {};
	result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
	result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);
	return result;
}

// http://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points
function findSlope(sx, sy, ex, ey) {
	var dy = ey - sy;
	var dx = ex - sx;
	var theta = Math.atan2(dy, dx); // range (-PI, PI]
	theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
	// if (theta < 0) theta = 360 + theta; // range [0, 360)
	return theta;
}


/**
 * Get 3 points in right order to draw an arrowhead
 * @param {Object} data contains line's start and end points
 * @param {number} zoom zoom level
 * @return {Object} an object contains 3 points.
 */
function getArrowheadPoints(data, zoom) {
	const slope = findSlope(data.x1, data.y1, data.x2, data.y2);
	const linkLength = Math.sqrt((data.x2 -= data.x1) * data.x2 + (data.y2 -= data.y1) * data.y2);
	const distanceToArrow = Math.round(linkLength - (HALO_RADIUS * zoom));
	const p2 = findNewPoint(data.x1, data.y1, slope, distanceToArrow);
	// TODO futher refine positioning logic
	const p1Angle = slope + 160;
	const p3Angle = slope - 160;

	const p1 = findNewPoint(p2.x, p2.y, p1Angle, 10);
	const p3 = findNewPoint(p2.x, p2.y, p3Angle, 10);

	const arrowhead = {
		p1,
		p2,
		p3
	};
	return arrowhead;

}

/**
 * Get the intersection point of line and halo
 * @param {Object} data contains line's start and end points
 * @param {number} zoom zoom level
 * @return {Object} an object contains x,y points.
 */
function getLinePointOnHalo(data, zoom) {
	const slope = findSlope(data.x1, data.y1, data.x2, data.y2);
	const d = clone(data);
	const linkLength = Math.sqrt((d.x2 -= d.x1) * d.x2 + (d.y2 -= d.y1) * d.y2);
	const distanceToHalo = Math.round(linkLength - (HALO_RADIUS * zoom));
	const posHalo = findNewPoint(data.x1, data.y1, slope, distanceToHalo);
	return posHalo;
}

/**
 * Converts a string of key-value pairs separated by delimiter into a JSON object
 * @param {String} data string with key-value pairs
 * @param {String} delimiter delimiter char, default: semi-colon
 * @return {Object} JSON object
 */
function convertStyleStringToJSONObject(data, delimiter) {
	const delimiterChar = (delimiter) ? delimiter : ";";
	if (data) {
		var result = {};
		const items = data.split(delimiterChar);
		items.forEach((item) => {
			const element = item.split(":");
			if (element.length === 2) {
				// ignore any invalid styles
				result[element[0].trim()] = element[1].trim();
			}
		});
		return result;
	}
	return {};

}

module.exports = {
	findSlope: findSlope,
	findNewPoint: findNewPoint,
	getArrowheadPoints: getArrowheadPoints,
	getLinePointOnHalo: getLinePointOnHalo,
	convertStyleStringToJSONObject: convertStyleStringToJSONObject
};
