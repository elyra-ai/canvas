/*
 * Copyright 2017-2023 Elyra Authors
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
/* eslint arrow-body-style: ["off"] */


import CanvasUtils from "../../../common-canvas/common-canvas-utils.js";

export default (state = [], action) => {
	switch (action.type) {
	case "MOVE_OBJECTS":
		// action.data.nodes contains an array of node and comment Ids
		if (action.data.nodes) {
			return state.map((comment, index) => {
				if (action.data.nodes.indexOf(comment.id) > -1) {
					const xPos = comment.x_pos + action.data.offsetX;
					const yPos = comment.y_pos + action.data.offsetY;
					return Object.assign({}, comment, { x_pos: xPos, y_pos: yPos });
				}
				return comment;
			});
		}
		return state;

	case "SET_COMMENT_POSITIONS":
		return state.map((comment, index) => {
			if (action.data.commentPositions && typeof action.data.commentPositions[comment.id] !== "undefined") {
				const newPosition = action.data.commentPositions[comment.id];
				return Object.assign({}, comment, { x_pos: newPosition.x_pos, y_pos: newPosition.y_pos });
			}
			return comment;
		});

	case "DELETE_OBJECT":
		return state.filter((node) => {
			return node.id !== action.data.id; // filter will return all objects NOT found
		});

	case "DELETE_COMMENTS":
		return state.filter((com) => {
			const comFound = action.data.commentsToDelete.some((c) => c.id === com.id);
			return !comFound;
		});


	case "ADD_COMMENT": {
		const newComment = getCommentFromData(action.data);
		return [
			...state,
			newComment
		];
	}

	case "ADD_COMMENTS": {
		const comments = action.data.commentsToAdd.map((cd) => getCommentFromData(cd));
		return [
			...state,
			...comments
		];
	}

	case "EDIT_COMMENT":
		return state.map((comment, index) => {
			if (action.data.id === comment.id) {
				const newComment = Object.assign({}, comment, {
					content: action.data.content,
					height: action.data.height,
					width: action.data.width,
					x_pos: action.data.x_pos ? action.data.x_pos : comment.x_pos,
					y_pos: action.data.y_pos ? action.data.y_pos : comment.y_pos
				});
				return newComment;
			}
			return comment;
		});

	case "SET_COMMENT_PROPERTIES":
		return state.map((comment) => {
			if (comment.id === action.data.commentId) {
				return Object.assign({}, comment, action.data.commentProperties);
			}
			return comment;
		});

	case "SIZE_AND_POSITION_OBJECTS":
		return state.map((com, index) => {
			const comObj = action.data.objectsInfo[com.id];
			if (typeof comObj !== "undefined") {
				const newCom = Object.assign({}, com, {
					height: comObj.height,
					width: comObj.width,
					x_pos: comObj.x_pos,
					y_pos: comObj.y_pos
				});
				return newCom;
			}

			return com;
		});

	case "ADD_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.indexOf(comment.id) > -1) {
				const newComment = Object.assign({}, comment);
				newComment.customAttrs = newComment.customAttrs || [];
				newComment.customAttrs.push(action.data.attrName);
				return newComment;
			}
			return comment;
		});

	case "REMOVE_COMMENT_ATTR":
		return state.map((comment, index) => {
			if (action.data.objIds.indexOf(comment.id) > -1) {
				const newComment = Object.assign({}, comment);
				if (newComment.customAttrs) {
					newComment.customAttrs = newComment.customAttrs.filter((a) => {
						return a !== action.data.attrName;
					});
				}
				return newComment;
			}
			return comment;
		});

	case "SET_OBJECTS_COLOR_CLASS_NAME":
		return state.map((comment) => {
			const idx = action.data.objIds.indexOf(comment.id);
			if (idx > -1) {
				const newColorClass =
					Array.isArray(action.data.newColorClass) ? (action.data.newColorClass[idx] || null) : action.data.newColorClass;
				const className = replaceColorClass(comment.class_name, newColorClass);
				const newComment = Object.assign({}, comment, { class_name: className });
				return newComment;
			}
			return comment;
		});


	case "SET_OBJECTS_CLASS_NAME":
		return state.map((comment) => {
			const idx = action.data.objIds.indexOf(comment.id);
			if (idx > -1) {
				const newComment = Object.assign({}, comment);
				newComment.class_name =
					Array.isArray(action.data.newClassName) ? (action.data.newClassName[idx] || null) : action.data.newClassName;
				return newComment;
			}
			return comment;
		});

	case "SET_OBJECTS_STYLE":
		return state.map((comment) => {
			if (action.data.objIds.indexOf(comment.id) > -1) {
				const newComment = Object.assign({}, comment);
				if (action.data.temporary) {
					newComment.style_temp = action.data.newStyle;
				} else {
					newComment.style = action.data.newStyle;
				}
				return newComment;
			}
			return comment;
		});

	case "SET_OBJECTS_MULTI_STYLE":
		return state.map((comment) => {
			const pipelineObjStyle =
				action.data.pipelineObjStyles.find((entry) => entry.pipelineId === action.data.pipelineId && entry.objId === comment.id);
			if (pipelineObjStyle) {
				const newComment = Object.assign({}, comment);
				const style = pipelineObjStyle && pipelineObjStyle.style ? pipelineObjStyle.style : null;
				if (action.data.temporary) {
					newComment.style_temp = style;
				} else {
					newComment.style = style;
				}
				return newComment;
			}
			return comment;
		});

	case "REMOVE_ALL_STYLES":
		return state.map((comment) => {
			if (action.data.temporary && comment.style_temp) {
				const newComment = Object.assign({}, comment);
				delete newComment.style_temp;
				return newComment;
			} else if (!action.data.temporary && comment.style) {
				const newComment = Object.assign({}, comment);
				delete newComment.style;
				return newComment;
			}
			return comment;
		});


	default:
		return state;
	}
};

function replaceColorClass(className, newColorClass) {
	let cn = "";
	if (className) {
		cn = removeCurrentColorClass(className);
		cn = addNewColorClass(cn, newColorClass);
	} else {
		cn = newColorClass;
	}
	return cn;
}

function removeCurrentColorClass(className) {
	const cn = className
		.split(" ")
		.filter((tok) => !CanvasUtils.getBkgColorClass(tok))
		.join(" ");
	return cn;
}

function addNewColorClass(className, newColorClass) {
	return className ? className + " " + newColorClass : newColorClass;
}

function getCommentFromData(data) {
	const newComment = {
		id: data.id,
		content: data.content,
		height: data.height,
		width: data.width,
		x_pos: data.x_pos,
		y_pos: data.y_pos
	};
	if (typeof data.class_name !== "undefined") {
		newComment.class_name = data.class_name;
	}
	return newComment;
}
