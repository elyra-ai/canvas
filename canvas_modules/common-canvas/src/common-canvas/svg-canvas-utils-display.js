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

export default class SvgCanvasDisplay {
	constructor(canvasController, isSubflow, pipelineId, breadcrumbs) {
		this.canvasController = canvasController;
		this.isSubflow = isSubflow;
		this.pipelineId = pipelineId;
		this.breadcrumbs = breadcrumbs;
	}

	isDisplayingCurrentPipeline() {
		const currentBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
		return currentBreadcrumb.pipelineId === this.pipelineId;
	}

	setDisplayState() {
		if (this.breadcrumbs.length > 1 &&
				this.isDisplayingCurrentPipeline()) {
			this.displayState = "sub-flow-full-page";

		} else if (this.isSubflow) {
			this.displayState = "sub-flow-in-place";

		} else {
			this.displayState = "primary-flow-full-page";
		}
	}

	getDisplayStateMsg() {
		return "Display state set to " + this.displayState;
	}

	isDisplayingPrimaryFlowFullPage() {
		return this.displayState === "primary-flow-full-page";
	}

	isDisplayingSubFlow() {
		return this.displayState === "sub-flow-in-place" || this.displayState === "sub-flow-full-page";
	}

	isDisplayingSubFlowInPlace() {
		return this.displayState === "sub-flow-in-place";
	}

	isDisplayingSubFlowFullPage() {
		return this.displayState === "sub-flow-full-page";
	}

	isDisplayingFullPage() {
		return this.displayState === "primary-flow-full-page" || this.displayState === "sub-flow-full-page";
	}
}
