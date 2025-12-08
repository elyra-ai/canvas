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

import React from "react";
import PropTypes from "prop-types";

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { CharacterSentenceCase, CharacterWholeNumber } from "@carbon/react/icons";

import StreamsFlow from "./streams-flow.json";

export default class StreamsCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(StreamsFlow);

		// The below overrides were provided by Mary Komor from the Streams team
		this.config = Object.assign({}, props.config, {
			enableNodeFormatType: "Horizontal",
			enableLinkType: "Elbow",
			enablePaletteLayout: "Flyout",
			enableParentClass: "streams",
			enableLinkSelection: "None",
			enableAutoLayoutVerticalSpacing: 50,
			enableAutoLayoutHorizontalSpacing: 80,
			enableInternalObjectModel: true,
			enableMoveNodesOnSupernodeResize: true,
			enableContextToolbar: true,
			enableDropZoneOnExternalDrag: true,
			enableNarrowPalette: false,
			schemaValidation: true,
			tipConfig: {
				palette: false,
				nodes: true,
				ports: true,
				links: true
			},
			enableNodeLayout: {
				minInitialLine: 75,
				portArcSpacing: 15,
				labelEditable: true,

				imagePosition: "middleCenter",
				imagePosX: -74,
				imagePosY: -13,

				labelPosition: "middleCenter",
				labelPosX: -42,
				labelPosY: -8,

				errorPosition: "middleCenter",
				errorXPos: -56,
				errorYPos: -14,

				ellipsisPosition: "middleCenter",
				ellipsisPosX: 65,
				ellipsisPosY: -12,
			}
		});
	}

	contextMenuHandler(source, defaultMenu) {
		const defMenu = defaultMenu;
		if (source.type === "comment") {
			const lettersSubMenu = [
				{ action: "A", label: "Aaaaaaaa" },
				{ action: "B", label: "Bbbb" },
				{ action: "C", label: "Cccccccccc" },
				{ action: "D", label: "Ddd" },
				{ action: "E", label: "Eeeeee" },
				{ action: "F", label: "Ffffffff" },
				{ action: "G", label: "Gg" },
				{ action: "H", label: "Hhhhh" },
				{ action: "I", label: "Iiiiiii" }
			];
			const numbersSubMenu = [
				{ action: "1", label: "One 1" },
				{ action: "2", label: "Two Two" },
				{ action: "3", label: "Three Three" },
				{ action: "4", label: "Four" },
				{ action: "5", label: "Five 555" },
				{ action: "6", label: "Sixes" },
				{ action: "7", label: "Seven" },
				{ action: "8", label: "Eight" },
				{ action: "9", label: "Niners 9" }
			];
			defMenu.push({ action: "letters", label: "Letters", submenu: true, menu: lettersSubMenu, icon: (<CharacterSentenceCase size={32} />), toolbarItem: true });
			defMenu.push({ action: "numbers", label: "Numbers", submenu: true, menu: numbersSubMenu, icon: (<CharacterWholeNumber size={32} />) });
		}
		return defMenu;
	}

	render() {

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={this.config}
				contextMenuHandler={this.contextMenuHandler}
			/>
		);
	}
}

StreamsCanvas.propTypes = {
	config: PropTypes.object,
};
