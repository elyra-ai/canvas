/*
 * Copyright 2024 Elyra Authors
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

import { propertyOf } from "lodash";

class Title {
	constructor(title) {
		this.actions = title.action_refs || [];
	}

	static makeTitle(uiGroup) {
		if (uiGroup) {
			return new Title(
				propertyOf(uiGroup)("action_refs")
			);
		}
		return null;
	}

	actionIds() {
		return this.actions;
	}
}

export class TitleMetadata {
	constructor(title) {
		this.Title = title;
	}

	static makeTitleMetadata(title) {
		if (title) {
			return new TitleMetadata(new Title(title));
		}
		return null;
	}
}
