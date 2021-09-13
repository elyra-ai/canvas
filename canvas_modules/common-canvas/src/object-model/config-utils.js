/*
 * Copyright 2021 Elyra Authors
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

// This class contains utility functions that may be used for working with
// the canvas config object.

import { isMatch } from "lodash";
import LayoutDimensions from "./layout-dimensions.js";
import { ASSOC_STRAIGHT, LINK_SELECTION_NONE } from "../common-canvas/constants/canvas-constants";

export default class CanvasUtils {

	// Returns a config object which is the result of merging config into
	// startConfig.
	static mergeCanvasConfigs(startConfig, config) {
		let newConfig = Object.assign({}, startConfig, config);

		const newLayout = LayoutDimensions.getLayout(newConfig,
			{ nodeLayout: config.enableNodeLayout, canvasLayout: config.enableCanvasLayout });
		const newTipConfig = Object.assign({}, startConfig.tipConfig, config.tipConfig);

		newConfig = Object.assign({}, newConfig, {
			enableNodeLayout: newLayout.nodeLayout,
			enableCanvasLayout: newLayout.canvasLayout,
			tipConfig: newTipConfig
		});

		return newConfig;
	}

	// Returns the set of default config values.
	static getDefaultCanvasConfig() {
		const config = {
			// Do not initialize paletteInitialState here. It needs to be undefined
			// for openPaletteIfNecessary to work.
			// TODO Remove this when paletteInitialState is removed from common-canvas.
			// paletteInitialState: false,
			enableInteractionType: "Mouse",
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Curve",
			enableLinkDirection: "LeftRight",
			enableLinkSelection: LINK_SELECTION_NONE,
			enableLinkReplaceOnNewConnection: false,
			enableAssocLinkCreation: false,
			enableAssocLinkType: ASSOC_STRAIGHT,
			enableDragWithoutSelect: false,
			enableInternalObjectModel: true,
			enablePaletteLayout: "Flyout",
			enableToolbarLayout: "Top",
			enableInsertNodeDroppedOnLink: false,
			enableHighlightNodeOnNewLinkDrag: false,
			enableHighlightUnavailableNodes: false,
			enableMoveNodesOnSupernodeResize: true,
			enableExternalPipelineFlows: true,
			enableDisplayFullLabelOnHover: false,
			enableDropZoneOnExternalDrag: false,
			enableRightFlyoutUnderToolbar: false,
			enablePanIntoViewOnOpen: false,
			enableZoomIntoSubFlows: false,
			enableBrowserEditMenu: true,
			enableAutoLinkOnlyFromSelNodes: false,
			enableSaveZoom: "None",
			enableSnapToGridType: "None",
			enableSnapToGridX: null,
			enableSnapToGridY: null,
			enableAutoLayoutVerticalSpacing: null,
			enableAutoLayoutHorizontalSpacing: null,
			enableSingleOutputPortDisplay: false,
			enableNarrowPalette: true,
			schemaValidation: false,
			enableBoundingRectangles: false, // Not documented
			enableCanvasUnderlay: "None", // Not documented
			enableParentClass: "", // Not documented
			enablePositionNodeOnRightFlyoutOpen: false, // May also be an object: { x: 5, y: 5 }
			emptyCanvasContent: null,
			dropZoneCanvasContent: null,
			enableNodeLayout: {},
			enableCanvasLayout: {}, // Not documented
			tipConfig: {
				"palette": true,
				"nodes": true,
				"ports": true,
				"links": true
			}
		};

		const newLayout = LayoutDimensions.getLayout(config);
		config.enableNodeLayout = newLayout.nodeLayout;
		config.enableCanvasLayout = newLayout.canvasLayout;

		return config;
	}

	// Returns true if the two canvas config object compare the same.
	static compareCanvasConfigs(config1, config2) {
		let state = false;

		if (config1 && config2) {
			state = !(
				config1.enableInteractionType !== config2.enableInteractionType ||
				config1.enableNodeFormatType !== config2.enableNodeFormatType ||
				config1.enableLinkType !== config2.enableLinkType ||
				config1.enableLinkDirection !== config2.enableLinkDirection ||
				config1.enableLinkSelection !== config2.enableLinkSelection ||
				config1.enableLinkReplaceOnNewConnection !== config2.enableLinkReplaceOnNewConnection ||
				config1.enableAssocLinkCreation !== config2.enableAssocLinkCreation ||
				config1.enableAssocLinkType !== config2.enableAssocLinkType ||
				config1.enableDragWithoutSelect !== config2.enableDragWithoutSelect ||
				config1.enableInternalObjectModel !== config2.enableInternalObjectModel ||
				config1.enablePaletteLayout !== config2.enablePaletteLayout ||
				config1.enableToolbarLayout !== config2.enableToolbarLayout ||
				config1.enableInsertNodeDroppedOnLink !== config2.enableInsertNodeDroppedOnLink ||
				config1.enableHighlightNodeOnNewLinkDrag !== config2.enableHighlightNodeOnNewLinkDrag ||
				config1.enableHighlightUnavailableNodes !== config2.enableHighlightUnavailableNodes ||
				config1.enableMoveNodesOnSupernodeResize !== config2.enableMoveNodesOnSupernodeResize ||
				config1.enableExternalPipelineFlows !== config2.enableExternalPipelineFlows ||
				config1.enableDisplayFullLabelOnHover !== config2.enableDisplayFullLabelOnHover ||
				config1.enableDropZoneOnExternalDrag !== config2.enableDropZoneOnExternalDrag ||
				config1.enableRightFlyoutUnderToolbar !== config2.enableRightFlyoutUnderToolbar ||
				config1.enablePanIntoViewOnOpen !== config2.enablePanIntoViewOnOpen ||
				config1.enableZoomIntoSubFlows !== config2.enableZoomIntoSubFlows ||
				config1.enableBrowserEditMenu !== config2.enableBrowserEditMenu ||
				config1.enableAutoLinkOnlyFromSelNodes !== config2.enableAutoLinkOnlyFromSelNodes ||
				config1.enableSaveZoom !== config2.enableSaveZoom ||
				config1.enableSnapToGridType !== config2.enableSnapToGridType ||
				config1.enableSnapToGridX !== config2.enableSnapToGridX ||
				config1.enableSnapToGridY !== config2.enableSnapToGridY ||
				config1.enableAutoLayoutVerticalSpacing !== config2.enableAutoLayoutVerticalSpacing ||
				config1.enableAutoLayoutHorizontalSpacing !== config2.enableAutoLayoutHorizontalSpacing ||
				config1.enableSingleOutputPortDisplay !== config2.enableSingleOutputPortDisplay ||
				config1.enableNarrowPalette !== config2.enableNarrowPalette ||
				config1.schemaValidation !== config2.schemaValidation ||
				config1.enableBoundingRectangles !== config2.enableBoundingRectangles ||
				config1.enableCanvasUnderlay !== config2.enableCanvasUnderlay ||
				config1.enableParentClass !== config2.enableParentClass ||
				// We do not compare fields that contain JSX content here because they
				// are generated each time.
				// config1.emptyCanvasContent !== config2.emptyCanvasContent ||
				// config1.dropZoneCanvasContent !== config2.dropZoneCanvasContent ||
				!this.enableNodeRightFlyoutOpenExactlyMatches(config1.enablePositionNodeOnRightFlyoutOpen, config2.enablePositionNodeOnRightFlyoutOpen) ||
				!this.enableCanvasLayoutExactlyMatches(config1.enableCanvasLayout, config2.enableCanvasLayout) ||
				!this.enableNodeLayoutExactlyMatches(config1.enableNodeLayout, config2.enableNodeLayout) ||
				!this.enableTipConfigExactlyMatches(config1.tipConfig, config2.tipConfig));
		}
		return state;
	}

	// Returns true if the contents of enablePositionNode1 and enablePositionNode2 are
	// exactly the same.
	static enableNodeRightFlyoutOpenExactlyMatches(enablePositionNode1, enablePositionNode2) {
		if (typeof enablePositionNode1 === "boolean" &&
				typeof enablePositionNode2 === "boolean") {
			return enablePositionNode1 === enablePositionNode2;

		} else if (typeof enablePositionNode1 === "object" &&
								typeof enablePositionNode2 === "object") {
			if (enablePositionNode1.x === enablePositionNode2.x &&
					enablePositionNode1.y === enablePositionNode2.y) {
				return true;
			}
		}

		return false;
	}

	// Returns true if the contents of enableLayout1 and enableLayout2 are
	// exactly the same.
	static enableCanvasLayoutExactlyMatches(enableLayout1, enableLayout2) {
		if (!enableLayout1 && !enableLayout2) {
			return true;
		} else if (isMatch(enableLayout1, enableLayout2) && isMatch(enableLayout2, enableLayout1)) {
			return true;
		}
		return false;
	}

	// Returns true if the contents of enableLayout1 and enableLayout2 including
	// their decorations arrays are exactly the same.
	static enableNodeLayoutExactlyMatches(enableLayout1, enableLayout2) {
		if (!enableLayout1 && !enableLayout2) {
			return true;
		} else if (isMatch(enableLayout1, enableLayout2) && isMatch(enableLayout2, enableLayout1) &&
			this.decorationsArraysExactlyMatches(enableLayout1.decorations, enableLayout2.decorations)) {
			return true;
		}
		return false;
	}

	// Returns true if two decorations arrays passed in are identical or false
	// otherwise.
	static 	decorationsArraysExactlyMatches(decorations1, decorations2) {
		if (!decorations1 && !decorations2) {
			return true;

		} else if (!decorations1 || !decorations2) {
			return false;
		}

		let state = true;
		decorations1.forEach((dec1, i) => {
			const dec2 = decorations2[i];
			if (dec2) {
				if (!isMatch(dec1, dec2) || !isMatch(dec2, dec1)) {
					state = false;
				}
			} else {
				state = false;
			}
		});
		return state;
	}

	// Returns true if two tip config objects passed in are identical or false
	// otherwise.
	static enableTipConfigExactlyMatches(tipConfig1, tipConfig2) {
		if (!tipConfig1 && !tipConfig2) {
			return true;

		} else if (!tipConfig1 || !tipConfig2) {
			return false;
		}

		return (isMatch(tipConfig1, tipConfig2) && isMatch(tipConfig2, tipConfig1));
	}
}
