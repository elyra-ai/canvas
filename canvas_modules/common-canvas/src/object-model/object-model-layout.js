/*
 * Copyright 2026 Elyra Authors
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

import LayoutELK from "./object-model-layout-elk.js";
import LayoutDagre from "./object-model-layout-dagre.js";
import { LAYOUT_LIBRARY_ELK } from "../common-canvas/constants/canvas-constants.js";

export default class Layout {

	/**
	 * Performs auto-layout using the specified library (ELK or Dagre)
	 * @param {Object} canvasInfoPipeline - The pipeline containing nodes and links
	 * @param {Object} canvasLayout - Canvas layout configuration
	 * @param {Object} canvasConfig - Canvas configuration
	 * @param {string} layoutDirection - Layout direction (VERTICAL or HORIZONTAL)
	 * @returns {Promise<Object>} Object containing movedNodesInfo and movedLinksInfo
	 */
	static async performLayout(canvasInfoPipeline, canvasLayout, canvasConfig, layoutDirection) {
		const layoutLibrary = canvasConfig.enableLayoutLibrary;

		if (layoutLibrary === LAYOUT_LIBRARY_ELK) {
			return LayoutELK.performLayout(canvasInfoPipeline, canvasLayout, canvasConfig, layoutDirection);
		}
		return LayoutDagre.performLayout(canvasInfoPipeline, canvasLayout, canvasConfig, layoutDirection);
	}
}

// Made with Bob
