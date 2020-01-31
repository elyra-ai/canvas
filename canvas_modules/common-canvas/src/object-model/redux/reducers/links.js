/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint arrow-body-style: ["off"] */

import { NODE_LINK, COMMENT_LINK } from "../../../common-canvas/constants/canvas-constants.js";

export default (state = [], action) => {
	switch (action.type) {
	case "DELETE_SUPERNODE":
	case "DELETE_OBJECT":
		return state.filter((link) => {
			return (link.srcNodeId !== action.data.id && // If node being deleted is either source or target of link remove this link
				link.trgNodeId !== action.data.id);
		});

	case "ADD_LINK": {
		const newLink = {
			id: action.data.id,
			class_name: action.data.class_name,
			srcNodeId: action.data.srcNodeId,
			trgNodeId: action.data.trgNodeId,
			type: action.data.type
		};

		if (action.data.type === NODE_LINK) {
			Object.assign(newLink, {
				"srcNodePortId": action.data.srcNodePortId,
				"trgNodePortId": action.data.trgNodePortId,
				"linkName": action.data.linkName });
		}
		return [
			...state,
			newLink
		];
	}

	case "DELETE_LINK":
		return state.filter((link) => {
			return link.id !== action.data.id;
		});

	case "DELETE_LINKS": {
		let newLinks = [...state];
		action.data.linkIds.forEach((linkIdToDelete) => {
			newLinks = newLinks.filter((link) => {
				return link.id !== linkIdToDelete;
			});
		});
		return newLinks;
	}

	case "SET_LINKS_CLASS_NAME":
		return state.map((link) => {
			const idx = action.data.linkIds.indexOf(link.id);
			if (idx > -1) {
				const newLink = Object.assign({}, link);
				newLink.style =
					Array.isArray(action.data.newClassName) ? action.data.newClassName[idx] : action.data.newClassName;
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_STYLE":
		return state.map((link) => {
			if (action.data.objIds.indexOf(link.id) > -1) {
				const newLink = Object.assign({}, link);
				if (action.data.temporary) {
					newLink.style_temp = action.data.newStyle;
				} else {
					newLink.style = action.data.newStyle;
				}
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_MULTI_STYLE":
		return state.map((link) => {
			const pipelineObjStyle =
				action.data.pipelineObjStyles.find((entry) => entry.pipelineId === action.data.pipelineId && entry.objId === link.id);
			if (pipelineObjStyle) {
				const newLink = Object.assign({}, link);
				const style = pipelineObjStyle && pipelineObjStyle.style ? pipelineObjStyle.style : null;
				if (action.data.temporary) {
					newLink.style_temp = style;
				} else {
					newLink.style = style;
				}
				return newLink;
			}
			return link;
		});

	case "SET_LINK_DECORATIONS":
		return state.map((link, index) => {
			if (action.data.linkId === link.id) {
				const newLink = Object.assign({}, link);
				newLink.decorations = action.data.decorations;
				return newLink;
			}
			return link;
		});

	case "SET_LINKS_MULTI_DECORATIONS":
		return state.map((link) => {
			const pipelineLinkDec =
				action.data.pipelineLinkDecorations.find((entry) => entry.pipelineId === action.data.pipelineId && entry.linkId === link.id);
			if (pipelineLinkDec) {
				const newLink = Object.assign({}, link, { decorations: pipelineLinkDec.decorations });
				return newLink;
			}
			return link;
		});

	case "REMOVE_ALL_STYLES":
		return state.map((link) => {
			if (action.data.temporary && link.style_temp) {
				const newLink = Object.assign({}, link);
				delete newLink.style_temp;
				return newLink;
			} else if (!action.data.temporary && link.style) {
				const newLink = Object.assign({}, link);
				delete newLink.style;
				return newLink;
			}
			return link;
		});


	// When a comment is added, links have to be created from the comment
	// to each of the selected nodes.
	case "ADD_COMMENT": {
		const createdLinks = [];
		action.data.selectedObjectIds.forEach((objId, i) => {
			createdLinks.push({
				id: action.data.linkIds[i],
				srcNodeId: action.data.id,
				trgNodeId: action.data.selectedObjectIds[i],
				type: COMMENT_LINK
			});
		});
		return [
			...state,
			...createdLinks
		];
	}

	case "ADD_AUTO_NODE": {
		return [
			...state,
			action.data.newLink
		];
	}

	default:
		return state;
	}
};
