/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

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
