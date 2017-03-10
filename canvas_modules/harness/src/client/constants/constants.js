/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

// Private Methods ------------------------------------------------------------>

function _defineConstant(name, value) {
	Object.defineProperty(module.exports, name, {
		value: value,
		enumerable: true,
		writable: false
	});
}

// Public Methods ------------------------------------------------------------->
_defineConstant("CONSOLE", {
	MINIMIZED: "0px",
	MAXIMIXED: "200px"
});

_defineConstant("CURVE", "curve");
_defineConstant("ELBOW", "elbow");
_defineConstant("STRAIGHT", "straight");

_defineConstant("SIDE_PANEL", {
	MINIMIZED: "0px",
	MAXIMIXED: "200px"
});
_defineConstant("SIDE_PANEL_CANVAS", "sidepanel-canvas");
_defineConstant("SIDE_PANEL_STYLES", "sidepanel-styles");
_defineConstant("SIDE_PANEL_MODAL", "sidepanel-modal");

_defineConstant("NONE", "none");
_defineConstant("HORIZONTAL", "horizontal");
_defineConstant("VERTICAL", "vertical");

_defineConstant("BLANK_CANVAS", {
	"id": "abc651d6-9b88-423c-b01b-861f12d01489",
	"className": "canvas-image",
	"style": "",
	"zoom": 100,
	"objectData": {
		"label": "learning",
		"description": "",
		"created": 1481766985496,
		"updated": 1481766986599
	},
	"userData": {
		"typeId": "stream"
	},
	"diagram": {
		"id": "abc651d6-9b88-423c-b01b-861f12d01489",
		"nodes": [],
		"comments": [],
		"links": []
	},
	"parents": [{
		"id": "abc651d6-9b88-423c-b01b-861f12d01489",
		"label": "druglearn"
	}]
});

_defineConstant("PALETTE_TOOLTIP", "Click to show node palette");

_defineConstant("PROPERTIESINFO", {
	"title": {
		"key": null,
		"ref": null,
		"props": {
			"id": "dialog.nodePropertiesTitle",
			"tagName": "span",
			"values": {}
		},
		"_owner": null,
		"_store": {}
	},
	"formData": {
		"componentId": "variablefile",
		"label": "Var. File",
		"editorSize": "large",
		"uiItems": [{
			"itemType": "primaryTabs",
			"tabs": [{
				"text": "Settings",
				"group": "basic-settings",
				"content": {
					"itemType": "panel",
					"panel": {
						"id": "basic-settings",
						"panelType": "general",
						"uiItems": [{
							"itemType": "control",
							"control": {
								"name": "full_filename",
								"label": {
									"text": "File"
								},
								"separateLabel": true,
								"controlType": "textfield",
								"valueDef": {
									"propType": "string",
									"isList": false,
									"isMap": false
								}
							}
						}, {
							"itemType": "control",
							"control": {
								"name": "read_field_names",
								"label": {
									"text": "Read field names from file"
								},
								"separateLabel": false,
								"controlType": "checkbox",
								"valueDef": {
									"propType": "boolean",
									"isList": false,
									"isMap": false
								}
							}
						}]
					}
				}
			}, {
				"text": "Annotations",
				"group": "annotations",
				"content": {
					"itemType": "panel",
					"panel": {
						"id": "annotations",
						"panelType": "general",
						"uiItems": [{
							"itemType": "control",
							"control": {
								"name": "use_custom_name",
								"label": {
									"text": "Custom name"
								},
								"separateLabel": false,
								"controlType": "checkbox",
								"valueDef": {
									"propType": "boolean",
									"isList": false,
									"isMap": false
								}
							}
						}, {
							"itemType": "control",
							"control": {
								"name": "custom_name",
								"label": {
									"text": ""
								},
								"separateLabel": true,
								"controlType": "textfield",
								"valueDef": {
									"propType": "string",
									"isList": false,
									"isMap": false
								}
							}
						}, {
							"itemType": "control",
							"control": {
								"name": "annotation",
								"label": {
									"text": "Annotation"
								},
								"separateLabel": true,
								"controlType": "textarea",
								"valueDef": {
									"propType": "string",
									"isList": false,
									"isMap": false
								}
							}
						}]
					}
				}
			}]
		}],
		"buttons": [{
			"id": "ok",
			"text": "OK",
			"isPrimary": true,
			"url": ""
		}, {
			"id": "cancel",
			"text": "Cancel",
			"isPrimary": false,
			"url": ""
		}],
		"data": {
			"currentProperties": {
				"annotation": [
					""
				],
				"read_field_names": [
					"true"
				],
				"use_custom_name": [
					"false"
				],
				"full_filename": [
					""
				],
				"custom_name": [
					""
				]
			},
			"inputDataModel": {
				"columns": []
			}
		}
	},
	"appData": {
		"nodeId": "id2JXT5LW4FC3",
		"updateUrl": "streams/1/diagrams/2/nodes/idGWRVT47XDV"
	},
	"additionalComponents": null
});
