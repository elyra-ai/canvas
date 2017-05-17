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

import {assert} from 'chai';
import CanvasUtils from '../utils/canvas-utils.js';

describe('canvas-utils.js', () => {

    it('getArrowheadPoints test', () => {
        const dataParam = {
            "x1": 662,
            "y1": 141,
            "x2": 876,
            "y2": 385
        };
        const zoomParam = 1.3;
        const expectedArrowheadPoints = {
            "p1": {
                "x": 828,
                "y": 336
            },
            "p2": {
                "x": 837,
                "y": 341
            },
            "p3": {
                "x": 833,
                "y": 332
            }
        };
        const result = CanvasUtils.getArrowheadPoints(dataParam, zoomParam);
        //console.log('data x '+JSON.stringify(result));
        assert.deepEqual(result, expectedArrowheadPoints);
    });

    it('getLinePointOnHalo test', () => {
        const dataParam = {
            "x1": 683,
            "y1": 172,
            "x2": 902,
            "y2": 341
        };
        const zoomParam = 1.3;
        const expectedPosHalo = {
            "x": 856,
            "y": 305
        };
        assert.deepEqual(CanvasUtils.getLinePointOnHalo(dataParam, zoomParam), expectedPosHalo);
    });
});
