import React from 'react';
import {expect, assert} from 'chai';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import CanvasUtils from '../utils/canvas-utils.js';

describe('CanvasUtils.js', () => {

  it('CanvasUtils.getArrowheadPoints test', () => {
        const dataParam = {
          "x1":662,
          "y1":141,
          "x2":876,
          "y2":385
        };
        const zoomParam = 1.3;
        const expectedArrowheadPoints = {
          "p1":{"x":828,"y":336},
          "p2":{"x":837,"y":341},
          "p3":{"x":833,"y":332}
        };
        const result = CanvasUtils.getArrowheadPoints(dataParam, zoomParam);
        //console.log('data x '+JSON.stringify(result));
        assert.deepEqual(result, expectedArrowheadPoints);
    });



    it('CanvasUtils.getLinePointOnHalo test', () => {
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
