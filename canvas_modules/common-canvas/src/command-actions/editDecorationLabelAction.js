/*
 * Copyright 2017-2024 Elyra Authors
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
import { DEC_LINK, DEC_NODE }	from "../common-canvas/constants/canvas-constants";

export default class EditDecorationLabelAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(this.data.pipelineId);
		if (this.data.objType === DEC_LINK) {
			this.previousDecorations = this.apiPipeline.getLinkDecorations(this.data.objId) || [];
		} else if (this.data.objType === DEC_NODE) {
			this.previousDecorations = this.apiPipeline.getNodeDecorations(this.data.objId) || [];
		}
		this.newDecorations = this.previousDecorations.map((dec) => {
			if (dec.id === this.data.decId) {
				return Object.assign({}, dec, { label: this.data.label });
			}
			return dec;
		});
	}

	// Standard methods
	do() {
		if (this.data.objType === DEC_LINK) {
			this.apiPipeline.setLinkDecorations(this.data.objId, this.newDecorations);
		} else if (this.data.objType === DEC_NODE) {
			this.apiPipeline.setNodeDecorations(this.data.objId, this.newDecorations);
		}
	}

	undo() {
		if (this.data.objType === DEC_LINK) {
			this.apiPipeline.setLinkDecorations(this.data.objId, this.previousDecorations);
		} else if (this.data.objType === DEC_NODE) {
			this.apiPipeline.setNodeDecorations(this.data.objId, this.previousDecorations);
		}
	}

	redo() {
		this.do();
	}

	getLabel() {
		if (this.data.objType === DEC_LINK) {
			return this.labelUtil.getActionLabel(this, "action.editLinkDecorationLabel");
		}
		return this.labelUtil.getActionLabel(this, "action.editNodeDecorationLabel");
	}
}
