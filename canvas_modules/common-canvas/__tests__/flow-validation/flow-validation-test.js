/*
 * Copyright 2017-2025 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import deepFreeze from "deep-freeze";
import { expect } from "chai";
import sinon from "sinon";
import isEqual from "lodash/isEqual";
import flowValidationPipeline from "../test_resources/flow-validation/pipeline.json";
import subFlowValidationPipeline from "../test_resources/flow-validation/subFlowPipeline.json";
import flowValidationNoMsgsPipeline from "../test_resources/flow-validation/noMsgsPipeline.json";
import CanvasController from "../../src/common-canvas/canvas-controller.js";
import * as FlowValidation from "../../src/flow-validation/validate-flow.js";

const canvasController = new CanvasController();
const NodeIds = {
	FORM: "formNode",
	PARAMDEF: "paramDefNode",
	TABLEDEF: "tableParamDefNode",
	NOMSG0: "paramDefNodeNoMsgs0",
	NOMSG1: "paramDefNodeNoMsgs1",
	NOMSG2: "paramDefNodeNoMsgs2"
};

const FLOW_VALIDATION_DEFAULT_DEF = require("../test_resources/flow-validation/node_defaultData.json");
const FLOW_VALIDATION_FORM_DEF = require("../test_resources/flow-validation/node_formData.json");
const FLOW_VALIDATION_PARAM_DEF = require("../test_resources/flow-validation/node_paramDef.json");
const FLOW_VALIDATION_TABLE_PARAM_DEF = require("../test_resources/flow-validation/node_table_paramDef.json");
const FLOW_VALIDATION_RECORD_DEF = require("../test_resources/flow-validation/spark.AddColumn_paramDef.json");
const FLOW_VALIDATION_MODEL_DEF = require("../test_resources/flow-validation/spark.GBTClassifier_paramDef.json");

const expectedNode1Messages = [
	{ "text": "The new column name cannot be empty", "type": "error", "validation_id": "colName1", "id_ref": "colName" },
	{ "text": "The computed column value cannot be empty", "type": "error", "validation_id": "col", "id_ref": "col" }
];
const expectedNode2Messages = [
	{ "text": "Field cannot be default", "type": "error", "validation_id": "formula_measure_type", "id_ref": "formula_measure_type" },
	{ "text": "Annotation is empty when there is a custom name", "type": "warning", "validation_id": "custom_name_test_2", "id_ref": "custom_name" },
	{ "text": "Field cannot be empty nor contain \"quotes\"", "type": "error", "validation_id": "annotation", "id_ref": "annotation" }
];
// In the last error message below, react intl message parameter substitution does not work in Jest.  THat is why the message has '{label}'.
const expectedNode3Messages = [
	{ "id_ref": "inlineEditingTableWarning", "validation_id": "tablewarningtest1", "type": "warning", "text": "table cannot be empty" },
	{ "id_ref": "inlineEditingTableError", "validation_id": "tableerrortest3", "type": "error", "text": "There are {errorMsgCount} error cells. " },
	{ "id_ref": "inlineEditingTableError2", "validation_id": "tableerror2test2", "type": "error", "text": "expression contains help" },
	{ "id_ref": "structuretableErrors", "validation_id": "structuretableErrors", "type": "error", "text": "order cannot be descending" },
	{ "id_ref": "fields_error", "validation_id": "required_fields_error_501.6009623394123", "type": "error", "text": "You must enter a value for {label}." }
];
const expectedFlowMessages = {
	"formNode": expectedNode2Messages,
	"paramDefNode": expectedNode1Messages,
	"tableParamDefNode": expectedNode3Messages
};

function getFormData(nodeId) {
	let returnData;
	switch (nodeId) {
	case NodeIds.FORM:
		returnData = { "type": "form", "data": FLOW_VALIDATION_FORM_DEF };
		break;
	case NodeIds.PARAMDEF:
		returnData = { "type": "parameterDef", "data": FLOW_VALIDATION_PARAM_DEF };
		break;
	case NodeIds.TABLEDEF:
		returnData = { "type": "parameterDef", "data": FLOW_VALIDATION_TABLE_PARAM_DEF };
		break;
	case NodeIds.NOMSG0:
		returnData = { "type": "parameterDef", "data": FLOW_VALIDATION_RECORD_DEF };
		break;
	case NodeIds.NOMSG1:
		returnData = { "type": "parameterDef", "data": FLOW_VALIDATION_MODEL_DEF };
		break;
	default:
		returnData = { "type": "parameterDef", "data": FLOW_VALIDATION_DEFAULT_DEF };
	}
	return returnData;
}

function setNodeMessages(nodeId, messages) {
	// console.log("actual setnodeMessages for " + nodeId + " = " + JSON.stringify(messages, null, 2));
	switch (nodeId) {
	case NodeIds.FORM:
		expect(isEqual(expectedNode2Messages, messages)).to.be.true;
		break;
	case NodeIds.PARAMDEF:
		expect(isEqual(expectedNode1Messages, messages)).to.be.true;
		break;
	case NodeIds.TABLEDEF:
		expect(isEqual(expectedNode3Messages, messages)).to.be.true;
		break;
	case NodeIds.NOMSG0:
		expect(isEqual([], messages)).to.be.true;
		break;
	case NodeIds.NOMSG1:
		expect(isEqual([], messages)).to.be.true;
		break;
	default:
		expect(false).to.be.true;
	}
}

describe("Flow validation API handle flows OK", () => {
	deepFreeze(flowValidationPipeline);
	canvasController.setPipelineFlow(flowValidationPipeline);
	FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);

	it("should generate errors for node with form data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.FORM);
		// console.log("expected Node2Messages  = " + JSON.stringify(expectedNode2Messages, null, 4));
		// console.log("actual NodeMessages  = " + JSON.stringify(actualNodeMessages, null, 4));
		expect(isEqual(expectedNode2Messages, actualNodeMessages)).to.be.true;

	});

	it("should generate errors for node with parameterDef data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.PARAMDEF);
		// console.log("expected Node1Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// console.log("actual NodeMessages  = " + JSON.stringify(actualNode1Messages, null, 4));
		expect(isEqual(expectedNode1Messages, actualNodeMessages)).to.be.true;

	});

	it("should generate errors for node with complex table data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.TABLEDEF);
		// console.log("expected Node3Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// console.log("actual Node1Messages  = " + JSON.stringify(actualNodeMessages, null, 4));
		expect(isEqual(expectedNode3Messages, actualNodeMessages)).to.be.true;
	});

	it("should be able to get all messages for all nodes", () => {
		const actualFlowMessages = canvasController.getFlowMessages();
		// console.log("expected flowMessages  = " + JSON.stringify(expectedFlowMessages, null, 4));
		// console.log("actual flowMessages  = " + JSON.stringify(actualFlowMessages, null, 4));
		expect(isEqual(expectedFlowMessages, actualFlowMessages)).to.be.true;
	});
});

describe("Flow validation API handle subFlows OK", () => {
	deepFreeze(subFlowValidationPipeline);
	canvasController.setPipelineFlow(subFlowValidationPipeline);
	FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);

	it("should generate errors for node with form data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.FORM);
		// console.log("expected Node2Messages  = " + JSON.stringify(expectedNode2Messages, null, 4));
		// console.log("actual NodeMessages  = " + JSON.stringify(actualNodeMessages, null, 4));
		expect(isEqual(expectedNode2Messages, actualNodeMessages)).to.be.true;

	});

	it("should generate errors for node with parameterDef data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.PARAMDEF);
		// console.log("expected Node1Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// console.log("actual NodeMessages  = " + JSON.stringify(actualNode1Messages, null, 4));
		expect(isEqual(expectedNode1Messages, actualNodeMessages)).to.be.true;

	});

	it("should generate errors for node with complex table data", () => {
		const actualNodeMessages = canvasController.getNodeMessages(NodeIds.TABLEDEF);
		// console.log("expected Node3Messages  = " + JSON.stringify(expectedNode1Messages, null, 4));
		// console.log("actual Node1Messages  = " + JSON.stringify(actualNodeMessages, null, 4));
		expect(isEqual(expectedNode3Messages, actualNodeMessages)).to.be.true;
	});

	it("should be able to get all messages for all nodes", () => {
		const actualFlowMessages = canvasController.getFlowMessages();
		// console.log("expected flowMessages  = " + JSON.stringify(expectedFlowMessages, null, 4));
		// console.log("actual flowMessages  = " + JSON.stringify(actualFlowMessages, null, 4));
		expect(isEqual(expectedFlowMessages, actualFlowMessages)).to.be.true;
	});
});


describe("Flow validation API performance test", () => {

	it("when messages are already set, validateFlow should not call setNodeMessages callback", () => {
		// call validateFlow two times with same CanvasController, the second time it should not
		// invoke the callback.
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		// first time validate should save all error messages
		FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);
		const actualFlowMessages = canvasController.getFlowMessages();
		expect(isEqual(expectedFlowMessages, actualFlowMessages)).to.be.true;
		// the next validateFlow should not invoke callback because the node messages are
		// already set in the object model
		const setNodeMessagesCount = sinon.spy();
		FlowValidation.validateFlow(canvasController, getFormData, setNodeMessagesCount);
		expect(setNodeMessagesCount).to.have.property("callCount", 0);
	});
});

describe("Flow validation API returns correct boolean value", () => {

	it("should return false when messges are found and not filtering.", () => {
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);
		expect(validFlow).to.be.not.true;
	});

	it("should return false when filtering for error types", () => {
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages, ["error"]);
		expect(validFlow).to.be.not.true;
	});

	it("should return false when filtering for warning types", () => {
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages, ["warning"]);
		expect(validFlow).to.be.not.true;
	});

	it("should return false when filtering for error and warning types", () => {
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages, ["error", "warning"]);
		expect(validFlow).to.be.not.true;
	});

	it("should return true when filtering for not found types", () => {
		deepFreeze(flowValidationPipeline);
		canvasController.setPipelineFlow(flowValidationPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages, ["madeup"]);
		expect(validFlow).to.be.true;
	});
});

describe("isFlowValid API returns correct boolean value", () => {
	deepFreeze(flowValidationPipeline);
	canvasController.setPipelineFlow(flowValidationPipeline);
	FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);

	it("should return false when messges are found and not filtering.", () => {
		expect(canvasController.isFlowValid()).to.be.not.true;
	});

	it("should return false when filtering for error types", () => {
		expect(canvasController.isFlowValid(["error"])).to.be.not.true;
	});

	it("should return false when filtering for warning types", () => {
		expect(canvasController.isFlowValid(["warning"])).to.be.not.true;
	});

	it("should return false when filtering for error and warning types", () => {
		expect(canvasController.isFlowValid(["error", "warning"])).to.be.not.true;
	});

	it("should return true when filtering for not found types", () => {
		expect(canvasController.isFlowValid(["madeup"])).to.be.true;
	});
});


describe("API returns correct value when validation flow has no errors", () => {

	it("validateFlow should return true.", () => {
		deepFreeze(flowValidationNoMsgsPipeline);
		canvasController.setPipelineFlow(flowValidationNoMsgsPipeline);
		const validFlow = FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);
		expect(validFlow).to.be.true;
	});

	it("isValidFlow API should return true.", () => {
		deepFreeze(flowValidationNoMsgsPipeline);
		canvasController.setPipelineFlow(flowValidationNoMsgsPipeline);
		FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);
		expect(canvasController.isFlowValid()).to.be.true;
	});

	it("getFlowMessages() should return no messages", () => {
		deepFreeze(flowValidationNoMsgsPipeline);
		canvasController.setPipelineFlow(flowValidationNoMsgsPipeline);
		FlowValidation.validateFlow(canvasController, getFormData, setNodeMessages);
		const actualFlowMessages = canvasController.getFlowMessages();
		const noFlowMessages = {};
		// console.log("expected flowMessages  = " + JSON.stringify(expectedFlowMessages, null, 4));
		// console.log("actual flowMessages  = " + JSON.stringify(actualFlowMessages, null, 4));
		expect(isEqual(noFlowMessages, actualFlowMessages)).to.be.true;
	});
});
