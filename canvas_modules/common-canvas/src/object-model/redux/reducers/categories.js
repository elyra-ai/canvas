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

import nodetypes from "./nodetypes.js";

export default (state = [], action) => {
	switch (action.type) {

	case "ADD_NODE_TYPES_TO_PALETTE": {
		let category = state.find((cat) => cat.id === action.data.categoryId);

		if (category) {
			return state.map((cat) => {
				if (action.data.categoryId === cat.id) {
					return Object.assign({}, cat, { node_types: nodetypes(cat.node_types, action) });
				}
				return cat;
			});
		}

		// If a category was not found, we create a new one using the ID and label
		// provided.
		category = {
			"id": action.data.categoryId,
			"label": action.data.categoryLabel ? action.data.categoryLabel : action.data.categoryId
		};
		if (action.data.categoryDescription) {
			category.description = action.data.categoryDescription;
		}
		if (action.data.categoryImage) {
			category.image = action.data.categoryImage;
		}
		category.node_types = [];

		return [
			...state,
			Object.assign({}, category, { node_types: nodetypes(category.node_types, action) })
		];
	}

	case "REMOVE_NODE_TYPES_FROM_PALETTE": {
		return state.map((category) => {
			if (category.id === action.data.categoryId) {
				return Object.assign({}, category, { node_types: nodetypes(category.node_types, action) });
			}
			return category;
		});
	}

	case "SET_CATEGORY_LOADING_TEXT": {
		return state.map((category) => {
			if (category.id === action.data.categoryId) {
				return Object.assign({}, category, { loading_text: action.data.loadingText });
			}
			return category;
		});
	}

	case "SET_CATEGORY_EMPTY_TEXT": {
		return state.map((category) => {
			if (category.id === action.data.categoryId) {
				return Object.assign({}, category, { empty_text: action.data.emptyText });
			}
			return category;
		});
	}

	default:
		return state;
	}
};
