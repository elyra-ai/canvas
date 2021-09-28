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
		this.previousObjectsInfo = this.getPreviousObjectsInfo(data);
		this.previousLinksInfo = this.getPreviousLinksInfo(data);
	}

	// Standard methods
	do() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo, this.data.linksInfo);
	}

	undo() {
		this.apiPipeline.sizeAndPositionObjects(this.previousObjectsInfo, this.previousLinksInfo);
	}

	redo() {
		this.do();
	}

	getPreviousObjectsInfo(data) {
		const previousObjectsInfo = [];
		Object.keys(data.objectsInfo).forEach((objId) => {
			const obj = this.apiPipeline.getObject(objId);
			if (obj) {
				previousObjectsInfo[objId] = {
					id: obj.id,
					x_pos: obj.x_pos,
					y_pos: obj.y_pos,
					width: obj.width,
					height: obj.height
				};
			}
		});
		return previousObjectsInfo;
	}

	getPreviousLinksInfo(data) {
		const previousLinksInfo = [];
		Object.keys(data.linksInfo).forEach((linkId) => {
			const obj = this.apiPipeline.getObject(linkId);
			if (obj) {
				if (obj.srcPos || obj.trgPos) {
					previousLinksInfo[linkId] = {};
					if (obj.srcPos) {
						previousLinksInfo[linkId].srcPos = {
							x_pos: obj.srcPos.x_pos,
							y_pos: obj.srcPos.y_pos
						};
					}
					if (obj.trgPos) {
						previousLinksInfo[linkId].trgPos = {
							x_pos: obj.trgPos.x_pos,
							y_pos: obj.trgPos.y_pos
						};
					}
				}
			}
		});
		return previousLinksInfo;
	}

}
