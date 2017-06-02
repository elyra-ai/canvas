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


import log4js from "log4js";
import deepFreeze from "deep-freeze";
import { expect } from "chai";
import _ from "underscore";
import initialCanvas from "./test_resources/json/startCanvas.json";
import paletteJson from "../../harness/test_resources/palettes/modelerPalette.json";
import filterNode from "./test_resources/json/filterNode.json";
import horizontalLayoutCanvas from "./test_resources/json/horizontalLayoutCanvas.json";
import verticalLayoutCanvas from "./test_resources/json/verticalLayoutCanvas.json";
import addNodeHorizontalLayoutCanvas from "./test_resources/json/addNodeHorizontalLayoutCanvas.json";
import addNodeVerticalLayoutCanvas from "./test_resources/json/addNodeVerticalLayoutCanvas.json";
import moveVarNode from "./test_resources/json/moveVarNode.json";
import moveNodeHorizontalLayoutCanvas from "./test_resources/json/moveNodeHorizontalLayoutCanvas.json";
import moveNodeVerticalLayoutCanvas from "./test_resources/json/moveNodeVerticalLayoutCanvas.json";


import ObjectModel from "../src/object-model/object-model.js";
import { NONE, VERTICAL, HORIZONTAL } from "../constants/common-constants.js";

const logger = log4js.getLogger("object-model-test");

describe("ObjectModel API handle model OK", () => {

	it("should layout a canvas horiziontally", () => {
		logger.info("should layout a canvas horiziontally");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.fixedAutoLayout(HORIZONTAL);
		ObjectModel.setPaletteData(paletteJson);
		ObjectModel.createNode(filterNode);

		const expectedCanvas = addNodeHorizontalLayoutCanvas;
		const actualCanvas = ObjectModel.getCanvas();

		delete actualCanvas.diagram.nodes[3].id;

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should layout a canvas vertically", () => {
		logger.info("should layout a canvas vertically");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.fixedAutoLayout(VERTICAL);
		ObjectModel.setPaletteData(paletteJson);
		ObjectModel.createNode(filterNode);

		const expectedCanvas = addNodeVerticalLayoutCanvas;
		const actualCanvas = ObjectModel.getCanvas();

		delete actualCanvas.diagram.nodes[3].id;

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should oneTimeLayout a canvas horiziontally", () => {
		logger.info("should oneTimeLayout a canvas horiziontally");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.autoLayout(HORIZONTAL);

		const expectedCanvas = horizontalLayoutCanvas;

		const actualCanvas = ObjectModel.getCanvas();

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;

	});

	it("should oneTimeLayout a canvas vertically", () => {
		logger.info("should oneTimeLayout a canvas vertically");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.autoLayout(VERTICAL);

		const expectedCanvas = verticalLayoutCanvas;

		const actualCanvas = ObjectModel.getCanvas();

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout horiziontally", () => {
		logger.info("should move a node after oneTimeLayout horiziontally");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.fixedLayout = NONE;
		ObjectModel.autoLayout(HORIZONTAL);

		ObjectModel.moveObjects(moveVarNode);

		const expectedCanvas = moveNodeHorizontalLayoutCanvas;
		const actualCanvas = ObjectModel.getCanvas();

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

	it("should move a node after oneTimeLayout vertically", () => {
		logger.info("should move a node after oneTimeLayout vertically");

		const startCanvas = initialCanvas;

		deepFreeze(startCanvas);

		ObjectModel.setCanvas(startCanvas);
		ObjectModel.autoLayout(VERTICAL);

		ObjectModel.moveObjects(moveVarNode);

		const expectedCanvas = moveNodeVerticalLayoutCanvas;
		const actualCanvas = ObjectModel.getCanvas();

		expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
	});

});
