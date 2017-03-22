import React from 'react';
import {expect, assert} from 'chai';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';

import CanvasUtils from '../utils/canvas-utils.js';

const INPUT_ESCAPE = `line1
line2
line3`;

const EXPECTED_RESULT_ESCAPE = 'line1\\nline2\\nline3';

const INPUT_UNESCAPE = 'line1\\nline2\\nline3';

const EXPECTED_RESULT_UNESCAPE = `line1
line2
line3`;

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

    it('escapeNewLineCharachtersForServer test', () => {

        assert.deepEqual(CanvasUtils.escapeNewLineCharachtersForServer(INPUT_ESCAPE), EXPECTED_RESULT_ESCAPE);
    });

    it('unescapeNewLineCharachtersForUI test', () => {

        assert.deepEqual(CanvasUtils.unescapeNewLineCharachtersForUI(INPUT_UNESCAPE), EXPECTED_RESULT_UNESCAPE);
    });

});
