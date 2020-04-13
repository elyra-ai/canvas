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
/* eslint arrow-body-style: ["off"] */

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

	case "DELETE_OBJECT":
		return state.filter((node) => {
			return node.id !== action.data.id; // filter will return all objects NOT found
		});

	case "ADD_COMMENT": {
		const newComment = {
			id: action.data.id,
			class_name: action.data.class_name,
			content: action.data.content,
			height: action.data.height,
			width: action.data.width,
			x_pos: action.data.x_pos,
			y_pos: action.data.y_pos
		};
		return [
			...state,
			newComment
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

	case "SET_OBJECTS_CLASS_NAME":
		return state.map((comment) => {
			const idx = action.data.objIds.indexOf(comment.id);
			if (idx > -1) {
				const newComment = Object.assign({}, comment);
				newComment.style =
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
