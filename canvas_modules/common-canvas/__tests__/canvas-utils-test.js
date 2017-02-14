import React from 'react';
import {expect, assert} from 'chai';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import CanvasUtils from '../utils/canvas-utils.js';

describe('CanvasUtils.js', () => {

    it('CanvasUtils.getArrowheadPoints test', () => {
        const dataParam = {
            "x1": 655,
            "y1": 105,
            "x2": 960,
            "y2": 300
        };
        const zoomParam = 1.25;
        const expectedArrowheadPoints = {
            "p1": {
                "x": 909,
                "y": 272
            },
            "p2": {
                "x": 919,
                "y": 274
            },
            "p3": {
                "x": 913,
                "y": 266
            }
        };
        assert.deepEqual(CanvasUtils.getArrowheadPoints(dataParam, zoomParam), expectedArrowheadPoints);
    });

    it('CanvasUtils.getLinePointOnHalo test', () => {
        const dataParam = {
            "x1": 655,
            "y1": 105,
            "x2": 960,
            "y2": 300
        };
        const zoomParam = 1.25;
        const expectedPosHalo = {
            "x": 919,
            "y": 274
        };
        assert.deepEqual(CanvasUtils.getLinePointOnHalo(dataParam, zoomParam), expectedPosHalo);
    });

});
