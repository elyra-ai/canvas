/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: "off" */

import log4js from "log4js";
import deepFreeze from "deep-freeze";
import { expect } from "chai";
import isEqual from "lodash/isEqual";
import startPipelineFlow from "../test_resources/json/startPipelineFlow.json";

import ObjectModel from "../../src/object-model/object-model.js";
import FlowValidation from "../../src/flow-validation/validate-flow.js";


const logger = log4js.getLogger("flow-validation-test");
const objectModel = new ObjectModel();

const CONDITIONS_TEST_FORM_DATA = require("../test_resources/json/addcolumn-paramDef.json");
const parameterDef = {};
parameterDef.complex_types = CONDITIONS_TEST_FORM_DATA.complex_types;
parameterDef.current_parameters = CONDITIONS_TEST_FORM_DATA.current_parameters;
parameterDef.dataset_metadata = CONDITIONS_TEST_FORM_DATA.dataset_metadata;
parameterDef.parameters = CONDITIONS_TEST_FORM_DATA.parameters;
parameterDef.resources = CONDITIONS_TEST_FORM_DATA.resources;
parameterDef.uihints = CONDITIONS_TEST_FORM_DATA.uihints;
parameterDef.conditions = CONDITIONS_TEST_FORM_DATA.conditions;

const SAMPLE_TEST_FORM_DATA = require("../test_resources/json/derive-formData.json");
const formData = {};
formData.title = SAMPLE_TEST_FORM_DATA.title;
formData.formData = SAMPLE_TEST_FORM_DATA.formData;
formData.appData = SAMPLE_TEST_FORM_DATA.appData;
formData.additionalComponents = SAMPLE_TEST_FORM_DATA.additionalComponents;

const expectedNode1Messages = [
	{ "text": "The new column name cannot be empty", "type": "error", "id_ref": "colName" },
	{ "text": "The computed column value cannot be empty", "type": "error", "id_ref": "col" }
];
const expectedNode2Messages = [
	{ "text": "Field cannot be default", "type": "error", "id_ref": "formula_measure_type" },
	{ "text": "Annotation is empty when there is a custom name", "type": "warning", "id_ref": "custom_name" },
	{ "text": "Field cannot be empty nor contain \"quotes\"", "type": "error", "id_ref": "annotation" }
];


function getFormData(nodeId) {
	if (nodeId === "idGWRVT47XDV") {
		return { "type": "parameterDef", "data": parameterDef };
	}
	return { "type": "form", "data": formData };
}

function setNodeMessages(nodeId, messages) {
	if (nodeId === "idGWRVT47XDV") {
		// logger.info("expected Node1Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// logger.info("actual Node1Messages  = " + JSON.stringify(actualNode1Messages, null, 4));
		expect(isEqual(expectedNode1Messages, messages)).to.be.true;
	} else {
		// logger.info("expected Node2Messages  = " + JSON.stringify(expectedNode2Messages, null, 4));
		// logger.info("actual Node2Messages  = " + JSON.stringify(actualNode2Messages, null, 4));
		expect(isEqual(expectedNode2Messages, messages)).to.be.true;
	}
}

describe("Flow validation API handle flows OK", () => {

	it("should save a messages for a node", () => {
		logger.info("should save a messages for a node");

		deepFreeze(startPipelineFlow);
		objectModel.setPipelineFlow(startPipelineFlow);
		FlowValidation.validateFlow(objectModel, getFormData, setNodeMessages);


		const actualNode1Messages = objectModel.getNodeMessages("idGWRVT47XDV");
		const actualNode2Messages = objectModel.getNodeMessages("id8I6RH2V91XW");

		// logger.info("expected Node1Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// logger.info("actual Node1Messages  = " + JSON.stringify(actualNode1Messages, null, 4));
		// logger.info("expected Node2Messages  = " + JSON.stringify(expectedNode2Messages, null, 4));
		// logger.info("actual Node2Messages  = " + JSON.stringify(actualNode2Messages, null, 4));

		expect(isEqual(expectedNode1Messages, actualNode1Messages)).to.be.true;
		expect(isEqual(expectedNode2Messages, actualNode2Messages)).to.be.true;

	});


});
