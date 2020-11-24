/*
 * Copyright 2017-2020 Elyra Authors
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
import Action from "../command-stack/action.js";

export default class SizeAndPositionObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.previousData = {};
		this.previousData.objectsInfo = this.getPreviousNodesInfo(data);
	}

	// Standard methods
	do() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo);
	}

	undo() {
		this.apiPipeline.sizeAndPositionObjects(this.previousData.objectsInfo);
	}

	redo() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo);
	}

	getPreviousNodesInfo(data) {
		const previousNodesInfo = [];
		Object.keys(data.objectsInfo).forEach((nodeId) => {
			const obj = this.apiPipeline.getObject(nodeId);
			if (obj) {
				previousNodesInfo[nodeId] = {
					id: obj.id,
					x_pos: obj.x_pos,
					y_pos: obj.y_pos,
					width: obj.width,
					height: obj.height
				};
			}
		});
		return previousNodesInfo;
	}
}
