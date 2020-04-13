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

import categories from "./categories.js";

export default (state = {}, action) => {
	switch (action.type) {
	case "CLEAR_PALETTE_DATA":
		return {};

	case "SET_PALETTE_DATA":
		return Object.assign({}, action.data);

	case "ADD_NODE_TYPES_TO_PALETTE":
	case "REMOVE_NODE_TYPES_FROM_PALETTE":
	case "SET_CATEGORY_LOADING_TEXT":
	case "SET_CATEGORY_EMPTY_TEXT": {
		return Object.assign({}, state, { categories: categories(state.categories, action) });
	}
	default:
		return state;
	}
};
