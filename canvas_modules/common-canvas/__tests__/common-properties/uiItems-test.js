/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import EditorForm from "../../src/common-properties/editor-controls/editor-form.jsx";
import { mount } from "enzyme";
import { expect } from "chai";
import sinon from "sinon";

import Controller from "../../src/common-properties/properties-controller";


const formData = {
	"componentId": "uiItems",
	"label": "UIItem Test",
	"editorSize": "large",
	"uiItems": [
		{
			"itemType": "primaryTabs",
			"tabs": [
				{
					"text": "Settings",
					"group": "basic-settings",
					"content": {
						"itemType": "panel",
						"panel": {
							"id": "basic-settings",
							"panelType": "general",
							"uiItems": [
								{
									"itemType": "control",
									"control": {
										"name": "radioset",
										"label": {
											"text": "Mode"
										},
										"description": {
											"text": "Include or discard rows"
										},
										"controlType": "radioset",
										"valueDef": {
											"propType": "string",
											"isList": false,
											"isMap": false,
											"defaultValue": "Include"
										},
										"orientation": "horizontal",
										"values": [
											"Include",
											"Discard"
										],
										"valueLabels": [
											"Include",
											"Discard"
										],
										"separateLabel": true
									}
								},
								{
									"itemType": "staticText",
									"text": "Hint: should have a separator after"
								},
								{
									"itemType": "hSeparator"
								},
								{
									"itemType": "control",
									"control": {
										"name": "textfield",
										"label": {
											"text": "Simple text"
										},
										"description": {
											"text": "Testing of uiItems"
										},
										"controlType": "textfield",
										"valueDef": {
											"propType": "string",
											"isList": false,
											"isMap": false,
											"defaultValue": ""
										},
										"separateLabel": true
									}
								},
								{
									"itemType": "staticText",
									"text": "Hint: should have a separator after"
								},
								{
									"itemType": "hSeparator"
								},
								{
									"itemType": "control",
									"control": {
										"name": "numberfield",
										"label": {
											"text": "Number"
										},
										"description": {
											"text": "Testing of uiItems"
										},
										"controlType": "numberfield",
										"valueDef": {
											"propType": "integer",
											"isList": false,
											"isMap": false
										},
										"separateLabel": true
									}
								}
							]
						}
					}
				}
			]
		}
	],
	"buttons": [
		{
			"id": "ok",
			"text": "OK",
			"isPrimary": true,
			"url": ""
		},
		{
			"id": "cancel",
			"text": "Cancel",
			"isPrimary": false,
			"url": ""
		}
	],
	"data": {
		"currentParameters": {}
	}
};
const showPropertiesButtons = sinon.spy();
var controller;
function createEditorForm() {
	controller = new Controller();
	controller.setForm(formData);
	const editorForm = (<EditorForm
		ref="editorForm"
		key="editor-form-key"
		controller={controller}
		showPropertiesButtons={showPropertiesButtons}
	/>);
	return mount(editorForm);
}

describe("editor-form renders correctly with correct uiItems", () => {
	const wrapper = createEditorForm();
	it("should have displayed correct number of staticText elements", () => {
		const staticText = wrapper.find(".static-text");
		expect(staticText).to.have.length(2);
	});
	it("should have displayed correct number of separator elements", () => {
		const separators = wrapper.find(".h-separator");
		expect(separators).to.have.length(2);
	});
});
