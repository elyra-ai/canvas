/*
 * Copyright 2017-2019 IBM Corporation
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
/* eslint no-console: ["error", { allow: ["log", "info", "warn", "error", "time", "timeEnd"] }] */

import React from "react";
import AllTypesCanvas from "../../test_resources/diagrams/allTypesCanvas.json";
import ModelerPalette from "../../test_resources/palettes/modelerPalette.json";
import { CommonCanvas, CanvasController } from "common-canvas";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(AllTypesCanvas);
		this.canvasController.setPipelineFlowPalette(ModelerPalette);
	}

	render() {
		return (
			<div id="harness-app-container">
				<CommonCanvas
					canvasController={this.canvasController}
				/>
			</div>
		);
	}
}

export default App;
