/*
 * Copyright 2017-2022 Elyra Authors
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

export default class CommonPropertiesAction extends Action {
	constructor(newValues, initialValues, appData, applyPropertyChanges, propertiesActionLabel) {
		super(newValues);
		this.newValues = newValues;
		this.initialValues = initialValues;
		this.appData = appData;
		this.applyPropertyChanges = applyPropertyChanges;
		this.propertiesActionLabel = propertiesActionLabel;
	}

	// Standard methods
	do() {
		this.applyPropertyChanges(this.newValues.properties, this.appData, this.newValues.additionalInfo, this.newValues.undoInfo, this.newValues.uiProperties);
	}

	undo() {
		this.applyPropertyChanges(this.initialValues.properties, this.appData, this.initialValues.additionalInfo, this.initialValues.undoInfo, this.initialValues.uiProperties);
	}

	redo() {
		this.applyPropertyChanges(this.newValues.properties, this.appData, this.newValues.additionalInfo, this.newValues.undoInfo, this.newValues.uiProperties);
	}

	getLabel() {
		return this.propertiesActionLabel;
	}
}
