/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { expect } from "chai";
import { getMetadataFieldMatch } from "./../../../src/common-properties/ui-conditions/conditions-utils.js";

describe("conditions util tests", () => {
	const dataset =	[{
		"name": "Schema-1.Age",
		"type": "integer",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "target"
		},
		"schema": "Schema-1",
		"origName": "Age"
	},
	{
		"name": "Schema-1.BP",
		"type": "string",
		"metadata": {
			"description": "",
			"measure": "range",
			"modeling_role": "input"
		},
		"schema": "Schema-1",
		"origName": "BP"
	}];
	function genParamInfo(value) {
		return { value: value, control: { controlType: "textfield" } };
	}

	it("test getMetadataFieldMatch finds measure", () => {
		const parameter = genParamInfo({ field_name: "Age", link_ref: "Schema-1" });
		const match = getMetadataFieldMatch(parameter, dataset, "measure");
		expect(match).to.equal("range");
	});

	it("test getMetadataFieldMatch finds type", () => {
		const parameter = genParamInfo({ field_name: "BP", link_ref: "Schema-1" });
		const match = getMetadataFieldMatch(parameter, dataset, "type");
		expect(match).to.equal("string");
	});

	it("test getMetadataFieldMatch finds modeling_role", () => {
		const parameter = genParamInfo({ field_name: "BP", link_ref: "Schema-1" });
		const match = getMetadataFieldMatch(parameter, dataset, "modeling_role");
		expect(match).to.equal("input");
	});

	it("test getMetadataFieldMatch finds no match", () => {
		const parameter = genParamInfo({ field_name: "Oxygen", link_ref: "Schema-Oxygen" });
		const match = getMetadataFieldMatch(parameter, dataset, "modeling_role");
		expect(match).to.equal(null);
	});

	it("test getMetadataFieldMatch finds measure match given string paramInfo value", () => {
		const parameter = genParamInfo("Schema-1.BP");
		const match = getMetadataFieldMatch(parameter, dataset, "modeling_role");
		expect(match).to.equal("input");
	});

	it("test getMetadataFieldMatch finds modeling_role match given string paramInfo value", () => {
		const parameter = genParamInfo("Schema-1.Age");
		const match = getMetadataFieldMatch(parameter, dataset, "modeling_role");
		expect(match).to.equal("target");
	});

	it("test getMetadataFieldMatch finds type match given string paramInfo value", () => {
		const parameter = genParamInfo("Schema-1.Age");
		const match = getMetadataFieldMatch(parameter, dataset, "type");
		expect(match).to.equal("integer");
	});

});
