/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import isEqual from "lodash/isEqual";
import { expect } from "chai";
import { HIGHLIGHT_BRANCH, HIGHLIGHT_UPSTREAM, HIGHLIGHT_DOWNSTREAM } from "../../src/common-canvas/constants/canvas-constants.js";

import ObjectModel from "../../src/object-model/object-model.js";
import supernodeNestedCanvas from "../../../harness/test_resources/diagrams/supernodeNestedCanvas.json";

const objectModel = new ObjectModel();

// Pipeline Ids
const primaryPipelineId = supernodeNestedCanvas.primary_pipeline; // 153651d6-9b88-423c-b01b-861f12d01489
const supernode1PipelineId = supernodeNestedCanvas.pipelines[3].id; // c140d854-c2a6-448c-b80d-9c9a0728dede
const supernode2PipelineId = supernodeNestedCanvas.pipelines[2].id; // 8e671b0f-118c-4216-9cea-f522662410ec
const supernode2APipelineId = supernodeNestedCanvas.pipelines[1].id; // babad275-1719-4224-8d65-b04d0804d95c
const supernode2BPipelineId = supernodeNestedCanvas.pipelines[6].id; // f02a9b8e-7275-426a-82cf-08be294d17a3
const supernode2B1PipelineId = supernodeNestedCanvas.pipelines[7].id; // 17dc8485-33fd-4847-a45d-f799d6d0b948
const supernode3PipelineId = supernodeNestedCanvas.pipelines[5].id; // b342ee77-da6e-459d-8d6b-da36549f4422
const supernode3APipelineId = supernodeNestedCanvas.pipelines[4].id; // 1d1e550a-c8bc-4b55-872c-cfd449dacace
const supernode3BPipelineId = supernodeNestedCanvas.pipelines[8].id; // 238d0266-997b-49a4-94b2-acdad3494801

// Primary Pipeline
// Node IDs
const supernode1 = "571c2e64-069a-4269-916a-3130044f0b54";
const executionNode = "idGWRVT47XDV";
const supernode2 = "fb20249f-3f3f-46a2-be68-c4f6273adbcb";
const model = "id125TTEEIK7V";
const bindingExit = "id5KIRGGJ3FYT";
const database = "f5373d9e-677d-4717-a9fd-3b57038ce0de";
const objStore = "8f4e9e77-6132-4fa0-965c-d7edf11169a7";
const supernode3 = "39a382b0-8bd5-4153-b1ff-694defeabada";
const c50node = "353c4878-1db2-46c0-9370-3a55523dc07c";
const neuralNet = "bea1bbb7-ae00-404a-8380-bb65de1047cf";
const histogram = "db077bc8-a697-49ff-9f4c-2777e3cfc64b";
const dataAudit = "4a426871-cba1-41f4-81ae-356c4c616e98";

// Supernode1 subflow nodes
const bindingNode = "id8I6RH2V91XW";
const select = "6f704d84-85be-4520-9d76-57fe2295b310";
const exitBinding1x1 = "44d458dd-083e-4181-b232-d620fff52c7f";

// Supernode2 subflow nodes
const supernode2A = "7015d906-2eae-45c1-999e-fb888ed957e5";
const supernode2B = "3d400861-3f71-49aa-b724-24e3815c6988";
const entryBinding2x1 = "5c2d7ba6-a5dc-48e5-b5aa-ab04a9f2eacf";
const entryBinding2x2 = "9a1ee395-d2c0-49fb-8173-30a15642d43a";
const entryBinding2x3 = "edecb2aa-881b-443d-bf55-2777be8245de";
const exitBinding2x1 = "b763a3b2-df38-441b-94e0-cddecc6dd846";

// Supernode2A subflow nodes
const distribution = "7d1ac5ee-a599-451a-9036-dd2bafb53dd2";
const partition = "7fadc642-9c03-473e-b4c5-308b1e4cbbb8";
const execution = "691e065f-8359-4b46-aad2-531702ef2a8e";
const balance = "ba83fcf4-d7d7-4862-b7c9-f2e611f912df";
const type = "49b5e5e5-ab72-4d8e-babe-9bd5977bc8e2";
const entryBinding2Ax1 = "d585f3c8-29d7-4daf-b808-f80a64634343";
const entryBinding2Ax2 = "b82bb50c-edd4-44b5-9e14-f5db5eedddb8";
const exitBinding2Ax1 = "813ddbfd-cabb-4037-833d-bc839e13e264";

// Supernode2B subflow nodes
const supernode2B1 = "13f10aa2-a40c-416d-b5cc-d7cee6d0bed6";
const multiplot2B1 = "nodeIDMultiPlotPE";
const entryBinding2Bx1 = "6c372f32-52d5-43ad-a5bb-a3706e3090e4";
const exitBinding2Bx1 = "bb3be8e5-41be-47d1-a276-4e29823df7bb";

// Supernode2B-1 subflow nodes
const userInput = "0469fafc-9d6b-4533-a0ee-19bb303c8587";
const analysis = "c893d22b-f510-4a6f-bafb-f154ad2de578";
const featureSelection = "548fb69e-02e9-4136-ab7f-58090044c442";
const entryBindingNode2B1x1 = "ef3012f0-9542-4cb7-a7cc-b0ad7b7913e4";

// Supernode3 subflow nodes
const supernode3A = "b3acb1f8-89a8-4080-9611-2fb03dee3d73";
// const supernode3B = "68dee122-e103-491f-99a7-74345bd1cf5e";
const filter = "ac584be2-8a3c-474f-a046-e10a3665b875";
const sample = "5db667dc-b2a9-4c35-bff0-136c4e7b6d26";
const aggregate = "2807a076-6468-4ad1-94d3-f253f99bc8e0";
const entryBinding3x1 = "06593576-88e5-41e3-b879-74c3861cc34a";
const entryBinding3x2 = "94ec9e77-1566-49a5-bea4-ae33b545b19b";
const entryBinding3x3 = "0d2b2992-2ce6-4d52-a2e3-4722d9da0c7c";
const exitBinding3x1 = "ca6cfbcf-fadd-4023-9234-ff6e74170836";

// Supernode3A subflow nodes
const merge = "fab835e0-29ad-45ae-b72a-2eb3fcce6871";
const table = "a723a31c-6c66-421e-b00a-e4d0b1faa265";
const entryBinding3Ax1 = "e8b836b2-f60c-4fc6-b3c4-fd0c8180f6af";
const exitBinding3Ax1 = "85f47f42-e71b-4a21-ad31-93bfcd3ca9c2";

// Supernode3B subflow nodes
const model3B = "dbf2aef9-dceb-49b5-9012-5c8fd0f75ac9";
// const bindindExitNode2 = "bb68c332-1a98-4da6-aa91-907fb6d51470";
const entryBinding3Bx1 = "d4c2535e-d3ac-4f32-9f0e-a4adfad1c79f";
// const entryBinding3Bx2 = "9e88f684-7758-4e9d-8245-0d0d1d1d1542";

describe("Highlight branch", () => {
	beforeEach(() => {
		objectModel.setPipelineFlow(supernodeNestedCanvas);
	});

	it("should get highlight branch object ids correctly in primary flow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [histogram], HIGHLIGHT_BRANCH);
		const expected = { primaryPipelineId: [objStore, histogram, neuralNet] };
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(2);
	});

	it("should get highlight branch object ids with multiple nodes correctly in primary flow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [histogram, executionNode], HIGHLIGHT_BRANCH);
		const expected = {
			primaryPipelineId: [objStore, histogram, neuralNet, supernode1, executionNode, supernode2, model, bindingExit],
			supernode1PipelineId: [exitBinding1x1, select, bindingNode],
			supernode2PipelineId: [entryBinding2x1, supernode2B, exitBinding2x1],
			supernode2BPipelineId: [entryBinding2Bx1, multiplot2B1, exitBinding2Bx1, supernode2B1],
			supernode2B1PipelineId: [entryBindingNode2B1x1, analysis, featureSelection]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode1PipelineId), JSON.stringify(branchObjects.nodes[supernode1PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2PipelineId), JSON.stringify(branchObjects.nodes[supernode2PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2BPipelineId), JSON.stringify(branchObjects.nodes[supernode2BPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2B1PipelineId), JSON.stringify(branchObjects.nodes[supernode2B1PipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(6);
		expect(branchObjects.links[supernode1PipelineId]).to.have.length(2);
		expect(branchObjects.links[supernode2PipelineId]).to.have.length(2);
		expect(branchObjects.links[supernode2BPipelineId]).to.have.length(3);
		expect(branchObjects.links[supernode2B1PipelineId]).to.have.length(2);
	});

	it("should get highlight branch object ids correctly in subflow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(supernode2B1PipelineId, [userInput], HIGHLIGHT_BRANCH);
		const expected = { supernode2B1PipelineId: [userInput, analysis, featureSelection] };
		expect(isEqual(JSON.stringify(expected.supernode2B1PipelineId), JSON.stringify(branchObjects.nodes[supernode2B1PipelineId]))).to.be.true;
		expect(branchObjects.links[supernode2B1PipelineId]).to.have.length(2);
	});

	it("should get highlight branch object ids from single node", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [dataAudit], HIGHLIGHT_BRANCH);
		const expected = { primaryPipelineId: [dataAudit] };
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(0);
	});

	it("should get highlight branch object ids from supernode node including its subflow objects", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [supernode2], HIGHLIGHT_BRANCH);
		const expected = {
			primaryPipelineId: [executionNode, supernode1, supernode2, model, bindingExit],
			supernode2PipelineId: [supernode2A, entryBinding2x1, entryBinding2x2, entryBinding2x3, exitBinding2x1, supernode2B],
			supernode2APipelineId: [execution, type, partition, distribution, balance, entryBinding2Ax1, entryBinding2Ax2, exitBinding2Ax1],
			supernode2BPipelineId: [multiplot2B1, entryBinding2Bx1, exitBinding2Bx1, supernode2B1],
			supernode2B1PipelineId: [analysis, featureSelection, entryBindingNode2B1x1, userInput]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2PipelineId), JSON.stringify(branchObjects.nodes[supernode2PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2APipelineId), JSON.stringify(branchObjects.nodes[supernode2APipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2BPipelineId), JSON.stringify(branchObjects.nodes[supernode2BPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2B1PipelineId), JSON.stringify(branchObjects.nodes[supernode2B1PipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(6);
		expect(branchObjects.links[supernode2PipelineId]).to.have.length(5);
		expect(branchObjects.links[supernode2APipelineId]).to.have.length(7);
		expect(branchObjects.links[supernode2BPipelineId]).to.have.length(3);
		expect(branchObjects.links[supernode2B1PipelineId]).to.have.length(3);
	});
});

describe("Highlight upstream", () => {
	beforeEach(() => {
		objectModel.setPipelineFlow(supernodeNestedCanvas);
	});

	it("should get highlight upstream object ids correctly in primary flow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [c50node], HIGHLIGHT_UPSTREAM);
		const expected = {
			primaryPipelineId: [supernode3, database, objStore, c50node],
			supernode3PipelineId: [exitBinding3x1, supernode3A, filter, entryBinding3x1, sample, entryBinding3x2, aggregate, entryBinding3x3],
			supernode3APipelineId: [exitBinding3Ax1, table, merge, entryBinding3Ax1]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode3PipelineId), JSON.stringify(branchObjects.nodes[supernode3PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode3APipelineId), JSON.stringify(branchObjects.nodes[supernode3APipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(4);
		expect(branchObjects.links[supernode3PipelineId]).to.have.length(8);
		expect(branchObjects.links[supernode3APipelineId]).to.have.length(3);
	});

	it("should get highlight upstream object ids correctly from subflow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(supernode3BPipelineId, [model3B], HIGHLIGHT_UPSTREAM);
		const expected = {
			supernode3BPipelineId: [entryBinding3Bx1, model3B],
			supernode3PipelineId: [aggregate, entryBinding3x3],
			primaryPipelineId: [objStore]
		};
		expect(isEqual(JSON.stringify(expected.supernode3BPipelineId), JSON.stringify(branchObjects.nodes[supernode3BPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode3PipelineId), JSON.stringify(branchObjects.nodes[supernode3PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(branchObjects.links[supernode3BPipelineId]).to.have.length(1);
		expect(branchObjects.links[supernode3PipelineId]).to.have.length(2);
		expect(branchObjects.links[primaryPipelineId]).to.have.length(1);
	});

	it("should get highlight upstream object ids correctly from supernode within subflow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(supernode2PipelineId, [supernode2A], HIGHLIGHT_UPSTREAM);
		const expected = {
			supernode2PipelineId: [entryBinding2x2, entryBinding2x3, supernode2A],
			primaryPipelineId: [supernode1],
			supernode1PipelineId: [select, bindingNode]
		};
		expect(isEqual(JSON.stringify(expected.supernode2PipelineId), JSON.stringify(branchObjects.nodes[supernode2PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode1PipelineId), JSON.stringify(branchObjects.nodes[supernode1PipelineId]))).to.be.true;
		expect(branchObjects.links[supernode2PipelineId]).to.have.length(2);
		expect(branchObjects.links[primaryPipelineId]).to.have.length(2);
		expect(branchObjects.links[supernode1PipelineId]).to.have.length(2);
	});

	it("should get highlight upstream object ids from single node", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [dataAudit], HIGHLIGHT_UPSTREAM);
		const expected = { primaryPipelineId: [dataAudit] };
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(0);
	});

	it("should get highlight upstream object ids from supernode node", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [supernode1], HIGHLIGHT_UPSTREAM);
		const expected = {
			primaryPipelineId: [supernode1],
			supernode1PipelineId: [bindingNode, select, exitBinding1x1]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode1PipelineId), JSON.stringify(branchObjects.nodes[supernode1PipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(0);
		expect(branchObjects.links[supernode1PipelineId]).to.have.length(3); // Including comment link.
	});
});

describe("Highlight downstream", () => {
	beforeEach(() => {
		objectModel.setPipelineFlow(supernodeNestedCanvas);
	});

	it("should get highlight downstream object ids correctly in primary flow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [database], HIGHLIGHT_DOWNSTREAM);
		const expected = {
			primaryPipelineId: [supernode3, c50node, neuralNet, database],
			supernode3PipelineId: [entryBinding3x1, filter, supernode3A, exitBinding3x1, entryBinding3x2, sample],
			supernode3APipelineId: [entryBinding3Ax1, merge, table, exitBinding3Ax1]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode3PipelineId), JSON.stringify(branchObjects.nodes[supernode3PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode3APipelineId), JSON.stringify(branchObjects.nodes[supernode3APipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(4);
		expect(branchObjects.links[supernode3PipelineId]).to.have.length(6);
		expect(branchObjects.links[supernode3APipelineId]).to.have.length(3);
	});

	it("should get highlight downstream object ids correctly from subflow", () => {
		const branchObjects = objectModel.getHighlightObjectIds(supernode1PipelineId, [select], HIGHLIGHT_DOWNSTREAM);
		const expected = {
			supernode1PipelineId: [exitBinding1x1, select],
			primaryPipelineId: [executionNode, supernode2, model, bindingExit],
			supernode2PipelineId: [entryBinding2x1, supernode2B, exitBinding2x1, supernode2A],
			supernode2BPipelineId: [entryBinding2Bx1, multiplot2B1, exitBinding2Bx1, supernode2B1],
			supernode2B1PipelineId: [entryBindingNode2B1x1, analysis, featureSelection],
			supernode2APipelineId: [entryBinding2Ax1, execution, partition, distribution, exitBinding2Ax1, entryBinding2Ax2, balance, type]
		};
		expect(isEqual(JSON.stringify(expected.supernode1PipelineId), JSON.stringify(branchObjects.nodes[supernode1PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2PipelineId), JSON.stringify(branchObjects.nodes[supernode2PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2BPipelineId), JSON.stringify(branchObjects.nodes[supernode2BPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2B1PipelineId), JSON.stringify(branchObjects.nodes[supernode2B1PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2APipelineId), JSON.stringify(branchObjects.nodes[supernode2APipelineId]))).to.be.true;
		expect(branchObjects.links[supernode1PipelineId]).to.have.length(1);
		expect(branchObjects.links[primaryPipelineId]).to.have.length(6);
		expect(branchObjects.links[supernode2PipelineId]).to.have.length(5);
		expect(branchObjects.links[supernode2BPipelineId]).to.have.length(3);
		expect(branchObjects.links[supernode2B1PipelineId]).to.have.length(2);
		expect(branchObjects.links[supernode2APipelineId]).to.have.length(7);
	});

	it("should get highlight downstream object ids correctly through port", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [executionNode], HIGHLIGHT_DOWNSTREAM);
		const expected = {
			primaryPipelineId: [supernode2, model, bindingExit, executionNode],
			supernode2PipelineId: [entryBinding2x1, supernode2B, exitBinding2x1],
			supernode2BPipelineId: [entryBinding2Bx1, multiplot2B1, exitBinding2Bx1, supernode2B1],
			supernode2B1PipelineId: [entryBindingNode2B1x1, analysis, featureSelection]
		};
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2PipelineId), JSON.stringify(branchObjects.nodes[supernode2PipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2BPipelineId), JSON.stringify(branchObjects.nodes[supernode2BPipelineId]))).to.be.true;
		expect(isEqual(JSON.stringify(expected.supernode2B1PipelineId), JSON.stringify(branchObjects.nodes[supernode2B1PipelineId]))).to.be.true;

		expect(branchObjects.links[primaryPipelineId]).to.have.length(3);
		expect(branchObjects.links[supernode2PipelineId]).to.have.length(2);
		expect(branchObjects.links[supernode2BPipelineId]).to.have.length(3);
		expect(branchObjects.links[supernode2B1PipelineId]).to.have.length(2);
	});

	it("should get highlight downstream object ids from single node", () => {
		const branchObjects = objectModel.getHighlightObjectIds(primaryPipelineId, [dataAudit], HIGHLIGHT_DOWNSTREAM);
		const expected = { primaryPipelineId: [dataAudit] };
		expect(isEqual(JSON.stringify(expected.primaryPipelineId), JSON.stringify(branchObjects.nodes[primaryPipelineId]))).to.be.true;
		expect(branchObjects.links[primaryPipelineId]).to.have.length(0);
	});
});
