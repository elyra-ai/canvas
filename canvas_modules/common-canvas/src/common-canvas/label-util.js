/*
 * Copyright 2021 Elyra Authors
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

import defaultMessages1 from "../../locales/common-canvas/locales/en.json";
import defaultMessages2 from "../../locales/command-actions/locales/en.json";

export default class LabelUtil {
	constructor(intl, actionLabelHandler) {
		this.intl = intl;
		this.actionLabelHandler = actionLabelHandler;
		this.defaultMessages = { ...defaultMessages1, ...defaultMessages2 };
	}

	getActionLabel(action, key, substituteObj) {
		if (this.actionLabelHandler) {
			return this.actionLabelHandler(action);
		}
		return this.getLabel(key, substituteObj);
	}

	getLabel(key, substituteObj) {
		let formattedMessage;
		if (typeof this.intl !== "undefined" && this.intl !== null) {
			formattedMessage = this.intl.formatMessage({ id: key, defaultMessage: this.defaultMessages[key] }, substituteObj);
		} else {
			formattedMessage = this.defaultMessages[key];
		}
		return formattedMessage;
	}

}
