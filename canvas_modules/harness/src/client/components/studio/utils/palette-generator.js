/*
 * Copyright 2017-2026 Elyra Authors
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

function slugify(str) {
	return (str || "")
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

function buildPort(port, index) {
	return {
		id: port.portId || `port${index}`,
		app_data: {
			ui_data: {
				label: port.label || `Port ${index}`,
				cardinality: {
					min: Number(port.cardinalityMin) || 0,
					max: Number(port.cardinalityMax) === -1 ? -1 : (Number(port.cardinalityMax) || 1)
				}
			}
		}
	};
}

function buildNodeType(nodeType) {
	return {
		id: nodeType.studioId,
		type: "execution_node",
		op: nodeType.op || nodeType.studioId,
		inputs: (nodeType.inputs || []).map(buildPort),
		outputs: (nodeType.outputs || []).map(buildPort),
		app_data: {
			ui_data: {
				label: nodeType.label || "Node",
				description: nodeType.description || "",
				image: nodeType.image || ""
			}
		}
	};
}

function buildCategory(category) {
	return {
		id: slugify(category.label) || category.studioId,
		label: category.label || "Category",
		description: category.description || "",
		image: category.image || "",
		is_open: Boolean(category.is_open),
		node_types: (category.nodeTypes || []).map(buildNodeType)
	};
}

export default function paletteGenerator(categories) {
	return {
		version: "3.0",
		categories: (categories || []).map(buildCategory)
	};
}
