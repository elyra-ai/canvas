/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import {CANVAS_UI} from '../constants/common-constants.js';
import _ from 'underscore';



//http://stackoverflow.com/questions/17456783/javascript-figure-out-point-y-by-angle-and-distance
function findNewPoint(x, y, angle, distance) {
    var result = {};

    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);

    return result;
}

//http://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points
function findSlope(sx, sy, ex, ey) {
    var dy = ey - sy;
    var dx = ex - sx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}


/**
 * Get 3 points in right order to draw an arrowhead
 * @param {Object} data contains line's start and end points
 * @param {number} zoom zoom level
 * @return {Object} an object contains 3 points.
 */
function getArrowheadPoints(data, zoom) {

  //console.log('getArrowheadPoints(data, zoom): CANVAS_UI.HALO_RADIUS '+CANVAS_UI.HALO_RADIUS+  ' data '+JSON.stringify(data)+' zoom '+zoom );



    let slope = findSlope(data.x1, data.y1, data.x2, data.y2);

    let linkLength = Math.sqrt((data.x2 -= data.x1) * data.x2 + (data.y2 -= data.y1) * data.y2);

    let distanceToArrow = Math.round(linkLength - (CANVAS_UI.HALO_RADIUS * zoom));

    let p2 = findNewPoint(data.x1, data.y1, slope, distanceToArrow);

    //console.log('linkLength '+linkLength+'  p2.x '+p2.x+'  p2.y '+p2.y+'  distanceToArrow '+distanceToArrow);


    //TODO futher refine positioning logic

    let p1Angle = slope + 160;
    let p3Angle = slope - 160;

    let p1 = findNewPoint(p2.x, p2.y, p1Angle, 10);
    let p3 = findNewPoint(p2.x, p2.y, p3Angle, 10);

    let arrowhead = {
        p1,
        p2,
        p3
    };
    //console.log('CanvasUtils.getArrowheadPoints result '+JSON.stringify(arrowhead));

    return arrowhead;

}

/**
 * Get the intersection point of line and halo
 * @param {Object} data contains line's start and end points
 * @param {number} zoom zoom level
 * @return {Object} an object contains x,y points.
 */
function getLinePointOnHalo(data, zoom) {
    let slope = findSlope(data.x1, data.y1, data.x2, data.y2);

    let d = _.clone(data);
    let linkLength = Math.sqrt((d.x2 -= d.x1) * d.x2 + (d.y2 -= d.y1) * d.y2);


    let distanceToHalo = Math.round(linkLength - (CANVAS_UI.HALO_RADIUS * zoom));

    let posHalo = findNewPoint(data.x1, data.y1, slope, distanceToHalo);

    //console.log('CanvasUtils.getLinePointOnHalo '+' CANVAS_UI.HALO_RADIUS '+CANVAS_UI.HALO_RADIUS+' data '+JSON.stringify(data)+' zoom '+zoom + 'posHalo '+JSON.stringify(posHalo));

    return posHalo;
}

/**
 * Converts a string of key-value pairs separated by delimiter into a JSON object
 * @param {String} data string with key-value pairs
 * @param {String} delimiter delimiter char, default: semi-colon
 * @return {Object} JSON object
 */
function convertStyleStringToJSONObject(data, delimiter) {
	let delimiterChar = (delimiter) ? delimiter : ";";
	if (data) {
		var result = {};
		let items = data.split(delimiterChar);
		items.forEach( (item) => {
			let element = item.split(":");
			if (element.length == 2) {
				// ignore any invalid styles
				result[element[0].trim()] = element[1].trim();
			}
		});
		return result;
	} else {
		return {};
	}
}

module.exports = {
    findSlope: findSlope,
    findNewPoint: findNewPoint,
    getArrowheadPoints: getArrowheadPoints,
    getLinePointOnHalo: getLinePointOnHalo,
		convertStyleStringToJSONObject: convertStyleStringToJSONObject
}
