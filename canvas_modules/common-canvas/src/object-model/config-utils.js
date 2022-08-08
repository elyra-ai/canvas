/*
 * Copyright 2022 Elyra Authors
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

import { isMatch, isMatchWith } from "lodash";
import LayoutDimensions from "./layout-dimensions.js";
import { ASSOC_STRAIGHT, LINK_SELECTION_NONE } from "../common-canvas/constants/canvas-constants";

export default class CanvasUtils {

	// Returns a config object which is the result of merging config into
	// startConfig.
	static mergeCanvasConfigs(startConfig, config) {
		let newConfig = Object.assign({}, startConfig, config || {});

		if (config) {
			const newLayout = LayoutDimensions.getLayout(newConfig,
				{ nodeLayout: config.enableNodeLayout, canvasLayout: config.enableCanvasLayout });
			const newTipConfig = Object.assign({}, startConfig.tipConfig, config.tipConfig);

			newConfig = Object.assign({}, newConfig, {
				enableNodeLayout: newLayout.nodeLayout,
				enableCanvasLayout: newLayout.canvasLayout,
				tipConfig: newTipConfig
			});
		}

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
			enableResizableNodes: false,
			enableInsertNodeDroppedOnLink: false,
			enableHighlightNodeOnNewLinkDrag: false,
			enableHighlightUnavailableNodes: false,
			enableMoveNodesOnSupernodeResize: true,
			enableExternalPipelineFlows: true,
			enableEditingActions: true,
			enableDisplayFullLabelOnHover: false,
			enableDropZoneOnExternalDrag: false,
			enableRightFlyoutUnderToolbar: false,
			enablePanIntoViewOnOpen: false,
			enableZoomIntoSubFlows: false,
			enableBrowserEditMenu: true,
			enableMarkdownInComments: false,
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
			enableUseCardFromOriginalPorts: false, // Not documented
			tipConfig: {
				"palette": true,
				"nodes": true,
				"ports": true,
				"decorations": true,
				"links": true,
				"stateTag": true
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

		// Check the two objects have the same number of fields before comparing
		// the details.
		if (Object.keys(config1).length === Object.keys(config2).length) {
			state = isMatchWith(config1, config2, (objValue, srcValue, key) => {
				switch (key) {
				case "enablePositionNodeOnRightFlyoutOpen": {
					return this.enableNodeRightFlyoutOpenExactlyMatches(objValue, srcValue);
				}
				case "enableCanvasLayout": {
					return this.enableCanvasLayoutExactlyMatches(objValue, srcValue);
				}
				case "enableNodeLayout": {
					return this.enableNodeLayoutExactlyMatches(objValue, srcValue);
				}
				case "tipConfig": {
					return this.enableTipConfigExactlyMatches(objValue, srcValue);
				}
				// All other config fields will be compared as values or object pointers
				default: {
					return objValue === srcValue;
				}
				}
			});
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

		} else if (this.compareFieldCount(enableLayout1, enableLayout2) &&
								isMatch(enableLayout1, enableLayout2)) {
			return true;
		}

		return false;
	}

	// Returns true if the contents of enableLayout1 and enableLayout2 including
	// their decorations arrays are exactly the same.
	static enableNodeLayoutExactlyMatches(enableLayout1, enableLayout2) {
		if (!enableLayout1 && !enableLayout2) {
			return true;

		} else if (this.compareFieldCount(enableLayout1, enableLayout2) &&
								isMatch(enableLayout1, enableLayout2) &&
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

		return (this.compareFieldCount(tipConfig1, tipConfig2) &&
						isMatch(tipConfig1, tipConfig2));
	}

	static compareFieldCount(obj1, obj2) {
		return Object.keys(obj1).length === Object.keys(obj2).length;
	}
}
