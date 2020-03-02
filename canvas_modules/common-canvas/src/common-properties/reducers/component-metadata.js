/*
 * Copyright 2017-2020 IBM Corporation
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

import { SET_TITLE, SET_ACTIVE_TAB, UPDATE_EXPRESSION_VALIDATE } from "../actions";


function componentMetadata(state = [], action) {
	switch (action.type) {
	case SET_TITLE: {
		const newState = state;
		newState.title = action.title;
		return Object.assign({}, state, newState);
	}
	case SET_ACTIVE_TAB: {
		const newState = state;
		newState.activeTab = action.activeTab;
		return Object.assign({}, state, newState);
	}
	case UPDATE_EXPRESSION_VALIDATE: {
		const newState = state;
		newState[action.info.name] = { expressionValidate: action.info.expressionValidate };
		return Object.assign({}, state, newState);
	}
	default:
		return state;
	}
}

export default componentMetadata;
