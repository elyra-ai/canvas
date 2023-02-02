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

import { SET_WIDE_FLYOUT_PRIMARY_BUTTON_DISABLED } from "../actions";

function setWideFlyoutPrimaryButtonDisabled(state = [], action) {
	switch (action.type) {
	case SET_WIDE_FLYOUT_PRIMARY_BUTTON_DISABLED: {
		const newState = state;
		newState[action.info.panelId.name] = action.info.disableState;
		return Object.assign({}, state, newState);
	}
	default:
		return state;
	}
}

export default setWideFlyoutPrimaryButtonDisabled;
