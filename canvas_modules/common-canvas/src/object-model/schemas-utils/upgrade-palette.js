/*
 * Copyright 2017-2023 Elyra Authors
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

import { cloneDeep } from "lodash";

// Globals -------------------------------------------------------------------->

// The lowest version accepted
const FIRST_PALETTE_VERSION = 1;

// The latest palette version - update as new versions are developed
const LATEST_PALETTE_VERSION = 3;

// Array of major version upgrade functions
const updateFuncs = [
	_update0to1,
	_update1to2,
	_update2to3
];

// Private Methods ------------------------------------------------------------>

/**
 * Extracts the version from the given palette.
 *
 * @param {Object} palette: A palette JSON object
 *
 * @return {integer} An integer version number
 *
 * @throws {Error} If the version number cannot be extracted
 */
function _extractPaletteVersion(palette) {
	let baseVersion;
	// Validate the incoming palette
	if (!palette) {
		throw new Error("Invalid palette document");

	// Neither version 1 did not have a version number
	} else if (!palette.version) {
		baseVersion = 1;

	} else if (!(typeof palette.version === "string") ||
							palette.version.length === 0) {
		throw new Error("Invalid palette document: The 'version' attribute is missing or invalid");
	} else {
		baseVersion = parseInt(palette.version, 10);
		if (!baseVersion) {
			throw new Error("Invalid palette document: The 'version' attribute cannot be parsed");
		}
	}
	return baseVersion;
}

// Version 1 methods ------------------------>

/**
 * Updates version 0 to version 1. This is done by
 * CanvasInHandler.convertPaletteToPipelineFlowPalette() so there is
 * nothing to do here. This method should never be called so it is only
 * here for consistency with upgrade-flow.js.
 *
 * @param {object} palette: A palette JSON object
 *
 * @return A palette object that has been upgraded to version 1
 */
function _update0to1(palette) {
	return palette;
}

// Version 2 methods ------------------------>

/**
 * Updates version 1 to version 2.
 *
 * @param {object} palette: A palette JSON object
 *
 * @return A palette object that has been upgraded to version 2
 */
function _update1to2(palette) {
	const newPalette = Object.assign({}, { version: "2.0" }, palette);

	return newPalette;
}

// Version 3 methods ------------------------>


/**
 * Updates version 2 to version 3.
 *
 * @param {object} palette: A palette JSON object
 *
 * @return A palette object that has been upgraded to version 3
 */
function _update2to3(palette) {
	palette.version = "3.0";
	for (const category of palette.categories) {
		category.id = category.category;
		delete category.category;
		// Category fields: label, image and description, all
		// remain the same, if present.
		category.node_types = [];
		for (let idx = 0; idx < category.nodetypes.length; idx++) {
			const oldNode = category.nodetypes[idx];
			const node = {};
			node.id = "";
			node.type = oldNode.type;
			if (oldNode.type === "execution_node" ||
					oldNode.type === "binding") {
				node.op = oldNode.operator_id_ref;
			} else if (oldNode.type === "super_node") {
				if (oldNode.open_with_tool) {
					node.open_with_tool = oldNode.open_with_tool;
				}
				node.subflow_ref = { "pipeline_id_ref": oldNode.subDiagramId };
			}
			if (oldNode.input_ports && oldNode.input_ports.length > 0) {
				node.inputs = _readPorts(oldNode.input_ports);
			}
			if (oldNode.output_ports && oldNode.output_ports.length > 0) {
				node.outputs = _readPorts(oldNode.output_ports);
			}
			node.parameters = {};
			node.app_data = {};
			node.app_data.ui_data = {};
			node.app_data.ui_data.label = oldNode.label;
			node.app_data.ui_data.description = oldNode.description;
			node.app_data.ui_data.image = oldNode.image;
			node.app_data.ui_data.x_pos = 0;
			node.app_data.ui_data.y_pos = 0;
			category.node_types.push(node);
		}
		delete category.nodetypes;
	}
	return palette;
}

function _readPorts(portsArray) {
	const retArray = [];
	for (const port of portsArray) {
		const newPort = {};
		newPort.id = port.id;
		newPort.app_data = {};
		newPort.app_data.ui_data = {};
		if (port.cardinality) {
			newPort.app_data.ui_data.cardinality = port.cardinality;
		}
		newPort.app_data.ui_data.label = port.label;
		retArray.push(newPort);
	}
	return retArray;
}

// Public Methods ------------------------------------------------------------->

/**
 * Upgrades the given palette object to the current version.
 *
 * @param {Object} palette: A palette JSON object
 *
 * @returns A palette object that has been upgraded to the latest version
 */
function upgradePalette(palette) {
	const baseVersion = Math.max(_extractPaletteVersion(palette), FIRST_PALETTE_VERSION);
	let pal = cloneDeep(palette);
	for (let idx = baseVersion; idx < LATEST_PALETTE_VERSION; idx++) {
		pal = updateFuncs[idx](pal);
	}
	return pal;
}


export {
	upgradePalette,
	_extractPaletteVersion as extractPaletteVersion,
	LATEST_PALETTE_VERSION
};
