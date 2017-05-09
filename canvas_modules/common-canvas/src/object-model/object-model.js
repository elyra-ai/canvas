/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import { createStore, combineReducers } from 'redux';
import CanvasUtils from '../../utils/canvas-utils.js';
import uuid from 'node-uuid';

let nodeId = 0;
let commentId = 0;

const nodes = (state = [], action) => {
  switch (action.type) {
    case 'ADD_NODE':
      let newNode = {
        id: action.data.id,
        className: "canvas-node",
        image: action.data.image,
        outputPorts: action.data.outputPorts,
        inputPorts: action.data.inputPorts,
        xPos: action.data.xPos,
        yPos: action.data.yPos,
        objectData: {description: "", label: action.data.label}
      };
      return [
          ...state,
          newNode
        ];

    case 'MOVE_OBJECTS':
      // action.data.nodes contains an array of node and comment Ids
      if (action.data.nodes) {
        return state.map((node, index) => {
          if (action.data.nodes.findIndex((actionNodeId) => {return (actionNodeId == node.id);}) > -1) {
            let xPos = node.xPos + action.data.offsetX;
            let yPos = node.yPos + action.data.offsetY;
            return Object.assign({}, node, {xPos: xPos, yPos: yPos});
          } else {
            return node;
          }
        });
      }

    case 'DELETE_OBJECTS':
      return state.filter((node) => {
        let index =
          action.data.selectedObjectIds.findIndex((selId) => {
            return (node.id === selId);
          });
        return index === -1; // filter will return all objects NOT found in selectedObjectIds
      });

    case 'ADD_NODE_ATTR':
      return state.map((node, index) => {
        if (action.data.objIds.findIndex((actionId) => {return (actionId == node.id);}) > -1) {
          let newNode = Object.assign({}, node);
          newNode.customAttrs = newNode.customAttrs || [];
          newNode.customAttrs.push(action.data.attrName);
          return newNode;
        } else {
          return node;
        }
      });

      case 'REMOVE_NODE_ATTR':
        return state.map((node, index) => {
          if (action.data.objIds.findIndex((actionId) => {return (actionId == node.id);}) > -1) {
            let newNode = Object.assign({}, node);
            if (newNode.customAttrs) {
              newNode.customAttrs = newNode.customAttrs.filter((a) => {return a !== action.data.attrName;});
            }
            return newNode;
          } else {
            return node;
          }
        });


    default:
      return state;
  }
};


const comments = (state = [], action) => {
  switch (action.type) {
    case 'MOVE_OBJECTS':
      // action.data.nodes contains an array of node and comment Ids
      if (action.data.nodes) {
        return state.map((comment, index) => {
          if (action.data.nodes.findIndex((actionNodeId) => {return (actionNodeId == comment.id);}) > -1) {
            let xPos = comment.xPos + action.data.offsetX;
            let yPos = comment.yPos + action.data.offsetY;
            return Object.assign({}, comment, {xPos: xPos, yPos: yPos});
          } else {
            return comment;
          }
        });
      }

    case 'DELETE_OBJECTS':
      return state.filter((node) => {
        let index =
          action.data.selectedObjectIds.findIndex((selId) => {
            return (node.id === selId);
          });
        return index === -1; // filter will return all objects NOT found in selectedObjectIds
      });

    case 'ADD_COMMENT':
      let newComment = {
        id: action.data.id,
        className: 'canvas-comment',
        content: " ",
        height: 32,
        width: 128,
        xPos: action.data.mousePos.x,
        yPos: action.data.mousePos.y
      };
      return [
          ...state,
          newComment
        ];

    case 'EDIT_COMMENT':
      return state.map((comment, index) => {
        if (action.data.nodes.findIndex((actionId) => {return (actionId == comment.id);}) > -1) {
          let newComment = Object.assign({}, comment);
          newComment.content = action.data.label;
          newComment.height = action.data.height;
          newComment.width = action.data.width;
          newComment.xPos = action.data.offsetX;
          newComment.yPos = action.data.offsetY;
          return newComment;
        } else {
          return comment;
        }
      });


    case 'ADD_COMMENT_ATTR':
      return state.map((comment, index) => {
        if (action.data.objIds.findIndex((actionId) => {return (actionId == comment.id);}) > -1) {
          let newComment = Object.assign({}, comment);
          newComment.customAttrs = newComment.customAttrs || [];
          newComment.customAttrs.push(action.data.attrName);
          return newComment;
        } else {
          return comment;
        }
      });

    case 'REMOVE_COMMENT_ATTR':
      return state.map((comment, index) => {
        if (action.data.objIds.findIndex((actionId) => {return (actionId == comment.id);}) > -1) {
          let newComment = Object.assign({}, comment);
          if (newComment.customAttrs) {
            newComment.customAttrs = newComment.customAttrs.filter((a) => {return a !== action.data.attrName;});
          }
          return newComment;
        } else {
          return comment;
        }
      });

    default:
      return state;
  }
};


const links = (state = [], action) => {
  switch (action.type) {
    case 'DELETE_OBJECTS':
      return state.filter((link) => {
        let index =
          action.data.selectedObjectIds.findIndex((selId) => {
            return (link.source === selId ||  // If node being deleted is either source or target of link remove this link
                    link.target === selId);
          });

        return index === -1; // filter will return all links NOT involved in selectedObjectIds
      });

    case 'ADD_LINK':
      let className = "canvas-data-link";
      if (action.data.linkType === "comment") {
        className = "canvas-comment-link";
      }

      let newLink = {
        id: action.data.id,
        className: className,
        source: action.data.srcNodeId,
        target: action.data.trgNodeId,
      };
      return [
          ...state,
          newLink
        ];

      case 'DELETE_LINK':
        return state.filter((link) => {
          return link.id !== action.data.id;
        });

      // When a comment is added, links have to be created from the comment
      // to each of the selected nodes.
      case 'ADD_COMMENT':
        let createdLinks = [];
        action.data.selectedObjectIds.forEach((objId, i) => {
          createdLinks.push({
            id: action.data.linkIds[i],
            className: "canvas-comment-link",
            source: action.data.id,
            target: action.data.selectedObjectIds[i],
          });
        });
        return [
          ...state,
          ...createdLinks
        ];

      case 'DISCONNECT_NODES':
        return state.filter((link) => {
          let index = action.data.selectedNodeIds.findIndex((selId) => {
            return (selId === link.source ||
                    selId === link.target);
          });
          return index === -1
        });

      default:
        return state;
    }
  };


const diagram = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_NODE':
    case 'ADD_NODE_ATTR':
    case 'REMOVE_NODE_ATTR':
      return Object.assign({}, state, {nodes: nodes(state.nodes, action)});

    case 'MOVE_OBJECTS':
    case 'DELETE_OBJECTS':
      return Object.assign({}, state, {nodes: nodes(state.nodes, action),
                                       comments: comments(state.comments, action),
                                       links: links(state.links, action)});

    case 'ADD_LINK':
    case 'DELETE_LINK':
    case 'DISCONNECT_NODES':
      return Object.assign({}, state, {links: links(state.links, action)});

    case 'ADD_COMMENT':
      return Object.assign({}, state, {comments: comments(state.comments, action)},
                                      {links: links(state.links, action)});

    case 'EDIT_COMMENT':
    case 'ADD_COMMENT_ATTR':
    case 'REMOVE_COMMENT_ATTR':
      return Object.assign({}, state, {comments: comments(state.comments, action)});

    default:
      return state;
  }
};


const canvas = (state = getInitialCanvas(), action) => {
  switch (action.type) {
    case 'CLEAR_CANVAS':
      return null;

    case 'SET_CANVAS':
      return Object.assign({}, action.data);

    case 'ADD_NODE':
    case 'DISCONNECT_NODES':
    case 'ADD_NODE_ATTR':
    case 'REMOVE_NODE_ATTR':
    case 'MOVE_OBJECTS':
    case 'DELETE_OBJECTS':
    case 'ADD_LINK':
    case 'DELETE_LINK':
    case 'ADD_COMMENT':
    case 'EDIT_COMMENT':
    case 'ADD_COMMENT_ATTR':
    case 'REMOVE_COMMENT_ATTR':
      return Object.assign({}, state, {diagram: diagram(state.diagram, action)});
    default:
      return state;
  }
};

const palette = (state = {}, action) => {
  switch (action.type) {
    case 'CLEAR_PALETTE_DATA':
      return null;

    case 'SET_PALETTE_DATA':
      return Object.assign({}, action.data);

    default:
      return state;
  }
};

const selections = (state = [], action) => {
  switch (action.type) {
    case 'CLEAR_SELECTIONS':
      return [];

    case 'SET_SELECTIONS':
      return [...action.data];

    default:
      return state;
  }
};

const getInitialCanvas = () => {
  let uuid = getUUID();
  let time = new Date().milliseconds;
  let label = "New Canvas";

  return {
      className: "canvas-image",
      id: uuid,
      diagram: {},
      objectData: {created: time, updated: time, description: "", label: label} ,
      parents: [{id: uuid, label: label}],
      userData: {},
      zoom: 100
  };
};

const getUUID = () => {
  return uuid.v4();
};

const combinedReducer = combineReducers({canvas, palette, selections});
const store = createStore(combinedReducer);

store.dispatch({type:"CLEAR_CANVAS"});
store.dispatch({type:"CLEAR_PALETTE_DATA"});


export default class ObjectModel  {

  // Standard methods

  static dispatch(action) {
    store.dispatch(action);
  }

  static subscribe(callback) {
    store.subscribe(callback);
  }

  // Palette methods

  static clearPaletteData() {
    store.dispatch({type:"CLEAR_PALETTE_DATA"});
  }

  static setPaletteData(paletteData) {
    store.dispatch({type: "SET_PALETTE_DATA", data: paletteData });
  }

  static getPaletteData() {
    return store.getState().palette;
  }

  static getPaletteNode(nodeTypeId) {
    let outNodeType = null;
    ObjectModel.getPaletteData().categories.forEach((category) => {
      category.nodetypes.forEach((nodeType) => {
        if (nodeType.typeId === nodeTypeId) {
          outNodeType = nodeType;
        }
      });
    });
    return outNodeType;
  }

  // Canvas methods

  static clearCanvas() {
    this.clearSelection();
    store.dispatch({type:"CLEAR_CANVAS"});
  }

  static setCanvas(canvas) {
    this.clearSelection();
    store.dispatch({type: "SET_CANVAS", data: canvas });
  }

  static getCanvas() {
    return store.getState().canvas
  }

  // Node AND comment methods

  static moveObjects(data) {
    store.dispatch({type: "MOVE_OBJECTS", data: data});
  }

  static deleteObjects(source) {
    store.dispatch({type: "DELETE_OBJECTS", data: source});
  }

  static disconnectNodes(source) {
    // We only disconnect links to data nodes (not links to comments).
    let selectedNodeIds = this.filterDataNodes(source.selectedObjectIds)

    let newSource = Object.assign({}, source, {selectedNodeIds: selectedNodeIds});
    store.dispatch({type: "DISCONNECT_NODES", data: newSource});
  }

  // Node methods

  static createNode(data) {
    let nodeType = ObjectModel.getPaletteNode(data.nodeTypeId);
    if (nodeType !== null) {
      let info = {};
      info.id = getUUID();
      info.label = data.label;
      info.xPos = data.offsetX;
      info.yPos = data.offsetY;
      info.image = nodeType.image;
      info.inputPorts = nodeType.inputPorts || [];
      info.outputPorts = nodeType.outputPorts || [];
      store.dispatch({type: "ADD_NODE", data: info});
    }
  }

  static getNodes() {
    return this.getCanvas().diagram.nodes;
  }

  static addCustomAttrToNodes(objIds, attrName) {
    store.dispatch({type: "ADD_NODE_ATTR", data: {objIds: objIds, attrName: attrName}});
  }

  static removeCustomAttrFromNodes(objIds, attrName) {
    store.dispatch({type: "REMOVE_NODE_ATTR", data: {objIds: objIds, attrName: attrName}});
  }

  // Comment methods

  static createComment(source) {
    let info = {};
    info.id = getUUID();
    info.linkIds = [];
    info.mousePos = source.mousePos;
    info.selectedObjectIds = [];
    source.selectedObjectIds.forEach((objId) => {
      if (this.isDataNode(objId)) { // Only add links to data nodes, not comments
        info.selectedObjectIds.push(objId);
        info.linkIds.push(getUUID());
      }
    });
    store.dispatch({type: "ADD_COMMENT", data: info});
  }

  static getComments() {
    return this.getCanvas().diagram.comments;
  }

  static editComment(data) {
    store.dispatch({type: "EDIT_COMMENT", data: data});
  }

  static addCustomAttrToComments(objIds, attrName) {
    store.dispatch({type: "ADD_COMMENT_ATTR", data: {objIds: objIds, attrName: attrName}});
  }

  static removeCustomAttrFromComments(objIds, attrName) {
    store.dispatch({type: "REMOVE_COMMENT_ATTR", data: {objIds: objIds, attrName: attrName}});
  }

  // Link methods

  static deleteLink(source) {
    store.dispatch({type: "DELETE_LINK", data: source});
  }

  static linkNodes(data) {
    data.nodes.forEach((srcNodeId) => {
      data.targetNodes.forEach((trgNodeId) => {
        this.linkNodesById(srcNodeId, trgNodeId, data.linkType);
      });
    });
  }

  static linkNodesById(srcNodeId, trgNodeId, linkType) {
    if (ObjectModel.connectionIsAllowed(srcNodeId, trgNodeId)) {
      let info = {};
      info.id = getUUID();
      info.linkType = linkType;
      info.srcNodeId = srcNodeId;
      info.trgNodeId = trgNodeId;
      store.dispatch({type: "ADD_LINK", data: info});
    }

  }

  static linkComment(data) {
    data.nodes.forEach((srcNodeId) => {
      data.targetNodes.forEach((trgNodeId) => {
        let info = {};
        info.id = getUUID();
        info.linkType = data.linkType;
        info.srcNodeId = srcNodeId;
        info.trgNodeId = trgNodeId;
        store.dispatch({type: "ADD_LINK", data: info});
      });
    });
  }

  // Utility functions

 static getNode(nodeId) {
    let nodes = ObjectModel.getCanvas().diagram.nodes;
    return nodes.find((node) => {return (node.id === nodeId);});
  }

  static isDataNode(objId) {
    let node = ObjectModel.getNode(objId);
    return (typeof node != 'undefined'); // node will be undefined if objId references a comment
  }

  // Filters data node IDs from the list of IDs passed in and returns them
  // in a new array. That is, the result array doesn't contain any comment IDs.
  static filterDataNodes(objectIds) {
    return objectIds.filter((objId) => {
      return this.isDataNode(objId);
    });
  }

  static connectionIsAllowed(srcNodeId, trgNodeId) {
    if (srcNodeId === trgNodeId) {
      return false;
    }

    let links = ObjectModel.getCanvas().diagram.links;

    let srcNode = ObjectModel.getNode(srcNodeId);
    let trgNode = ObjectModel.getNode(trgNodeId);

    let srcCount = 0;
    let trgCount = 0;
    links.forEach((link) => {
      // Only count for links that are between data nodes
      // i.e. don't count for links from/to comments.
      if (this.isDataNode(link.source) &&
          this.isDataNode(link.target)) {
        if (link.source === srcNodeId) {
          srcCount++;
        }
        if (link.target === trgNodeId) {
          trgCount++;
        }
      }
    });

    if (srcCount < srcNode.outputPorts.length &&
        trgCount < trgNode.inputPorts.length) {
      return true;
    }

    return false;
  }

  // Methods to handle selections

  static clearSelection() {
    store.dispatch({type: "CLEAR_SELECTIONS"});
  }

  static getSelectedObjectIds() {
    return store.getState().selections
  }

  static selectAll() {
    let selections = [];
    for (let node of this.getNodes()) {
      selections.push(node.id);
    }
    for (let comment of this.getComments()) {
      selections.push(comment.id);
    }
    store.dispatch({type: "SET_SELECTIONS", data: selections});
  }

  static isSelected(objectId) {
    return this.getSelectedObjectIds().indexOf(objectId) >= 0;
  }

  static selectInRegion(minX, minY, maxX, maxY) {
    var selections = [];
    for (let node of this.getNodes()) {
      if (node.xPos > minX && node.xPos < maxX && node.yPos > minY && node.yPos < maxY) {
        selections.push(node.id);
      }
    }
    for (let comment of this.getComments()) {
      if (comment.xPos > minX && comment.xPos < maxX && comment.yPos > minY && comment.yPos < maxY) {
        selections.push(comment.id);
      }
    }
    store.dispatch({type: "SET_SELECTIONS", data: selections});

    return this.getSelectedObjectIds();
  }

  // Either sets the target object as selected and removes any other
  // selections or leaves as selected if this object is already selected.
  static ensureSelected(objectId) {
    let selections = this.getSelectedObjectIds();

    // If the operation is about to be done to a non-selected object,
    // make it the only selected object.
    if (selections.indexOf(objectId) < 0) {
      selections = [objectId];
    }
    store.dispatch({type: "SET_SELECTIONS", data: selections});

    return this.getSelectedObjectIds();
  }

  static toggleSelection(objectId, toggleSelection) {
    let selections = [objectId]

    if (toggleSelection) {
      // If already selected then remove otherwise add
      if (this.isSelected(objectId)) {
				selections = this.getSelectedObjectIds();
				let index = selections.indexOf(objectId);
        selections.splice(index, 1);
      }
      else {
        selections = this.getSelectedObjectIds().concat(objectId);
      };
    }
    store.dispatch({type: "SET_SELECTIONS", data: selections});

    return this.getSelectedObjectIds();
  }

	static findNodesInSubGraph(startNodeId,endNodeId,selection) {
		let retval = false;

		selection.push(startNodeId);
		if (startNodeId === endNodeId) {
			retval = true;
		} else {
			let links = ObjectModel.getCanvas().diagram.links;
			for (let link of links) {
				if (link.source == startNodeId) {
					let newRetval = this.findNodesInSubGraph(link.target,endNodeId,selection);
					if(newRetval !== true) {
						 selection.pop();
					}
					// this handles the case where there are multiple outward paths.
					// some of the outward paths coule be true and some false
					// this will make sure that the node is in the selection list of one of the paths
					// contains the end nodeId.
					retval = retval || newRetval;
				}
			}
		}

		return retval;
	}


	static selectSubGraph(endNodeId) {
		var selection = [endNodeId];
		let currentSelectedObjects = this.getSelectedObjectIds();

		// geta ll the nodes in the path from a currently selected object to the end node
		for (let startNodeId of currentSelectedObjects) {
			this.findNodesInSubGraph(startNodeId,endNodeId,selection);
		}

		// do not put multiple copies of a nodeId in selected nodeId list.
		let selectedObjectIds = this.getSelectedObjectIds();
		for (let selected of selection) {
			if (!this.isSelected(selected)) {
				selectedObjectIds.push(selected);
			}
		}

		store.dispatch({type: "SET_SELECTIONS", data: selectedObjectIds});

		return this.getSelectedObjectIds();
	}
}
