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

import categories from "./categories.js";

export default (state = {}, action) => {
	switch (action.type) {
	case "CLEAR_PALETTE_DATA":
		return { content: {} };

	case "SET_PALETTE_DATA": {
		const newContent = Object.assign({}, action.data.content);
		return Object.assign({}, state, { content: newContent });
	}

	case "ADD_NODE_TYPES_TO_PALETTE":
	case "REMOVE_NODE_TYPES_FROM_PALETTE":
	case "SET_IS_OPEN_CATEGORY":
	case "SET_IS_OPEN_ALL_CATEGORIES":
	case "SET_CATEGORY_LOADING_TEXT":
	case "SET_CATEGORY_EMPTY_TEXT": {
		const newContent = Object.assign({}, state.content, { categories: categories(state.content.categories, action) });
		// Save version for the palette in case this is the first action performed on an empty palette.
		return Object.assign({}, state, { content: newContent, version: "3.0" });
	}

	case "SET_PALETTE_OPEN_STATE":
		return Object.assign({}, state, { isOpen: action.data.isOpen });


	default:
		return state;
	}
};
