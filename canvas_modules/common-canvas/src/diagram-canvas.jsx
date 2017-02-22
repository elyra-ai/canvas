/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from 'react';
import ReactDOM from 'react-dom';

import Node from './node.jsx';
import Comment from './comment.jsx';
import SVGCanvas from './svg-canvas.jsx';
import CommonContextMenu from './common-context-menu.jsx';
import ContextMenuWrapper from './context-menu-wrapper.jsx';
import {DND_DATA_TEXT, DRAG_MOVE, DRAG_LINK, DRAG_SELECT_REGION} from '../constants/common-constants.js';
import CanvasUtils from '../utils/canvas-utils.js';


const NODE_BORDER_SIZE = 2; // see main.css, .canvas-node
const CELL_SIZE = 48;
const NODE_WIDTH = 96;
const NODE_HEIGHT = 80;
const ICON_SIZE = 48;
const FONT_SIZE = 10; // see main.css, .canvas-node p
const SELECT_REGION_DATA = "[]";


const ZOOM_FACTORS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.4];
const INITIAL_ZOOM_OFFSET = 6;  // corresponds to ZOOM_FACTOR[6] which is 1.0

export default class DiagramCanvas extends React.Component {
  constructor(props) {
    super(props);

    let selectedObjects = [];
    // console.log("DiagramCanvas: initial selection=" + props.initialSelection);
    if (props.initialSelection != undefined && props.initialSelection != null) {
      // console.log("DiagramCanvas: setting initial selection");
      selectedObjects = props.initialSelection;
    }

    this.state = {
      nodes: [],
      selectedObjects: selectedObjects,
      sourceNodes: [],
      targetNodes: [],
      showContextMenu: false,
      contextMenuInfo: {},
      dragging: false,
      dragMode: null,
	  editCommentInfo: {},
      zoom: INITIAL_ZOOM_OFFSET
    };

    this.connectorType == "curve"; // "straight", "curve" or "elbow"
    this.getConnectorPath = this.getConnectorPath.bind(this);

    this.drop = this.drop.bind(this);
    this.dragOver = this.dragOver.bind(this);

    this.dragStart = this.dragStart.bind(this);
    this.drag = this.drag.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.canvasClicked = this.canvasClicked.bind(this);
    this.canvasDblClick = this.canvasDblClick.bind(this);

    this.isDragging = this.isDragging.bind(this);

    this.isSelected = this.isSelected.bind(this);

    this.deleteObjects = this.deleteObjects.bind(this);
    this.disconnectNodes = this.disconnectNodes.bind(this);
    this.moveNodes = this.moveNodes.bind(this);

    this.getSelectedObjectCount = this.getSelectedObjectCount.bind(this);
    this.getSelectedObjectIds = this.getSelectedObjectIds.bind(this);
    this.getSelectedObjects = this.getSelectedObjects.bind(this);

    this.createTempNode = this.createTempNode.bind(this);
    this.deleteTempNode = this.deleteTempNode.bind(this);

    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);

    this.canvasContextMenu = this.canvasContextMenu.bind(this);
    this.closeContextMenu = this.closeContextMenu.bind(this);
    this.handleClickOutsideContextMenu = this.handleClickOutsideContextMenu.bind(this);

    this.getConnctionArrowHeads = this.getConnctionArrowHeads.bind(this);
    this.createObjectStoreNodeAt = this.createObjectStoreNodeAt.bind(this);
  }

  componentDidMount() {
    // var markerNode = React.findDOMNode(this.refs.Triangle);
    // markerNode.setAttribute('markerWidth', 10);
    // markerNode.setAttribute('markerHeight', 10);
    // markerNode.setAttribute('refX', 9);
    // markerNode.setAttribute('refY', 5);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.initialSelection != undefined && newProps.initialSelection != null) {
      // console.log("DiagramCanvas: updating selection");
      this.setState({ selectedObjects: newProps.initialSelection });
    }
  }

  getConnctionArrowHeads(positions) {
      return this.props.diagram.links.map((link, ind) => {
          // console.log(link);
          var posFrom = positions[link.source];
          var posTo = positions[link.target];

          // Older diagrams where the comments don't have unique IDs may not
          // have the comment IDs set correctly which in turn means the
          // the 'posFrom' or 'posTo' settings many not be correct.
          // For now, simply discard the link so we can still show the
          // rest of the diagram.
          if (posFrom == undefined || posTo == undefined) {
              return null;
          }

          let data = {
              x1: posFrom.outX,
              y1: posFrom.y,
              x2: posTo.inX,
              y2: posTo.y
          }

          let arrow = CanvasUtils.getArrowheadPoints(data,this.zoom());

          let d = arrow.p1.x + "," + arrow.p1.y + " " + arrow.p2.x  + "," + arrow.p2.y  + " " + arrow.p3.x + "," + arrow.p3.y;

          return (<polyline fill="none" stroke="black" strokeWidth="2" points={d}/>);
      });


    }

  handleClickOutsideContextMenu(event) {
    if (this.state.showContextMenu) {
      this.closeContextMenu();
    }

    // This stops the canvasClicked function from being fired which would
    // clear any current selections.
    event.stopPropagation();
  }

  zoomIn() {
    let zoom = this.state.zoom + 1;
    if (zoom >= ZOOM_FACTORS.length) {
      zoom = ZOOM_FACTORS.length - 1;
    }
    this.setState({zoom: zoom});
  }

  zoomOut() {
    let zoom = this.state.zoom - 1;

    // Lower than this and things start to look funny...
    if (zoom < 0) {
      zoom = 0;
    }
    this.setState({zoom: zoom});
  }

  zoom() {
    return ZOOM_FACTORS[this.state.zoom];
  }

  // minInitialLine is the size of the vertical line protruding from the source
  // or target handles when such a line is required for drawing connectors.
  minInitialLine() {
    return Math.round(30 * this.zoom());
  }

  elbowSize() {
    return Math.round(10 * this.zoom());
  }

  // ----------------------------------

  // Event utility methods

  getDNDJson(event) {
    try {
      return JSON.parse(event.dataTransfer.getData(DND_DATA_TEXT));
    }
    catch (e) {
      console.log(e);
      return null;
    }
  }

  mouseCoords(event) {
    //console.log("mouseCoords");
    let rect = event.currentTarget.getBoundingClientRect();
    //console.log(event.clientX);
    //console.log(event.clientY);
    //console.log(rect);
    return {
      x: event.clientX - Math.round(rect.left),
      y: event.clientY - Math.round(rect.top)
    };

    /*
    return {
      x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: event.clientY + document.body.scrollTop - document.body.clientTop
    };
    */
  }

  getPosition(element) {
    //console.log("getPosition");
    //console.log(element);
    var left = 0;
    var top = 0;
    while (element.offsetParent) {
      left += element.offsetLeft;
      top += element.offsetTop;
      element = element.offsetParent;
    }
    return { x: Math.round(left), y: Math.round(top) };
  }

  isDragging() {
    return this.refs.svg_canvas.isDragging();
  }

  // ----------------------------------

  // Mouse event Handlers

  drop(event) {
    // console.log("DiagramCanvas.drop(): x=" + event.clientX + ",y=" + event.clientY + ", target=" + event.target + ", currentTarget=" + event.currentTarget);
    // console.log("DiagramCanvas.drop(): page x=" + event.pageX + ",page y=" + event.pageY);
    // console.log(event);

    event.preventDefault();
    //event.stopPropagation();

    let jsVal = this.getDNDJson(event);
    let zoom = this.zoom();
    if (jsVal !== null) {
      let canvas = this.refs.svg_canvas;
      if (canvas.isDragging()) {
        let dragMode = canvas.getDragMode();
        let dragBounds = canvas.getDragBounds();
        if (dragMode == DRAG_SELECT_REGION) {
          let minX = Math.round(Math.min(dragBounds.startX, dragBounds.endX) / zoom) - (NODE_WIDTH / 2);
          let minY = Math.round(Math.min(dragBounds.startY, dragBounds.endY) / zoom) - (NODE_HEIGHT / 2);
          let maxX = Math.round(Math.max(dragBounds.startX, dragBounds.endX) / zoom) - (NODE_WIDTH / 2);
          let maxY = Math.round(Math.max(dragBounds.startY, dragBounds.endY) / zoom) - (NODE_HEIGHT / 2);
          this.selectInRegion(minX, minY, maxX, maxY);
        }
        else {
          if (jsVal.operation == 'link') {
            // Should already have been handled via a nodeAction() from the Node.drop()
          }
          else if (jsVal.operation == 'move') {
            this.moveNode(jsVal.id,
              Math.round((event.clientX - dragBounds.startX) / zoom),
              Math.round((event.clientY - dragBounds.startY) / zoom));
          }
        }
      }
      else if ((jsVal.operation == 'createFromTemplate') || jsVal.operation == 'createFromObject') {
        var mousePos = this.mouseCoords(event);
        // console.log(targetPos);
        // console.log(mousePos);
        this.createNodeAt(jsVal.typeId,
          jsVal.label,
          jsVal.sourceId,
          jsVal.sourceObjectTypeId,
          Math.round((mousePos.x - (NODE_WIDTH/2)) / zoom),
          Math.round((mousePos.y - (NODE_HEIGHT/2)) / zoom));
      }
      else if ((jsVal.operation == 'addToCanvas')) {
        var mousePos = this.mouseCoords(event);
        //console.log(targetPos);
        //console.log('addToCanvas :'+JSON.stringify(mousePos));
        this.createObjectStoreNodeAt(
          Math.round((mousePos.x - (NODE_WIDTH/2)) / zoom),
          Math.round((mousePos.y - (NODE_HEIGHT/2)) / zoom),
          jsVal.data);
      }
    }
  }

  dragOver(event) {
    // console.log("DiagramCanvas.dragOver: x=" + event.clientX + ",y=" + event.clientY);
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // event.target.style.cursor = 'move';
    if (this.isDragging()) {
      var mousePos = this.mouseCoords(event);
      this.refs.svg_canvas.notifyDragOver(mousePos.x, mousePos.y);
    }
  }

  dragStart(event) {
    // console.log("DiagramCanvas.dragStart(): x=" + event.clientX + ",y=" + event.clientY + ", target=" + event.target);
    // console.log(event.dataTransfer.getData(DND_DATA_TEXT));
    let selectRegion = (event.dataTransfer.getData(DND_DATA_TEXT) == "");

    let x = event.clientX;
    let y = event.clientY;

    let dragMode = null;

    // console.log(selectRegion);
    if (selectRegion) {
      // Need to force an update on the dataTransfer object
      event.dataTransfer.setData(DND_DATA_TEXT, SELECT_REGION_DATA);
      event.dataTransfer.setDragImage(this.refs.emptyDraggable, 0, 0);
      var mousePos = this.mouseCoords(event);
      x = mousePos.x;
      y = mousePos.y;
      dragMode = DRAG_SELECT_REGION;
    }
    else {
      let jsVal = this.getDNDJson(event);
      if (jsVal !== null) {
        if (jsVal.operation == 'link') {
          var mousePos = this.mouseCoords(event);
          x = mousePos.x;
          y = mousePos.y;
          dragMode = DRAG_LINK;
        }
        else {
          dragMode = DRAG_MOVE;
        }
      }
    }
    event.dataTransfer.effectAllowed = 'all';

    // console.log("dragStart: dragMode=" + dragMode);

    this.refs.svg_canvas.notifyDragStart(dragMode, x, y);
  }

  drag(event) {
    // console.log("DiagramCanvas.drag(): x=" + event.clientX + ",y=" + event.clientY);
    //event.dataTransfer.dropEffect = 'move';
  }

  dragEnd(event) {
    // console.log("DiagramCanvas.dragEnd(): x=" + event.clientX + ",y=" + event.clientY + ", target=" + event.target);

    this.refs.svg_canvas.notifyDragEnd();
  }

  canvasClicked(event) {
    // console.log("DiagramCanvas.canvasClicked(): x=" + event.clientX + ",y=" + event.clientY + ", target=" + event.target);
    // Don't clear the selection if the canvas context menu is up
    if (!this.state.showContextMenu) {
      this.clearSelection();
	  this.finalizedEditComment();
    }
  }

  canvasDblClick(event) {
    this.props.openPaletteMethod(event);
  }

  objectContextMenu(objectType, object, event) {
	// finalize edit of comments
    this.finalizedEditComment()

    let canvasDiv = document.getElementById("canvas-div");
    let rect = canvasDiv.getBoundingClientRect();

    let x = event.clientX - Math.round(rect.left);
    let y = event.clientY - Math.round(rect.top);

    event.preventDefault();

    // Either set the target object as selected and remove any other
    // selections or leave as selected if this object is already selected.
    const selectedObjectIds = this.ensureSelected(object.id);

    // Note: Use selectedObjectIds instead of this.state.selectedObjects below
    // because this.state.selectedObjects state change, made in ensureSelected,
    // may not by complete at this point.
    const cmInfo = this.props.contextMenuHandler({
      type: objectType,
      targetObject: object,
      selectedObjectIds: selectedObjectIds,
      mousePos: {x: x, y: y}});

    if (cmInfo !== null) {
      this.setState({showContextMenu: true, contextMenuInfo: cmInfo});
    }
  }

  canvasContextMenu(event) {
	// finalize edit of comments
    this.finalizedEditComment();

    let mousePos = this.mouseCoords(event);
    let selectedObjects = this.state.selectedObjects;

    event.preventDefault();

    let cmInfo = null;

    if (event.target.id == "" || event.target.id == "empty-canvas") {
      cmInfo = this.props.contextMenuHandler({
        type: "canvas",
        selectedObjectIds: selectedObjects,
        mousePos: mousePos});
    }

    else {
      // Assume it's a link
      cmInfo = this.props.contextMenuHandler({
        type: "link",
        id: event.target.id,
        mousePos: mousePos});
    }

    if (cmInfo !== null) {
      this.setState({showContextMenu: true, contextMenuInfo: cmInfo});
    }
  }

  // ----------------------------------
  // Action Handlers

  nodeAction(node, action, optionalArgs = []) {
    //console.log("nodeAction: " + action);
    //console.log(node);

    if (action == 'moveNode') {
      this.moveNode(node.id, optionalArgs[0], optionalArgs[1]);
    }
    else if (action == 'removeNode') {
      this.removeNode(node.id);
    }
    else if (action == 'nodeDblClicked') {
      this.nodeDblClicked(node.id);
    }
    else if (action == 'selected') {
      // The event is passed as the third arg
      this.selectObject(node.id, optionalArgs.shiftKey);
    }
    else if (action == 'dropOnNode' && this.isDragging()) {
      // The event is passed as the third arg
      // console.log('Handling dropOnNode:');
      let jsVal = this.getDNDJson(optionalArgs);
      // console.log(jsVal);
      if (jsVal != null) {
        if (jsVal.connType == 'connIn') {
          // If the drag started on an input connector, assume the drop target is the source
          this.linkSelected([node.id], [jsVal.id]);
        }
        else if (jsVal.connType == 'connOut') {
          // Otherwise if the drag started on an output connector, assume the drop target is the target
          this.linkSelected([jsVal.id], [node.id]);
        }
		else if (jsVal.connType == 'comment') {
          // Otherwise if the drag started on an output connector, assume the drop target is the target
          this.linkCommentSelected([jsVal.id], [node.id]);
        }
      }
    }
    else if (action == 'connIn') {
      this.inputLink(node.id);
    }
    else if (action == 'connOut') {
      this.outputLink(node.id);
    }
  }

  closeContextMenu() {
    this.setState({ showContextMenu: false, contextMenuInfo: {} });
  }

  contextMenuClicked(action) {
    if (action == 'CC_selectAll') {   // Common Canvas provided default action
      this.selectAll();
    } else {
      this.props.contextMenuActionHandler(action, this.state.contextMenuInfo.source);
    }

    this.closeContextMenu();
  }

  commentAction(comment, action, optionalArgs = []) {
    if (action == 'selected') {
      // The event is passed as the third arg
      this.selectObject(comment.id, optionalArgs.shiftKey);
	} else if (action == 'editComment') {
	  let editCommentInfo = {
	    id: comment.id,
	    text: comment.text
	  }
      this.setState({editCommentInfo: editCommentInfo});
    } else if (action == 'changeComment') {
      // save the new comment text change
      if (this.state.editCommentInfo.id == comment.id) {
        let editCommentInfo = {
         id: comment.id,
         text: optionalArgs.target.value
        }
        this.setState({editCommentInfo: editCommentInfo});
      }
    }
  }

  // ----------------------------------

  // Editing methods

  // Creates a new temporary node that is used by the drag and drop (from
  // the palette) code to display an image of the dragged node.
  createTempNode(paletteId) {
    //var paletteObj = this.getPaletteObject(paletteId);
    //let tempNode = this.canvasD3.createTempNode(paletteObj);
    //return tempNode;
    return null;
  }

  // Deletes the temporary node used by drag and drop code.
  deleteTempNode() {
    //this.canvasD3.deleteTempNode();
  }

  createNodeAt(nodeTypeId, label, sourceId, sourceObjectTypeId, x, y,data = {}) {
    var data = {};
    if (sourceId !== undefined) {
      data = {
        editType: "createNode",
        label: label,
        offsetX: x,
        offsetY: y,
        sourceObjectId: sourceId,
        sourceObjectTypeId: sourceObjectTypeId
      };
    }
    else {
      data = {
        editType: "createNode",
        nodeTypeId: nodeTypeId,
        label: label,
        offsetX: x,
        offsetY: y
      };
    }

    //console.log(data);
    this.props.editDiagramHandler(data);
  }


  createObjectStoreNodeAt(x, y,data) {
    //set coordinates
    data['offsetX'] = x;
    data['offsetY'] = y;

    //console.log('DiagramCanvas.createObjectStoreNodeAt data :'+JSON.stringify(data));
    this.props.editDiagramHandler(data);
  }

  removeNode(nodeId) {
    // console.log("removeNode()");
    this.deleteObjects(this.ensureSelected(nodeId));
  }

  disconnectNode(nodeId) {
    this.disconnectNodes(this.ensureSelected(nodeId));
  }

  moveNode(nodeId, offsetX, offsetY) {
    // console.log("moveNode():x=" + offsetX + ",y=" + offsetY);
    this.moveNodes(this.ensureSelected(nodeId), offsetX, offsetY);
  }

  nodeDblClicked(nodeId) {
    this.ensureSelected(nodeId);
    this.props.nodeDblClickedHandler(nodeId);
  }

  linkSelected(sources, targets) {
    this.setState({
      sourceNodes: [],
      targetNodes: []
    });
    this.props.editDiagramHandler({
      editType: 'linkNodes',
      nodes: sources,
      targetNodes: targets,
      linkType: 'data'
    });
  }

  linkCommentSelected(sources, targets) {
    this.props.editDiagramHandler({
      editType: 'linkComment',
      nodes: sources,
      targetNodes: targets,
      linkType: 'comment'
    });
  }

  inputLink(nodeId) {
    // console.log("inputLink()");
    if (this.state.targetNodes.indexOf(nodeId) >= 0) {
      // console.log("Do nothing");
    }
    else if (this.state.sourceNodes.length > 0) {
      // console.log("Time to link");
      // This is triggered by clicking on the input connector of
      // a node when multiple output connectors are selected. This signifies that
      // the user wants to link from the outputs of one or more nodes to the input
      // of a single target node.
      this.linkSelected(this.state.sourceNodes, [nodeId]);
    }
    else {
      // console.log("Add to targets");
      this.setState({
        targetNodes: this.state.targetNodes.concat(nodeId)
      })
    }
  }

  outputLink(nodeId) {
    //console.log("outputLink()");
    if (this.state.sourceNodes.indexOf(nodeId) >= 0) {
      // console.log("Do nothing");
    }
    else if (this.state.targetNodes.length > 0) {
      // console.log("Time to link");
      // This is triggered by clicking on the output connector of
      // a node when multiple inputs connectors are selected. This signifies that
      // the user wants to link to the inputs of one or more nodes from the output
      // of a single source node.
      this.linkSelected([nodeId], this.state.targetNodes);
    }
    else {
      // console.log("Add to sources");
      this.setState({
        sourceNodes: this.state.sourceNodes.concat(nodeId)
      })
    }
  }

  selectObject(objectId, toggleSelection) {
    // console.log("selectObject: " + objectId + ", toggle=" + toggleSelection);
    let index = this.state.selectedObjects.indexOf(objectId);

    if (toggleSelection) {
      // If already selected then remove otherwise add
      var selection = this.state.selectedObjects;
      if (index >= 0) {
        selection.splice(index, 1);
      }
      else {
        selection = selection.concat(objectId);
      };
      this.setState({
        selectedObjects: selection
      });
    }
    else {
      this.setState({
        selectedObjects: [objectId]
      });
    }

    // finalize edit of comments
    if (this.state.editCommentInfo.id !== undefined && objectId !== this.state.editCommentInfo.id) {
        this.finalizedEditComment()
    }
  }

  // Edit operation methods

  deleteObjects(nodeIds) {
    // console.log("deleteObjects(): " + nodeIds);
    this.props.editDiagramHandler({
      editType: 'deleteObjects',
      nodes: nodeIds
    })
  }

  disconnectNodes(nodeIds) {
    this.props.editDiagramHandler({
      editType: 'disconnectNodes',
      nodes: nodeIds
    });
  }

  moveNodes(nodeIds, offsetX, offsetY) {
    this.props.editDiagramHandler({
      editType: 'moveObjects',
      nodes: nodeIds,
      offsetX: offsetX,
      offsetY: offsetY
    })
  }

  finalizedEditComment() {
      if (this.state.editCommentInfo.id !== undefined) {
        var nodes = [this.state.editCommentInfo.id];
        this.props.editDiagramHandler({
          editType: 'editComment',
          nodes: nodes,
          label: this.state.editCommentInfo.text
        });

        this.setState({
          editCommentInfo: {}
        });
      }
    }

  // Utility methods


  selectInRegion(minX, minY, maxX, maxY) {
    // console.log("region: " + minX + "," + minY + " and " + maxX + "," + maxY);
    var selection = [];
    for (let node of this.props.diagram.nodes) {
      //console.log(node);
      if (node.xPos > minX && node.xPos < maxX && node.yPos > minY && node.yPos < maxY) {
        selection = selection.concat(node.id);
      }
    }
    for (let comment of this.props.diagram.comments) {
      //console.log(comment);
      if (comment.xPos > minX && comment.xPos < maxX && comment.yPos > minY && comment.yPos < maxY) {
        selection = selection.concat(comment.id);
      }
    }
    this.setState({
      selectedObjects: selection
    });
  }

  selectAll() {
    console.log("selectAll()");
    console.log(this.props.diagram.nodes);

    let selection = [];
    for (let node of this.props.diagram.nodes) {
      selection = selection.concat(node.id);
    }
    for (let comment of this.props.diagram.comments) {
      selection = selection.concat(comment.id);
    }
    console.log(selection);
    this.setState({
      selectedObjects: selection
    });
  }

  nodesByID(nodeIds) {
    let selection = [];
    for (let node of this.props.diagram.nodes) {
      //console.log(node);
      if (nodeIds.indexOf(node.id) >= 0) {
        selection = selection.concat(node);
      }
    }
    return selection;
  }

  isSelected(objectId) {
    return this.state.selectedObjects.indexOf(objectId) >= 0;
  }

  ensureSelected(objectId) {
    let selection = this.state.selectedObjects;

    // If the operation is about to be done to a non-selected object,
    // make it the only selected node.
    if (selection.indexOf(objectId) < 0) {
      selection = [objectId];
      this.setState({
        selectedObjects: selection
      });
    }

    return selection;
  }

  clearSelection() {
    // console.log("clearSelection()");
    this.setState({
      selectedObjects: []
    });
  }

  getSelectedObjectCount() {
    return this.state.selectedObjects.length;
  }

  getSelectedObjectIds() {
    return this.state.selectedObjects;
  }

  getSelectedObjects() {
    return this.nodesByID(this.state.selectedObjects);
  }

  // ----------------------------------

  // Rendering

  getConnPointOffsets(halfNodeWidth, halfIcon, connSize) {
    let sideOffset = halfNodeWidth - halfIcon - connSize;
    return {
      top: halfIcon - connSize/2 + NODE_BORDER_SIZE,
      inLeft: sideOffset,     // offset from left edge
      outRight: sideOffset    // offset from right edge
    };
  }

  getConnPoints(halfNodeWidth, halfIcon, connSize, zoom, node) {
    let iconCentreX = halfNodeWidth + Math.round(node.xPos * zoom);

    /*
    return {
      y: Math.round(node.yPos * zoom) + halfIcon,
      inX: iconCentreX,
      outX: iconCentreX
    };
    */

    return {
      y: Math.round(node.yPos * zoom) + halfIcon + NODE_BORDER_SIZE,
      inX: iconCentreX ,
      outX: iconCentreX ,
      midX: iconCentreX
    };
  }

  getConnectorPath(data) {
    return this.getCurvePath(data);

    /*
    console.log("path type=" + this.connectorType);
    if (this.connectorType == "curve") {
      console.log("curve path");
      return this.getCurvePath(data);
    } else if (this.connectorType == "elbow") {
      console.log("elbow path");
      return this.getElbowPath(data);
    } else {
      console.log("straight path");
      return this.getStraightPath(data, true);
    }
    */
  }

  // Returns the path string for the object passed in which descibes a
  // simple straight connector line and a jaunty zig zag line when the
  // source is further right than the target.
  getStraightPath(data, zigZag){
    let path = "";
    let xDiff = data.x2 - data.x1;
    let yDiff = data.y2 - data.y1;

    if (zigZag === false || (xDiff > 20 ||
        Math.abs(yDiff) < Math.round(NODE_HEIGHT * this.zoom()))) {
      path = "M " + data.x1 + " " + data.y1 + " L " + data.x2 + " " + data.y2;

    } else {
      let minInitialLine = this.minInitialLine();
      let corner1X = data.x1 + minInitialLine;
      let corner1Y = data.y1;
      let corner2X = data.x2 - minInitialLine;
      let corner2Y = data.y2;

      let centerLineY = corner2Y - (corner2Y - corner1Y)/2;

      path = "M " + data.x1 + " " + data.y1;
      path += " " + corner1X + " " + centerLineY;
      path += " " + corner2X + " " + centerLineY;
      path += " " + data.x2 + " " + data.y2;
    }

    return path;
  }


  getStraightPathForLinks(data){
    let path = "";
    path = "M " + data.x1 + " " + data.y1 + " L " + data.x2+ " " + data.y2;
    return path;
  }

  // Returns the path string for the object passed in which descibes a
  // simple curved connector line.
  getCurvePath(data) {
    let distance = Math.round((NODE_WIDTH/2) * this.zoom())
    let corner1X = data.x1 + (data.x2 - data.x1)/2;
    let corner1Y = data.y1;
    let corner2X = corner1X;
    let corner2Y = data.y2;

    let x = data.x2 - data.x1 - distance;

    if (x < 0) {
      corner1X = data.x1 + (distance * 4);
      corner2X = data.x2 - (distance * 4);
    }

    let path = "M " + data.x1 + " " + data.y1;
    path += "C " + corner1X + " " + corner1Y + " " + corner2X + " " + corner2Y + " " + data.x2 + " " + data.y2;
    return path;
  }

  // Returns the path string for the object passed in which descibes a
  // curved connector line using elbows and straight lines.
  getElbowPath(data) {
    let minInitialLine = this.minInitialLine();
    let corner1X = data.x1 + minInitialLine;
    let corner1Y = data.y1;
    let corner2X = corner1X;
    let corner2Y = data.y2;

    let xDiff = data.x2 - data.x1;
    let yDiff = data.y2 - data.y1;
    let elbowSize = this.elbowSize();
    let elbowYOffset = elbowSize;

    if (yDiff > (2 * elbowSize)) {
      elbowYOffset = elbowSize;
    }
    else if (yDiff < -(2 * elbowSize)) {
      elbowYOffset = -elbowSize;
    }
    else {
      elbowYOffset = yDiff/2;
    }

    // This is a special case where the source and target handles are very
    // close together.
    if (xDiff < (2 * minInitialLine) &&
        (yDiff < (4 * elbowSize) &&
         yDiff > -(4 * elbowSize))) {
      elbowYOffset = yDiff/4;
    }

    let elbowXOffset = elbowSize;
    let extraSegments = false;  // Indicates need for extra elbows and lines

    if (xDiff < (minInitialLine + elbowSize)) {
      extraSegments = true;
      corner2X = data.x2 - minInitialLine;
      elbowXOffset = elbowSize;
    }
    else if (xDiff < (2 * minInitialLine)) {
      extraSegments = true;
      corner2X = data.x2 - minInitialLine;
      elbowXOffset = -((xDiff-(2 * minInitialLine))/2);
    }
    else {
      elbowXOffset = elbowSize;
    }

    let path = "M " + data.x1 + " " + data.y1;

    path += "L " + (corner1X - elbowSize) + " " + corner1Y;
    path += "Q " + corner1X + " " + corner1Y + " "  + corner1X  + " " + (corner1Y + elbowYOffset);

    if (extraSegments === false) {
      path += "L " + corner2X + " " + (corner2Y - elbowYOffset);

    } else {
      let centerLineY = corner2Y - (corner2Y - corner1Y)/2;

      path += "L " + corner1X + " " + (centerLineY - elbowYOffset);
      path += "Q " + corner1X + " " + centerLineY + " "  + (corner1X - elbowXOffset) + " " + centerLineY;
      path += "L " + (corner2X + elbowXOffset) + " " + centerLineY;
      path += "Q " + corner2X + " " + centerLineY + " "  + corner2X  + " " + (centerLineY + elbowYOffset);
      path += "L " + corner2X + " " + (corner2Y - elbowYOffset);
    }

    path += "Q " + corner2X + " " + corner2Y + " " + " " + (corner2X + elbowSize) + " " + corner2Y;
    path += "L " + data.x2 + " " + data.y2;

    return path;
  }

  // makeLinks(positions) {
  //   let links = this.makeALinkSet(positions, false);
  //   let bknds = this.makeALinkSet(positions, true);
  //   return bknds.concat(links);
  // }

  makeLinksConnections(positions) {
    let links = this.makeALinkSet(positions, false);

    return links;
  }

  makeLinksBackgrounds(positions) {
    let bknds = this.makeALinkSet(positions, true);
    return bknds;
  }

  makeALinkSet(positions, isBackground) {
    return this.props.diagram.links.map((link, ind) => {
      // console.log(link);
      var posFrom = positions[link.source];
      var posTo = positions[link.target];

      // Older diagrams where the comments don't have unique IDs may not
      // have the comment IDs set correctly which in turn means the
      // the 'posFrom' or 'posTo' settings many not be correct.
      // For now, simply discard the link so we can still show the
      // rest of the diagram.
      if (posFrom == undefined || posTo == undefined) {
        return null;
      }

      var lineStyle;
      if (!isBackground) {
        if (link.linkType == "object") {
          lineStyle = "dependencyLineStyle";
        }
        else if (link.linkType == "comment") {
          lineStyle = "commentLineStyle";
        }
        else {
          lineStyle = "solidLineStyle";
        }
      } else {
        lineStyle = "backgroundLineStyle";
      }

      let d = null;
      let midX = null;
      let midY = Math.round(posFrom.y + ((posTo.y - posFrom.y) /2));
      let data = null;
      if (link.linkType == "comment") {
        data = {x1: posFrom.midX, y1: posFrom.y, x2: posTo.midX, y2: posTo.y};
        d = this.getStraightPath(data, false);
        midX = Math.round(posFrom.midX + ((posTo.midX - posFrom.midX) /2));
      }
      else {
        data = {x1: posFrom.outX, y1: posFrom.y, x2: posTo.inX, y2: posTo.y};

        let posHalo = CanvasUtils.getLinePointOnHalo(data,this.zoom());

        let dataForLine = {x1: posFrom.outX, y1: posFrom.y, x2: posHalo.x, y2: posHalo.y};

        d = this.getStraightPathForLinks(dataForLine);//this.getStraightPath(data, false);//this.getConnectorPath(data);
        midX = Math.round(posFrom.outX + ((posTo.inX - posFrom.outX) /2));
      }

//
      let that = this;
      let key = isBackground ? ind : ind + 10000;
      return (
        <path
          id={link.id}
          key={key}
          d={d}
          className={lineStyle}
        />
      );
    });
  }

  render() {
    // Hard code for now but should eventually be picked up from the diagram
    // once we're using Modeler 18.1.
    let zoom = this.zoom();

    let contextMenuWrapper = null;

    if (this.state.showContextMenu) {
      let contextMenu = <CommonContextMenu
        menuDefinition={this.state.contextMenuInfo.menuDefinition}
        contextHandler={this.contextMenuClicked.bind(this)}/>;

      contextMenuWrapper =
        <ContextMenuWrapper
          positionLeft={this.state.contextMenuInfo.source.mousePos.x}
          positionTop={this.state.contextMenuInfo.source.mousePos.y}
          contextMenu={contextMenu}
          handleClickOutside={
            this.handleClickOutsideContextMenu
          }/>
      ;
    }

    var viewNodes = [];
    var viewComments = [];
    var viewLinks = [];
    var positions = {};

    let iconSize = Math.max(Math.round(ICON_SIZE * zoom), 4);
    let halfIcon = iconSize / 2;
    let connSize = Math.max(2, Math.round((ICON_SIZE / 4) * zoom));
    let fontSize = Math.max(Math.round(FONT_SIZE * zoom) + 3, 8);
    let nodeWidth = Math.round(NODE_WIDTH * zoom);
    let halfNodeWidth = Math.round(NODE_WIDTH * zoom / 2);
    let nodeHeight = Math.round(NODE_HEIGHT * zoom);
    let maxX = 28 * nodeWidth;
    let maxY = 10 * nodeHeight;
    let connOffsets = this.getConnPointOffsets(halfNodeWidth, halfIcon, connSize);

    let uiconf = {
      nodeWidth: nodeWidth,
      nodeHeight: nodeHeight,
      iconSize: iconSize,
      fontSize: fontSize,
      connSize: connSize,
      connOffsets: connOffsets,
      zoom: zoom
    };

    // TODO - pass a ref to the canvas (or a size config) rather than passing
    // multiple, individual, identical size params to every node
    viewNodes = this.props.diagram.nodes.map((node) => {
      let x = Math.round(node.xPos * zoom);
      let y = Math.round(node.yPos * zoom);

      var viewNode = <Node
                key={node.id}
                node={node}
                uiconf={uiconf}
                nodeActionHandler={this.nodeAction.bind(this, node)}
                onContextMenu={this.objectContextMenu.bind(this, "node", node)}
                selected={this.state.selectedObjects.indexOf(node.id) >= 0}
                decorationActionHandler={this.props.decorationActionHandler}
                >
              </Node>;

      positions[node.id] = this.getConnPoints(halfNodeWidth, halfIcon, connSize, zoom, node);

      // Ensure canvas is big enough
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      return (
        viewNode
      );
    });

    viewComments = this.props.diagram.comments.map((comment) => {
      let x = Math.round(comment.xPos * zoom);
      let y = Math.round(comment.yPos * zoom);

      //console.log("Comment: " + comment.text);
      //console.log(comment);

	  var editable = false;
      if (this.state.editCommentInfo.id !== undefined ) {
          editable=(this.state.editCommentInfo.id == comment.id);
      }

      var viewComment = <Comment
                key={comment.id}
                comment={comment}
                zoom={zoom}
                fontSize={fontSize}
                commentActionHandler={this.commentAction.bind(this, comment)}
                onContextMenu={this.objectContextMenu.bind(this, "comment", comment)}
                selected={this.state.selectedObjects.indexOf(comment.id) >= 0}
				editable={editable}
                >
              </Comment>;

      positions[comment.id] = this.getConnPoints(Math.round(comment.width/2 * zoom), Math.round(comment.height/2 * zoom), 0, zoom, comment);

      // Ensure canvas is big enough
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      return (
        viewComment
      );
    });

    var parentStyle = {
      width:  maxX + (2 * nodeWidth),
      height: maxY + (2 * nodeHeight),
      margin: '10px',
      position: 'relative'
    };

    // Create the set of links to be displayed
    let connectionLinks = this.makeLinksConnections(positions);
    viewLinks = (this.makeLinksBackgrounds(positions)).concat(connectionLinks);
    let connectionArrowHeads = this.getConnctionArrowHeads(positions);

    let emptyDraggable = <div ref="emptyDraggable"></div>;
    let emptyCanvas = null;

    if (this.props.diagram.nodes.length == 0) {
      emptyCanvas = <div id="empty-canvas" onContextMenu={this.canvasContextMenu}> <img src='/canvas/images/blank_canvas.png'></img></div>;
    }
/*
<marker id="markerArrow" markerWidth={13} markerHeight={13} refX={2} refY={6} orient="auto">
  <path d="M2,2 L2,11 L10,6 L2,2" fill="#f00"/>
</marker>
*/

    // TODO - include link icons
    return (
      <div id="canvas-div" style={parentStyle}
          timestamp={this.props.diagram.timestamp}
          draggable='true'
          onDragOver={this.dragOver}
          onDrop={this.drop}
          onDrag={this.drag}
          onDragStart={this.dragStart}
          onDragEnd={this.dragEnd}
          onClick={this.canvasClicked}
          onDoubleClick={this.canvasDblClick}>
        {viewComments}
        {viewNodes}

        <SVGCanvas ref="svg_canvas" x="0" y="0" width="100%" height="100%" background-color="blue" zoom={zoom}
            onContextMenu={this.canvasContextMenu}>
          <defs>
            <marker id="markerCircle" markerWidth={42} markerHeight={42} refX={10} refY={10} markerUnits="strokeWidth">
              <circle cx={0} cy={0} r={20} fill="#f00"/>
            </marker>
            <marker id="markerArrow" markerWidth={13} markerHeight={13} refX={2} refY={6} orient="auto">
              <path d="M2,2 L2,11 L10,6 L2,2" fill="#f00"/>
            </marker>

            <marker id="Triangle" ref="Triangle" viewBox="0 0 20 20" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          {viewLinks}
          {connectionArrowHeads}
        </SVGCanvas>

        {emptyCanvas}
        {contextMenuWrapper}
        {emptyDraggable}
      </div>
    );
  }
}

DiagramCanvas.propTypes = {
  diagram: React.PropTypes.object,
  initialSelection: React.PropTypes.array,
  paletteJSON: React.PropTypes.object.isRequired,
  openPaletteMethod: React.PropTypes.func.isRequired,
  contextMenuHandler: React.PropTypes.func.isRequired,
  contextMenuActionHandler: React.PropTypes.func.isRequired,
  editDiagramHandler: React.PropTypes.func.isRequired,
  nodeDblClickedHandler: React.PropTypes.func.isRequired,
  decorationActionHandler: React.PropTypes.func.isRequired
};
