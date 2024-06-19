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
import { isEqual } from "lodash";
import HiddenSubjectsCtrl from "../ctrl/HiddenSubjectsCtrl";

/*
 * This panel exists to service the property requirements for
 * the Subjects and Repeated Measures tables in GLMM.
 */
class CustomSubjectsPanel {
	static id() {
		return "custom-subjects-panel";
	}

	constructor(parameters, controller, data) {
		this.parameters = parameters;
		this.controller = controller;
		this.data = data;
		this.updatingSubjects = false;
		this.updatingMeasures = false;
		this.reconcileLists = this.reconcileLists.bind(this);
	}

	reconcileLists() {
		const subjectsValue = this.controller.getPropertyValue({ name: "residual_subject_spec" });
		const subjectsUIValue = this.controller.getPropertyValue({ name: "residual_subject_ui_spec" });
		const rMeasuresValue = this.controller.getPropertyValue({ name: "repeated_measures" });
		const rMeasuresUIValue = this.controller.getPropertyValue({ name: "repeated_ui_measures" });
		const subjects = Array.isArray(subjectsValue) ? subjectsValue[0] : null;
		const measures = Array.isArray(rMeasuresValue) ? rMeasuresValue[0] : null;
		const emptySubjects = subjects === null || subjects.length === 0;
		const emptyUISubjects = typeof subjectsUIValue === "undefined" || subjectsUIValue.length === 0;
		const noSubjects = emptySubjects && emptyUISubjects;
		if (!noSubjects && !isEqual(subjects, subjectsUIValue) && !this.updatingSubjects) {
			this.updatingSubjects = true;
			const newSubjectsValue = [[], []];
			if (subjectsUIValue) {
				for (let idx = 0; idx < subjectsUIValue.length; idx++) {
					newSubjectsValue[0].push(subjectsUIValue[idx]);
					newSubjectsValue[1].push(0);
				}
			}
			const that = this;
			that.controller.updatePropertyValue({ name: "residual_subject_spec" }, newSubjectsValue);
			that.updatingSubjects = false;
		}
		const emptyMeasures = measures === null || measures.length === 0;
		const emptyUIMeasures = typeof rMeasuresUIValue === "undefined" || rMeasuresUIValue.length === 0;
		const noMeasures = emptyMeasures && emptyUIMeasures;
		if (!noMeasures && !isEqual(measures, rMeasuresUIValue) && !this.updatingMeasures) {
			this.updatingMeasures = true;
			const measuresValue = [[], []];
			if (rMeasuresUIValue) {
				for (let idx = 0; idx < rMeasuresUIValue.length; idx++) {
					measuresValue[0].push(rMeasuresUIValue[idx]);
					measuresValue[1].push(0);
				}
			}
			const that = this;
			that.controller.updatePropertyValue({ name: "repeated_measures" }, measuresValue);
			that.updatingMeasures = false;
		}
		return true;
	}

	renderPanel() {
		const subjectsCtrl = (<HiddenSubjectsCtrl
			controller={this.controller}
			callback={this.reconcileLists}
			data={this.data}
		/>);
		return (
			<div>{subjectsCtrl}</div>
		);
	}
}

export default CustomSubjectsPanel;
