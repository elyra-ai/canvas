/*
 * Copyright 2017-2025 Elyra Authors
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
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.previousObjectsInfo = this.getPreviousObjectsInfo(data);
		this.previousDetLinksInfo = this.getPreviousDetachedLinksInfo(data);
	}

	// Standard methods
	do() {
		this.apiPipeline.sizeAndPositionObjects(this.data.objectsInfo, this.data.linksInfo);
	}

	undo() {
		this.apiPipeline.sizeAndPositionObjects(this.previousObjectsInfo, this.previousDetLinksInfo);
	}

	redo() {
		this.do();
	}

	getLabel() {
		const com = this.apiPipeline.getComment(this.data.selectedObjectIds[0]);
		if (com) {
			return this.labelUtil.getActionLabel(this, "action.sizeComment");
		}
		return this.labelUtil.getActionLabel(this, "action.sizeAndPositionObjects");
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
				if (obj.isResized) {
					previousObjectsInfo[objId].isResized = obj.isResized;
					previousObjectsInfo[objId].resizeWidth = obj.resizeWidth;
					previousObjectsInfo[objId].resizeHeight = obj.resizeHeight;
				}
			}
		});
		return previousObjectsInfo;
	}

	getPreviousDetachedLinksInfo(data) {
		const previousLinksInfo = [];
		Object.keys(data.detachedLinksInfo).forEach((linkId) => {
			const obj = this.apiPipeline.getLink(linkId);
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
